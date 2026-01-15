import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { I18nService } from './i18n.service';

@Controller('i18n')
export class I18nController {
  constructor(private readonly i18n: I18nService) {}

  @Get(':lang')
  getLang(
    @Res() res: Response,
    @Param('lang') lang: string,
    @Query('v') v?: string,
  ) {
    const clientVersion =
      v !== undefined && v !== '' && !Number.isNaN(Number(v))
        ? Number(v)
        : undefined;

    const payload = this.i18n.getLangWithVersion(lang, clientVersion);

    if (payload === null) {
      return res.status(304).send();
    }

    return res.status(200).json(payload);
  }
}
