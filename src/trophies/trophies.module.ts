import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { TrophiesController } from './trophies.controller';
import { TrophiesService } from './trophies.service';
import { FirebaseModule } from 'src/firebase/firebase.module';

@Module({
  imports: [
    PrismaModule,
    FirebaseModule
],
  controllers: [TrophiesController],
  providers: [TrophiesService],
})
export class TrophiesModule {}
