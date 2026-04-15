import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, Max, MaxLength, Min } from 'class-validator';

export class CreateReportDto {
  @ApiProperty({ example: 'TRAFFIC' })
  @IsString()
  @MaxLength(100)
  category: string;

  @ApiProperty({ example: 'Heavy traffic buildup near checkpoint.' })
  @IsString()
  @MaxLength(1500)
  description: string;

  @ApiProperty({ example: 31.5017 })
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @ApiProperty({ example: 34.4668 })
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;
}
