import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayloadUser } from '../common/decorators/current-user.decorator';
import { CreateReportDto } from './dto/create-report.dto';
import { ListReportsDto } from './dto/list-reports.dto';
import { VoteReportDto } from './dto/vote-report.dto';
import { FlagReportDto } from './dto/flag-report.dto';
import { ReportsRoles } from './reports-roles.decorator';
import { ReportsRolesGuard } from './reports-roles.guard';
import { NearbyReportsDto } from './dto/nearby-reports.dto';

@ApiTags('Reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create a report',
    description: '**Access:** `authenticated`',
  })
  create(
    @CurrentUser() me: JwtPayloadUser,
    @Body() dto: CreateReportDto,
  ) {
    return this.reportsService.create(me.userId, dto);
  }

  @Get()
  @ApiOperation({
    summary: 'List reports',
    description: '**Access:** `public` — supports pagination and filtering.',
  })
  list(@Query() query: ListReportsDto) {
    return this.reportsService.list(query);
  }

  @Get('nearby')
  @ApiOperation({
    summary: 'Find nearby reports',
    description: '**Access:** `public` — uses PostGIS ST_DWithin query.',
  })
  nearby(@Query() query: NearbyReportsDto) {
    return this.reportsService.nearby(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get report by ID', description: '**Access:** `public`' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.reportsService.findOne(id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), ReportsRolesGuard)
  @ReportsRoles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete report',
    description: '**Access:** `admin`',
  })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.reportsService.remove(id);
  }

  @Post(':id/vote')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Vote on report',
    description: '**Access:** `authenticated` — one vote per user per report.',
  })
  vote(
    @CurrentUser() me: JwtPayloadUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: VoteReportDto,
  ) {
    return this.reportsService.vote(me.userId, id, dto);
  }

  @Post(':id/flag')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Flag report',
    description: '**Access:** `authenticated` — one flag per user per report.',
  })
  flag(
    @CurrentUser() me: JwtPayloadUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: FlagReportDto,
  ) {
    return this.reportsService.flag(me.userId, id, dto);
  }

  @Post(':id/approve')
  @UseGuards(AuthGuard('jwt'), ReportsRolesGuard)
  @ReportsRoles('MODERATOR', 'ADMIN')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Approve report',
    description: '**Access:** `moderator` or `admin`',
  })
  approve(@Param('id', ParseUUIDPipe) id: string) {
    return this.reportsService.approve(id);
  }

  @Post(':id/reject')
  @UseGuards(AuthGuard('jwt'), ReportsRolesGuard)
  @ReportsRoles('MODERATOR', 'ADMIN')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Reject report',
    description: '**Access:** `moderator` or `admin`',
  })
  reject(@Param('id', ParseUUIDPipe) id: string) {
    return this.reportsService.reject(id);
  }
}
