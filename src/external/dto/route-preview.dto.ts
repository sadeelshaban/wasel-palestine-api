import {
  IsBoolean,
  IsNumber,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class PointDto {
  @IsNumber()
  lat: number;

  @IsNumber()
  lng: number;
}

export class RoutePreviewDto {
  @ValidateNested()
  @Type(() => PointDto)
  origin: PointDto;

  @ValidateNested()
  @Type(() => PointDto)
  destination: PointDto;

  @IsOptional()
  @IsBoolean()
  avoidCheckpoints?: boolean;
}