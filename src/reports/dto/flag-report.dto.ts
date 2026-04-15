import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class FlagReportDto {
  @ApiProperty({ example: 'Duplicate report in same location' })
  @IsString()
  @MinLength(3)
  @MaxLength(300)
  reason: string;
}
