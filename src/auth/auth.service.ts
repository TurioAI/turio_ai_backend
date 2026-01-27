import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { DecodedIdToken } from 'firebase-admin/auth';
import { Prisma } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    @Inject('FIREBASE_ADMIN')
    private readonly firebaseAdmin: typeof admin,
    private readonly prisma: PrismaService
  ) {}

  async register(dto: RegisterDto) {
    try {
      const userRecord = await this.firebaseAdmin.auth().createUser({
        email: dto.email,
        password: dto.password,
        displayName: dto.displayName,
      });

      return {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
      };
    } catch (error: any) {
      throw new BadRequestException(error.message || 'Failed to register user');
    }
  }

  async login(dto: LoginDto) {
    try {
      const userRecord = await this.firebaseAdmin.auth().getUserByEmail(dto.email);
      const customToken = await this.firebaseAdmin.auth().createCustomToken(userRecord.uid);

      return {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
      };
    } catch (error: any) {
      throw new BadRequestException(error.message || 'Failed to login user');
    }
  }

  async getProfile(firebaseUser: DecodedIdToken) {
    const { uid, email, name } = firebaseUser;

    try {
      return await this.prisma.user.upsert({
        where: { firebaseUid: uid },
        update: {
          email: email ?? null,
          displayName: name ?? null,
        },
        create: {
          firebaseUid: uid,
          email: email ?? null,
          displayName: name ?? null,
          role: 'user',
        },
      });
    } catch (e: any) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002' &&
        email
      ) {
        const existing = await this.prisma.user.findUnique({ where: { email } });

        if (existing) {
          return await this.prisma.user.update({
            where: { id: existing.id },
            data: {
              firebaseUid: uid,
              displayName: name ?? existing.displayName,
            },
          });
        }
      }

      throw e;
    }
  }


}


