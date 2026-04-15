import { IsNumberString } from 'class-validator';

export class WeatherQueryDto {
  @IsNumberString()
  lat: string;

  @IsNumberString()
  lng: string;
}