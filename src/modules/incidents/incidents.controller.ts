import { Controller, Post, Body, Get, Param, Query, Patch,Put ,Delete} from '@nestjs/common';
import { IncidentsService } from './incidents.service';
import { IncidentSeverity, IncidentStatus } from '@prisma/client';

@Controller('incidents')
export class IncidentsController {
  constructor(private readonly incidentsService: IncidentsService) {}

  @Post()
  create(@Body() body: {
    type: string;
    description: string;
    latitude: number;
    longitude: number;
    severity: IncidentSeverity;
    status: IncidentStatus;
    checkpointId?: string;
  }) {
    return this.incidentsService.create(body);
  }

  @Get()
  findAll(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.incidentsService.findAll({
      page: Number(page),
      limit: Number(limit),
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.incidentsService.findOne(id);
  }

  @Patch(':id/verify')
  verify(@Param('id') id: string) {
    return this.incidentsService.verify(id);
  }

  @Patch(':id/close')
  close(@Param('id') id: string) {
    return this.incidentsService.close(id);
  }

  @Put(':id')
update(
  @Param('id') id: string,
  @Body() body: any,
) {
  return this.incidentsService.update(id, body);
}

@Delete(':id')
remove(@Param('id') id: string) {
  return this.incidentsService.remove(id);
}
}