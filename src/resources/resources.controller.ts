import { Controller, Get, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { ResourcesService } from './resources.service';

@Controller('resources')
export class ResourcesController {
  constructor(private readonly resourcesService: ResourcesService) {}

  @Get()
  async getResources() {
    return this.resourcesService.getResources();
  }

  @Get('version')
  async getVersion(@Query('have') have: string | undefined, @Res() res: Response) {
    const current = await this.resourcesService.getResourcesVersion();

    if (!have) {
      return res.status(200).json({ version: current });
    }

    if (String(have) === String(current)) {
      return res.status(204).send();
    }

    return res.status(200).json({ version: current });
  }
}
