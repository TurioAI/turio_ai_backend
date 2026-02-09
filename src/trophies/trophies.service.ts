import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ShowcaseQueryDto } from './dto/showcase-query.dto';

type TrophyShowcaseItem = {
  id: string;
  titleKey: string;
  descriptionKey: string;
  imageKey: string;
  active: boolean;
  unlocked: boolean;
  earnedAt: Date | null;
};

type ShowcaseCursor = {
  unlockedOffset: number;
  lockedOffset: number;
};

function encodeCursor(cursor: ShowcaseCursor): string {
  return Buffer.from(JSON.stringify(cursor), 'utf8').toString('base64');
}

function decodeCursor(raw?: string): ShowcaseCursor | null {
  if (!raw) return null;
  try {
    const json = Buffer.from(raw, 'base64').toString('utf8');
    const parsed = JSON.parse(json) as Partial<ShowcaseCursor>;
    const unlockedOffset = Number(parsed.unlockedOffset ?? 0);
    const lockedOffset = Number(parsed.lockedOffset ?? 0);
    if (!Number.isFinite(unlockedOffset) || !Number.isFinite(lockedOffset)) return null;
    return {
      unlockedOffset: Math.max(0, Math.floor(unlockedOffset)),
      lockedOffset: Math.max(0, Math.floor(lockedOffset)),
    };
  } catch {
    return null;
  }
}


@Injectable()
export class TrophiesService {
  constructor(private readonly prisma: PrismaService) {}

  async getTrophyDetail(firebaseUid: string, trophyId: string) {
    const user = await this.prisma.user.findUnique({
      where: { firebaseUid },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const trophy = await this.prisma.trophy.findUnique({
      where: { id: trophyId },
      select: {
        id: true,
        titleKey: true,
        descriptionKey: true,
        imageKey: true,
        active: true,
      },
    });

    if (!trophy) {
      throw new NotFoundException('Trophy not found');
    }

    const userTrophy = await this.prisma.userTrophy.findUnique({
      where: {
        userId_trophyId: {
          userId: user.id,
          trophyId: trophy.id,
        },
      },
      select: {
        earnedAt: true,
      },
    });

    return {
      ...trophy,
      unlocked: !!userTrophy,
      earnedAt: userTrophy?.earnedAt ?? null,
    };
  }

  async getShowcase(firebaseUid: string, query?: ShowcaseQueryDto) {
    const user = await this.prisma.user.findUnique({
      where: { firebaseUid },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const limit = 10;
    const cursor = decodeCursor(query?.cursor);
    const unlockedOffset = cursor?.unlockedOffset ?? 0;
    const lockedOffset = cursor?.lockedOffset ?? 0;

    const unlocked = await this.prisma.userTrophy.findMany({
      where: {
        userId: user.id,
        trophy: { active: true },
      },
      orderBy: [{ earnedAt: 'desc' }, { id: 'desc' }],
      skip: unlockedOffset,
      take: limit,
      include: { trophy: true },
    });

    const items: TrophyShowcaseItem[] = unlocked.map((ut) => ({
      id: ut.trophy.id,
      titleKey: ut.trophy.titleKey,
      descriptionKey: ut.trophy.descriptionKey,
      imageKey: ut.trophy.imageKey,
      active: ut.trophy.active,
      unlocked: true,
      earnedAt: ut.earnedAt,
    }));

    const remaining = limit - items.length;

    if (remaining > 0) {
      const excludedIds = items.map((i) => i.id);

      const locked = await this.prisma.trophy.findMany({
        where: {
          active: true,
          id: { notIn: excludedIds },
          users: {
            none: {
              userId: user.id,
            },
          },
        },
        orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
        skip: lockedOffset,
        take: remaining,
      });

      const lockedItems: TrophyShowcaseItem[] = locked.map((trophy) => ({
        id: trophy.id,
        titleKey: trophy.titleKey,
        descriptionKey: trophy.descriptionKey,
        imageKey: trophy.imageKey,
        active: trophy.active,
        unlocked: false,
        earnedAt: null,
      }));

      items.push(...lockedItems);
    }

    const unlockedTotal = await this.prisma.userTrophy.count({
      where: { userId: user.id, trophy: { active: true } },
    });

    const lockedTotal = await this.prisma.trophy.count({
      where: {
        active: true,
        users: { none: { userId: user.id } },
      },
    });

    const servedUnlocked = unlocked.length;
    const servedLocked = Math.max(0, items.length - servedUnlocked);

    const nextUnlockedOffset = unlockedOffset + servedUnlocked;
    const nextLockedOffset = lockedOffset + servedLocked;

    const hasMoreUnlocked = nextUnlockedOffset < unlockedTotal;
    const hasMoreLocked = nextLockedOffset < lockedTotal;

    const nextCursor =
      hasMoreUnlocked || hasMoreLocked
        ? encodeCursor({
            unlockedOffset: nextUnlockedOffset,
            lockedOffset: nextLockedOffset,
          })
        : null;

    return { items, nextCursor };
  }

}
