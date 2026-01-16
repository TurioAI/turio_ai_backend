import { Controller, Get, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { ThemeService } from './theme.service';

@Controller('theme')
export class ThemeController {
  constructor(private readonly themeService: ThemeService) {}

  @Get()
  async getTheme() {
    return this.themeService.getTheme();
  }

  @Get('version')
  async getVersion(@Query('have') have: string | undefined, @Res() res: Response) {
    const current = await this.themeService.getThemeVersion();

    if (!have) {
      return res.status(200).json({ version: current });
    }

    if (String(have) === String(current)) {
      return res.status(204).send();
    }

    return res.status(200).json({ version: current });
  }
}
