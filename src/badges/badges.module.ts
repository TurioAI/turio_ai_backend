import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { FirebaseModule } from '../firebase/firebase.module';
import { BadgesController } from './badges.controller';
import { BadgesService } from './badges.service';

@Module({
  imports: [PrismaModule, FirebaseModule],
  controllers: [BadgesController],
  providers: [BadgesService],
})
export class BadgesModule {}
