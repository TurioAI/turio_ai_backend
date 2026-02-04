import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { PrismaService } from 'src/prisma/prisma.service';
import { DecodedIdToken } from 'firebase-admin/auth';

@Injectable()
export class AuthService {
  constructor(
    @Inject('FIREBASE_ADMIN')
    private readonly firebaseAdmin: typeof admin,
    private readonly prisma: PrismaService
  ) {}

  async syncMe(firebaseUser: DecodedIdToken) {
    const firebaseUid = firebaseUser.uid;
    const email = firebaseUser.email ?? null;

    // OJO: en tokens a veces viene "name" o a veces "picture", "firebase" etc.
    const providerName =
      (firebaseUser as any).name ??
      (firebaseUser as any).displayName ??
      null;

    try {
      // Busca por firebaseUid primero
      const existingByUid = await this.prisma.user.findUnique({
        where: { firebaseUid },
      });

      if (existingByUid) {
        // Actualiza solo lo que sea "fuente de verdad" desde Firebase
        // y NO pises displayName si el usuario lo personalizó en tu app.
        return await this.prisma.user.update({
          where: { id: existingByUid.id },
          data: {
            email, // si cambia email en Firebase, lo reflejas
            // displayName: undefined, // no tocar
            // providerDisplayName: providerName, // <- solo si tienes este campo
          },
        });
      }

      // Si no existe por uid, intenta por email para "relink" controlado
      // (esto evita problemas si un usuario creó cuenta email/pass y luego google con mismo email)
      if (email) {
        const existingByEmail = await this.prisma.user.findUnique({
          where: { email },
        });

        if (existingByEmail) {
          return await this.prisma.user.update({
            where: { id: existingByEmail.id },
            data: {
              firebaseUid,
              // NO pises displayName; solo rellénalo si estaba vacío
              displayName: existingByEmail.displayName ?? providerName,
              // providerDisplayName: providerName, // <- si existe el campo
            },
          });
        }
      }

      // Si no existe por uid ni por email, crea nuevo
      return await this.prisma.user.create({
        data: {
          firebaseUid,
          email,
          // Para el nombre: en creación sí puedes usar el providerName como default
          displayName: providerName,
          role: 'user',
          // providerDisplayName: providerName, // <- si existe el campo
        },
      });
    } catch (error: any) {
      throw new BadRequestException(error.message || 'Failed to sync user');
    }
  }
}
