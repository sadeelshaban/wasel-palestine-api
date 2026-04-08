import { Body, Controller, Post, Get, Query, Param, Put, Delete } from '@nestjs/common';
import { CheckpointsService } from './checkpoints.service';
import { CheckpointStatus } from '@prisma/client';

@Controller('checkpoints')
export class CheckpointsController {
  constructor(private readonly checkpointsService: CheckpointsService) {}

  @Post()
  create(@Body() body: any) {
    return this.checkpointsService.create(body);
  }

  @Get()
  findAll(
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    return this.checkpointsService.findAll(
      Number(page) || 1,
      Number(limit) || 10,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.checkpointsService.findOne(id);
  }
@Delete(':id')
remove(@Param('id') id: string) {
  return this.checkpointsService.remove(id);
}

  @Put(':id')
update(
  @Param('id') id: string,
  @Body() body: any,
) {
  return this.checkpointsService.update(id, body);
}

@Post(':id/status')
addStatus(
  @Param('id') id: string,
  @Body('status') status: CheckpointStatus,
) {
  return this.checkpointsService.addStatus(id, status);
}

@Get(':id/history')
getHistory(@Param('id') id: string) {
  return this.checkpointsService.getHistory(id);
}
}