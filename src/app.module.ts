// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FirebaseModule } from './firebase/firebase.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { I18nModule } from './i18n/i18n.module';
import { ThemeModule } from './theme/theme.module';
import { ResourcesModule } from './resources/resources.module';
import { TrophiesModule } from './trophies/trophies.module';
import { BadgesModule } from './badges/badges.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    FirebaseModule,
    AuthModule,
    I18nModule,
    ThemeModule,
    ResourcesModule,
    TrophiesModule,
    BadgesModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

