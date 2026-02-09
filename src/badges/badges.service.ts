import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ShowcaseQueryDto } from './dto/showcase-query-dto';

type BadgeShowcaseItem = {
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
export class BadgesService {
  constructor(private readonly prisma: PrismaService) {}

  async getBadgeDetail(firebaseUid: string, badgeId: string) {
    const user = await this.prisma.user.findUnique({
      where: { firebaseUid },
      select: { id: true },
    });

    if (!user) throw new NotFoundException('User not found');

    const badge = await this.prisma.badge.findUnique({
      where: { id: badgeId },
      select: {
        id: true,
        titleKey: true,
        descriptionKey: true,
        imageKey: true,
        active: true,
      },
    });

    if (!badge) throw new NotFoundException('Badge not found');

    const userBadge = await this.prisma.userBadge.findUnique({
      where: {
        userId_badgeId: {
          userId: user.id,
          badgeId: badge.id,
        },
      },
      select: {
        earnedAt: true,
      },
    });

    return {
      ...badge,
      unlocked: !!userBadge,
      earnedAt: userBadge?.earnedAt ?? null,
    };
  }

  async getShowcase(firebaseUid: string, query?: ShowcaseQueryDto) {
    const user = await this.prisma.user.findUnique({
      where: { firebaseUid },
      select: { id: true },
    });

    if (!user) throw new NotFoundException('User not found');

    const limit = 10;
    const cursor = decodeCursor(query?.cursor);
    const unlockedOffset = cursor?.unlockedOffset ?? 0;
    const lockedOffset = cursor?.lockedOffset ?? 0;

    const unlocked = await this.prisma.userBadge.findMany({
      where: {
        userId: user.id,
        badge: { active: true },
      },
      orderBy: [{ earnedAt: 'desc' }, { id: 'desc' }],
      skip: unlockedOffset,
      take: limit,
      include: { badge: true },
    });

    const items: BadgeShowcaseItem[] = unlocked.map((ub) => ({
      id: ub.badge.id,
      titleKey: ub.badge.titleKey,
      descriptionKey: ub.badge.descriptionKey,
      imageKey: ub.badge.imageKey,
      active: ub.badge.active,
      unlocked: true,
      earnedAt: ub.earnedAt,
    }));

    const remaining = limit - items.length;

    if (remaining > 0) {
      const excludedIds = items.map((i) => i.id);

      const locked = await this.prisma.badge.findMany({
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

      const lockedItems: BadgeShowcaseItem[] = locked.map((badge) => ({
        id: badge.id,
        titleKey: badge.titleKey,
        descriptionKey: badge.descriptionKey,
        imageKey: badge.imageKey,
        active: badge.active,
        unlocked: false,
        earnedAt: null,
      }));

      items.push(...lockedItems);
    }

    const unlockedTotal = await this.prisma.userBadge.count({
      where: { userId: user.id, badge: { active: true } },
    });

    const lockedTotal = await this.prisma.badge.count({
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
