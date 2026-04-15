import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayloadUser } from '../common/decorators/current-user.decorator';
import { AlertsService } from './alerts.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { ListAlertFeedDto } from './dto/list-alert-feed.dto';
import { ListSubscriptionsDto } from './dto/list-subscriptions.dto';
import { MarkAlertReadDto } from './dto/mark-alert-read.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';

@ApiTags('Alerts')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
@Controller('alerts')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Post('subscribe')
  @ApiOperation({
    summary: 'Create alert subscription',
    description: '**Access:** `authenticated` — by location radius and optional category.',
  })
  subscribe(
    @CurrentUser() me: JwtPayloadUser,
    @Body() dto: CreateSubscriptionDto,
  ) {
    return this.alertsService.subscribe(me.userId, dto);
  }

  @Get()
  @ApiOperation({
    summary: 'List my subscriptions',
    description: '**Access:** `authenticated`',
  })
  list(
    @CurrentUser() me: JwtPayloadUser,
    @Query() query: ListSubscriptionsDto,
  ) {
    return this.alertsService.listSubscriptions(me.userId, query);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update subscription',
    description: '**Access:** `authenticated` — only owner can update.',
  })
  update(
    @CurrentUser() me: JwtPayloadUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSubscriptionDto,
  ) {
    return this.alertsService.updateSubscription(me.userId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete subscription',
    description: '**Access:** `authenticated` — only owner can delete.',
  })
  remove(
    @CurrentUser() me: JwtPayloadUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.alertsService.deleteSubscription(me.userId, id);
  }

  @Get('feed')
  @ApiOperation({
    summary: 'Get my alert feed',
    description: '**Access:** `authenticated` — newest first.',
  })
  feed(
    @CurrentUser() me: JwtPayloadUser,
    @Query() query: ListAlertFeedDto,
  ) {
    return this.alertsService.listFeed(me.userId, query);
  }

  @Put('feed/:id/read')
  @ApiOperation({
    summary: 'Mark alert as read/unread',
    description: '**Access:** `authenticated` — optional quality improvement.',
  })
  markRead(
    @CurrentUser() me: JwtPayloadUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: MarkAlertReadDto,
  ) {
    return this.alertsService.markRead(me.userId, id, dto);
  }
}
