import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { ShowcaseQueryDto } from './dto/showcase-query.dto';
import { TrophyIdParamDto } from './dto/trophy-id-param.dto';
import { TrophiesService } from './trophies.service';

@Controller('trophies')
@UseGuards(FirebaseAuthGuard)
export class TrophiesController {
  constructor(private readonly trophiesService: TrophiesService) {}

  @Get('showcase')
  @UseGuards(FirebaseAuthGuard)
  getShowcase(@Req() req, @Query() query: ShowcaseQueryDto) {
    return this.trophiesService.getShowcase(req.user.uid, query);
  }

  @Get(':id')
  getTrophyDetail(@Req() req: any, @Param() params: TrophyIdParamDto) {
    const firebaseUid = req.user.uid as string;
    return this.trophiesService.getTrophyDetail(firebaseUid, params.id);
  }
}
