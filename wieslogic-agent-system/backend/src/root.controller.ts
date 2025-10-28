import { Controller, Get } from '@nestjs/common';

@Controller()
export class RootController {
  @Get('/')
  welcome() {
    return {
      name: 'WiesLogic Backend',
      status: 'ok',
      docs: '/docs',
      health: '/health',
      apiBase: '/api/wieslogic',
    };
  }
}

