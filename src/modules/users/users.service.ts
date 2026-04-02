import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Role, User } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AdminUpdateUserDto } from './dto/admin-update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

const publicSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  phone: true,
  address: true,
  role: true,
  isBlocked: true,
  createdAt: true,
  updatedAt: true,
} as const;

export type PublicUser = Omit<User, 'password'>;

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  toPublicUser(user: User): PublicUser {
    const { password: _, ...rest } = user;
    return rest;
  }

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  create(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: Role;
  }) {
    return this.prisma.user.create({ data });
  }

  findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  findByIdPublic(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: publicSelect,
    });
  }

  /** Paginated admin list with optional role, block filter, and text search. */
  async findAllForAdmin(params: {
    skip: number;
    take: number;
    role?: Role;
    isBlocked?: boolean;
    search?: string;
  }) {
    const where: Prisma.UserWhereInput = {};
    if (params.role) {
      where.role = params.role;
    }
    if (typeof params.isBlocked === 'boolean') {
      where.isBlocked = params.isBlocked;
    }
    const q = params.search?.trim();
    if (q) {
      where.OR = [
        { email: { contains: q, mode: 'insensitive' } },
        { firstName: { contains: q, mode: 'insensitive' } },
        { lastName: { contains: q, mode: 'insensitive' } },
      ];
    }
    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: publicSelect,
        orderBy: { createdAt: 'desc' },
        skip: params.skip,
        take: params.take,
      }),
      this.prisma.user.count({ where }),
    ]);
    return {
      items,
      total,
      skip: params.skip,
      take: params.take,
    };
  }

  async adminUpdateUser(id: string, dto: AdminUpdateUserDto): Promise<PublicUser> {
    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('User not found');
    }
    if (dto.email !== undefined && dto.email !== existing.email) {
      const taken = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });
      if (taken) {
        throw new ConflictException('Email already in use');
      }
    }
    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        ...(dto.email !== undefined && { email: dto.email }),
        ...(dto.firstName !== undefined && { firstName: dto.firstName }),
        ...(dto.lastName !== undefined && { lastName: dto.lastName }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
        ...(dto.address !== undefined && { address: dto.address }),
        ...(dto.role !== undefined && { role: dto.role }),
      },
    });
    return this.toPublicUser(updated);
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.firstName !== undefined && { firstName: dto.firstName }),
        ...(dto.lastName !== undefined && { lastName: dto.lastName }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
        ...(dto.address !== undefined && { address: dto.address }),
      },
    });
    return this.toPublicUser(user);
  }

  async setBlocked(
    targetUserId: string,
    isBlocked: boolean,
  ): Promise<PublicUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: targetUserId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const updated = await this.prisma.user.update({
      where: { id: targetUserId },
      data: { isBlocked },
    });
    return this.toPublicUser(updated);
  }

  async removeUser(targetUserId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: targetUserId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.prisma.user.delete({ where: { id: targetUserId } });
    return { message: 'User deleted', id: targetUserId };
  }

  createRefreshToken(data: {
    tokenHash: string;
    userId: string;
    expiresAt: Date;
  }) {
    return this.prisma.refreshToken.create({ data });
  }

  findRefreshTokenByHash(tokenHash: string) {
    return this.prisma.refreshToken.findUnique({ where: { tokenHash } });
  }

  deleteRefreshTokenById(id: string) {
    return this.prisma.refreshToken.delete({ where: { id } });
  }

  deleteRefreshTokenByHash(tokenHash: string) {
    return this.prisma.refreshToken.deleteMany({ where: { tokenHash } });
  }

  deleteAllRefreshTokensForUser(userId: string) {
    return this.prisma.refreshToken.deleteMany({ where: { userId } });
  }

  createPasswordResetToken(data: {
    tokenHash: string;
    userId: string;
    expiresAt: Date;
  }) {
    return this.prisma.passwordResetToken.create({ data });
  }

  findPasswordResetTokenByHash(tokenHash: string) {
    return this.prisma.passwordResetToken.findUnique({
      where: { tokenHash },
    });
  }

  deletePasswordResetTokensForUser(userId: string) {
    return this.prisma.passwordResetToken.deleteMany({ where: { userId } });
  }

  updatePassword(userId: string, password: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { password },
    });
  }
}
