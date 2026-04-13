import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, Max, Min } from 'class-validator';

export class NearbyReportsDto {
  @ApiProperty({ example: 31.5017 })
  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat: number;

  @ApiProperty({ example: 34.4668 })
  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  lng: number;

  @ApiProperty({ example: 1000, description: 'Radius in meters' })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(50000)
  radius: number;
}
