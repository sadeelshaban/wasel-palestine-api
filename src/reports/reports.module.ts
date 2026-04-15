import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { ReportsRolesGuard } from './reports-roles.guard';

@Module({
  controllers: [ReportsController],
  providers: [ReportsService, ReportsRolesGuard],
  exports: [ReportsService],
})
export class ReportsModule {}
