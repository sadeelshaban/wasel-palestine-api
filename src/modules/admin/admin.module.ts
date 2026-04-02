import { Module } from '@nestjs/common';
import { AuditModule } from './audit.module';
import { AuditController } from './audit.controller';
import { HealthController } from './health.controller';

@Module({
  imports: [AuditModule],
  controllers: [AuditController, HealthController],
})
export class AdminModule {}
