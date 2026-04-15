import { Module } from '@nestjs/common';
import { RouteEstimationController } from './route-estimation.controller';
import { RouteEstimationService } from './route-estimation.service';
import { ExternalModule } from '../external/external.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [ExternalModule, PrismaModule],
  controllers: [RouteEstimationController],
  providers: [RouteEstimationService],
})
export class RouteEstimationModule {}