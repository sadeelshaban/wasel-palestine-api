import { ApiProperty } from '@nestjs/swagger';
import { VoteType } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class VoteReportDto {
  @ApiProperty({ enum: VoteType })
  @IsEnum(VoteType)
  voteType: VoteType;
}
