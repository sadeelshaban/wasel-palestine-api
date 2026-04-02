import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Put,
  Query,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayloadUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AuditService } from '../admin/audit.service';
import { AdminUpdateUserDto } from './dto/admin-update-user.dto';
import { BlockUserDto } from './dto/block-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly audit: AuditService,
  ) {}

  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get my profile',
    description: '**Access:** `authenticated`',
  })
  async getProfile(@CurrentUser() me: JwtPayloadUser) {
    const user = await this.usersService.findByIdPublic(me.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  @Patch('profile')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update my profile',
    description:
      '**Access:** `authenticated` — Optional: firstName, lastName, phone, address.',
  })
  async patchProfile(
    @CurrentUser() me: JwtPayloadUser,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(me.userId, dto);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'List all users (paginated)',
    description: '**Access:** `admin`',
  })
  @ApiQuery({ name: 'skip', required: false, example: 0 })
  @ApiQuery({
    name: 'take',
    required: false,
    example: 20,
    description: 'Max 100',
  })
  @ApiQuery({ name: 'role', required: false, enum: Role })
  @ApiQuery({
    name: 'isBlocked',
    required: false,
    description: '`true` or `false`',
    example: 'false',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search email, first name, or last name (case-insensitive)',
  })
  async listUsers(
    @Query('skip') skipRaw?: string,
    @Query('take') takeRaw?: string,
    @Query('role') roleRaw?: string,
    @Query('isBlocked') isBlockedRaw?: string,
    @Query('search') search?: string,
  ) {
    const skip = Math.max(0, parseInt(skipRaw ?? '0', 10) || 0);
    const take = Math.min(100, Math.max(1, parseInt(takeRaw ?? '20', 10) || 20));
    let role: Role | undefined;
    if (roleRaw !== undefined && roleRaw !== '') {
      if (roleRaw !== Role.USER && roleRaw !== Role.ADMIN) {
        throw new BadRequestException('role must be USER or ADMIN');
      }
      role = roleRaw as Role;
    }
    let isBlocked: boolean | undefined;
    if (isBlockedRaw === 'true') {
      isBlocked = true;
    } else if (isBlockedRaw === 'false') {
      isBlocked = false;
    }
    return this.usersService.findAllForAdmin({
      skip,
      take,
      role,
      isBlocked,
      search,
    });
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get user by ID',
    description: '**Access:** `admin`',
  })
  async getUser(@Param('id', ParseUUIDPipe) id: string) {
    const user = await this.usersService.findByIdPublic(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update user (admin)',
    description:
      '**Access:** `admin` — Partial update: email, names, phone, address, role.',
  })
  async adminUpdateUser(
    @CurrentUser() me: JwtPayloadUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AdminUpdateUserDto,
  ) {
    const updated = await this.usersService.adminUpdateUser(id, dto);
    await this.audit.log({
      actorUserId: me.userId,
      actorEmail: me.email,
      action: 'USER_UPDATED_BY_ADMIN',
      entityType: 'User',
      entityId: id,
      metadata: { fields: Object.keys(dto) },
    });
    return updated;
  }

  @Patch(':id/block')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Block or unblock user',
    description: '**Access:** `admin` — `isBlocked: true` freezes login.',
  })
  async blockUser(
    @CurrentUser() me: JwtPayloadUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: BlockUserDto,
  ) {
    if (id === me.userId) {
      throw new ForbiddenException('Cannot change your own block status here');
    }
    const updated = await this.usersService.setBlocked(id, dto.isBlocked);
    await this.audit.log({
      actorUserId: me.userId,
      actorEmail: me.email,
      action: dto.isBlocked ? 'USER_BLOCKED' : 'USER_UNBLOCKED',
      entityType: 'User',
      entityId: id,
      metadata: { targetUserId: id },
    });
    return updated;
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete user permanently',
    description: '**Access:** `admin`',
  })
  async deleteUser(
    @CurrentUser() me: JwtPayloadUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    if (id === me.userId) {
      throw new ForbiddenException('Cannot delete your own account');
    }
    const result = await this.usersService.removeUser(id);
    await this.audit.log({
      actorUserId: me.userId,
      actorEmail: me.email,
      action: 'USER_DELETED',
      entityType: 'User',
      entityId: id,
    });
    return result;
  }
}
