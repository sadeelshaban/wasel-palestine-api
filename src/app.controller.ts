import { Controller, Get, Header, Redirect } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiExcludeController()
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Redirect('/gui')
  getRoot() {
    return { url: '/gui' };
  }

  @Get('gui')
  @Header('Content-Type', 'text/html; charset=utf-8')
  getGui(): string {
    return this.appService.getGuiHtml();
  }
}
