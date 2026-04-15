import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class PointDto {
  @IsNumber()
  lat: number;

  @IsNumber()
  lng: number;
}

class AvoidAreaDto {
  @IsString()
  name: string;

  @IsNumber()
  lat: number;

  @IsNumber()
  lng: number;

  @IsNumber()
  radiusMeters: number;
}

export class EstimateRouteDto {
  @ValidateNested()
  @Type(() => PointDto)
  origin: PointDto;

  @ValidateNested()
  @Type(() => PointDto)
  destination: PointDto;

  @IsOptional()
  @IsBoolean()
  avoidCheckpoints?: boolean;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @ValidateNested({ each: true })
  @Type(() => AvoidAreaDto)
  avoidAreas?: AvoidAreaDto[];
}