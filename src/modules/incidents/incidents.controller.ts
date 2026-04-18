import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { IncidentSeverity, IncidentStatus, Role } from '@prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { IncidentsService } from './incidents.service';

@ApiTags('Incidents')
@Controller('incidents')
export class IncidentsController {
  constructor(private readonly incidentsService: IncidentsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.MODERATOR, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create incident',
    description:
      '**Access:** `moderator` or `admin` (JWT). Course-aligned: only authorized staff create official incidents.',
  })
  create(
    @Body()
    body: {
      type: string;
      description: string;
      latitude: number;
      longitude: number;
      severity: IncidentSeverity;
      status: IncidentStatus;
      checkpointId?: string;
    },
  ) {
    return this.incidentsService.create(body);
  }

  @Get()
  @ApiOperation({
    summary: 'List incidents (paginated, filterable, sortable)',
    description:
      '**Access:** `public` — filter by `status`, `severity`, and case-insensitive `type`; sort `createdAt` with `sort=asc|desc`.',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'status', required: false, enum: IncidentStatus })
  @ApiQuery({ name: 'severity', required: false, enum: IncidentSeverity })
  @ApiQuery({
    name: 'type',
    required: false,
    type: String,
    example: 'closure',
    description: 'Incident type string (case-insensitive match)',
  })
  @ApiQuery({ name: 'sort', required: false, enum: ['asc', 'desc'] })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: IncidentStatus,
    @Query('severity') severity?: IncidentSeverity,
    @Query('type') type?: string,
    @Query('sort') sort?: 'asc' | 'desc',
  ) {
    return this.incidentsService.findAll({
      page: Number(page),
      limit: Number(limit),
      status,
      severity,
      type,
      sort: sort === 'asc' || sort === 'desc' ? sort : undefined,
    });
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get incident by id',
    description: '**Access:** `public`',
  })
  findOne(@Param('id') id: string) {
    return this.incidentsService.findOne(id);
  }

  @Patch(':id/verify')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.MODERATOR, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Verify incident',
    description:
      '**Access:** `moderator` or `admin` — sets status to VERIFIED and triggers subscriber alerts.',
  })
  verify(@Param('id') id: string) {
    return this.incidentsService.verify(id);
  }

  @Patch(':id/close')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.MODERATOR, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Close incident',
    description: '**Access:** `moderator` or `admin`',
  })
  close(@Param('id') id: string) {
    return this.incidentsService.close(id);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.MODERATOR, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update incident',
    description: '**Access:** `moderator` or `admin`',
  })
  update(@Param('id') id: string, @Body() body: any) {
    return this.incidentsService.update(id, body);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.MODERATOR, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete incident',
    description: '**Access:** `moderator` or `admin`',
  })
  remove(@Param('id') id: string) {
    return this.incidentsService.remove(id);
  }
}
