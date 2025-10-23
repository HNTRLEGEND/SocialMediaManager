import { Body, Controller, Get, Post } from '@nestjs/common';
import { ConfigType } from '@prisma/client';
import { ConfigsService } from './configs.service';
import { UpdateConfigDto } from './dto/update-config.dto';

@Controller('config')
export class ConfigsController {
  constructor(private readonly configsService: ConfigsService) {}

  @Get('n8n')
  getN8n() {
    return this.configsService.getConfig(ConfigType.N8N);
  }

  @Get('elevenlabs')
  getElevenLabs() {
    return this.configsService.getConfig(ConfigType.ELEVENLABS);
  }

  @Post('update')
  update(@Body() body: UpdateConfigDto) {
    return this.configsService.update(body);
  }
}
