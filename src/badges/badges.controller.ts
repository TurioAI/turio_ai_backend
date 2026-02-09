import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { ShowcaseQueryDto } from '../trophies/dto/showcase-query.dto';
import { BadgeIdParamDto } from './dto/badge-id-param.dto';
import { BadgesService } from './badges.service';

@Controller('badges')
@UseGuards(FirebaseAuthGuard)
export class BadgesController {
  constructor(private readonly badgesService: BadgesService) {}

  @Get('showcase')
  getShowcase(@Req() req, @Query() query: ShowcaseQueryDto) {
    return this.badgesService.getShowcase(req.user.uid, query);
  }

  @Get(':id')
  getBadgeDetail(@Req() req: any, @Param() params: BadgeIdParamDto) {
    const firebaseUid = req.user.uid as string;
    return this.badgesService.getBadgeDetail(firebaseUid, params.id);
  }
}
