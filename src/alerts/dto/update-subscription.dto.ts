import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class UpdateSubscriptionDto {
  @ApiPropertyOptional({ example: 31.5017 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @ApiPropertyOptional({ example: 34.4668 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number;

  @ApiPropertyOptional({ example: 1500, description: 'Radius in meters' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(100)
  @Max(100000)
  radiusMeters?: number;

  @ApiPropertyOptional({ example: 'TRAFFIC', description: 'Matches incident.type' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string;
}
