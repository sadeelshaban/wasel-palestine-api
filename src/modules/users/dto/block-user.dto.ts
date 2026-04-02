import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class BlockUserDto {
  @ApiProperty({ description: '`true` to block the user, `false` to unblock' })
  @IsBoolean()
  isBlocked: boolean;
}
