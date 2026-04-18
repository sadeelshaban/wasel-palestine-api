import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: {
            getGuiHtml: () => '<html></html>',
          },
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  it('should redirect root to /gui', () => {
    expect(appController.getRoot()).toEqual({ url: '/gui' });
  });

  it('should return GUI HTML', () => {
    expect(appController.getGui()).toContain('html');
  });
});
