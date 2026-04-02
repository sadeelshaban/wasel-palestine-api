import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'crypto';
import { Role } from '@prisma/client';
import { UsersService } from '../users/users.service';
import { AuditService } from '../admin/audit.service';
import { getJwtAccessExpiresSeconds } from '../../config/jwt.constants';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

const BCRYPT_ROUNDS = 10;
const REFRESH_DAYS = 30;

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly audit: AuditService,
  ) {}

  private hashOpaqueToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private newRefreshToken(): string {
    return randomBytes(48).toString('hex');
  }

  private newResetToken(): string {
    return randomBytes(32).toString('hex');
  }

  async register(dto: RegisterDto) {
    const exists = await this.usersService.findByEmail(dto.email);
    if (exists) {
      throw new BadRequestException('User already exists');
    }
    const password = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const user = await this.usersService.create({
      email: dto.email,
      password,
      firstName: dto.firstName,
      lastName: dto.lastName,
    });
    await this.audit.log({
      actorUserId: user.id,
      actorEmail: user.email,
      action: 'USER_REGISTER',
      entityType: 'User',
      entityId: user.id,
    });
    return this.usersService.toPublicUser(user);
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (user.isBlocked) {
      throw new UnauthorizedException('Account is blocked');
    }
    const ok = await bcrypt.compare(dto.password, user.password);
    if (!ok) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = await this.signAccessToken(user.id, user.email, user.role);
    const plainRefresh = this.newRefreshToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_DAYS);

    await this.usersService.createRefreshToken({
      tokenHash: this.hashOpaqueToken(plainRefresh),
      userId: user.id,
      expiresAt,
    });

    await this.audit.log({
      actorUserId: user.id,
      actorEmail: user.email,
      action: 'USER_LOGIN',
      entityType: 'User',
      entityId: user.id,
    });

    const accessSecs = getJwtAccessExpiresSeconds();
    return {
      accessToken,
      refreshToken: plainRefresh,
      expiresInSeconds: accessSecs,
      expiresIn: `${accessSecs}s`,
      user: this.usersService.toPublicUser(user),
    };
  }

  async refresh(refreshToken: string) {
    const tokenHash = this.hashOpaqueToken(refreshToken);
    const record = await this.usersService.findRefreshTokenByHash(tokenHash);
    if (!record || record.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
    const user = await this.usersService.findById(record.userId);
    if (!user || user.isBlocked) {
      throw new UnauthorizedException();
    }

    await this.usersService.deleteRefreshTokenById(record.id);

    const plainRefresh = this.newRefreshToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_DAYS);
    await this.usersService.createRefreshToken({
      tokenHash: this.hashOpaqueToken(plainRefresh),
      userId: user.id,
      expiresAt,
    });

    const accessToken = await this.signAccessToken(user.id, user.email, user.role);

    const accessSecs = getJwtAccessExpiresSeconds();
    return {
      accessToken,
      refreshToken: plainRefresh,
      expiresInSeconds: accessSecs,
      expiresIn: `${accessSecs}s`,
    };
  }

  async logout(refreshToken: string) {
    const tokenHash = this.hashOpaqueToken(refreshToken);
    await this.usersService.deleteRefreshTokenByHash(tokenHash);
    return { message: 'Logged out' };
  }

  async changePassword(userId: string, email: string, dto: ChangePasswordDto) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException();
    }
    const ok = await bcrypt.compare(dto.currentPassword, user.password);
    if (!ok) {
      throw new UnauthorizedException('Current password is incorrect');
    }
    const password = await bcrypt.hash(dto.newPassword, BCRYPT_ROUNDS);
    await this.usersService.updatePassword(userId, password);
    await this.usersService.deleteAllRefreshTokensForUser(userId);
    await this.audit.log({
      actorUserId: userId,
      actorEmail: email,
      action: 'PASSWORD_CHANGE',
      entityType: 'User',
      entityId: userId,
    });
    return { message: 'Password updated' };
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);
    const generic = {
      message:
        'If an account exists for this email, password reset instructions apply.',
    };
    if (!user) {
      return generic;
    }
    await this.usersService.deletePasswordResetTokensForUser(user.id);
    const plain = this.newResetToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);
    await this.usersService.createPasswordResetToken({
      tokenHash: this.hashOpaqueToken(plain),
      userId: user.id,
      expiresAt,
    });
    await this.audit.log({
      actorUserId: user.id,
      actorEmail: user.email,
      action: 'PASSWORD_RESET_REQUESTED',
      entityType: 'User',
      entityId: user.id,
    });

    if (process.env.NODE_ENV !== 'production') {
      return {
        ...generic,
        devResetToken: plain,
        note:
          'devResetToken is only returned outside production — connect email delivery for production.',
      };
    }
    return generic;
  }

  async resetPassword(token: string, newPassword: string) {
    const tokenHash = this.hashOpaqueToken(token);
    const row = await this.usersService.findPasswordResetTokenByHash(tokenHash);
    if (!row || row.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired reset token');
    }
    const password = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    await this.usersService.updatePassword(row.userId, password);
    await this.usersService.deletePasswordResetTokensForUser(row.userId);
    await this.usersService.deleteAllRefreshTokensForUser(row.userId);
    await this.audit.log({
      actorUserId: row.userId,
      action: 'PASSWORD_RESET_COMPLETED',
      entityType: 'User',
      entityId: row.userId,
    });
    return { message: 'Password has been reset. You can log in again.' };
  }

  private signAccessToken(userId: string, email: string, role: Role) {
    return this.jwtService.signAsync({
      sub: userId,
      email,
      role,
    });
  }
}
