import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
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
import { CheckpointStatus, Role } from '@prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CheckpointsService } from './checkpoints.service';

@ApiTags('Checkpoints')
@Controller('checkpoints')
export class CheckpointsController {
  constructor(private readonly checkpointsService: CheckpointsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.MODERATOR, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create checkpoint',
    description:
      '**Access:** `moderator` or `admin` — official registry entries.',
  })
  create(@Body() body: any) {
    return this.checkpointsService.create(body);
  }

  @Get()
  @ApiOperation({
    summary: 'List checkpoints (paginated, optional status filter)',
    description: '**Access:** `public` — optional `status` filters the registry.',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'status', required: false, enum: CheckpointStatus })
  findAll(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('status') status?: CheckpointStatus,
  ) {
    return this.checkpointsService.findAll(
      Number(page) || 1,
      Number(limit) || 10,
      status,
    );
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get checkpoint by id',
    description: '**Access:** `public`',
  })
  findOne(@Param('id') id: string) {
    return this.checkpointsService.findOne(id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.MODERATOR, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete checkpoint',
    description: '**Access:** `moderator` or `admin`',
  })
  remove(@Param('id') id: string) {
    return this.checkpointsService.remove(id);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.MODERATOR, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update checkpoint',
    description: '**Access:** `moderator` or `admin`',
  })
  update(@Param('id') id: string, @Body() body: any) {
    return this.checkpointsService.update(id, body);
  }

  @Post(':id/status')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.MODERATOR, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Append checkpoint status (history)',
    description:
      '**Access:** `moderator` or `admin` — records a new status transition.',
  })
  addStatus(
    @Param('id') id: string,
    @Body('status') status: CheckpointStatus,
  ) {
    return this.checkpointsService.addStatus(id, status);
  }

  @Get(':id/history')
  @ApiOperation({
    summary: 'List checkpoint status history',
    description: '**Access:** `public`',
  })
  getHistory(@Param('id') id: string) {
    return this.checkpointsService.getHistory(id);
  }
}
