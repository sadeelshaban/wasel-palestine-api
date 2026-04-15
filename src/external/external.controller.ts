import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ExternalService } from './external.service';
import { WeatherQueryDto } from './dto/weather-query.dto';
import { RoutePreviewDto } from './dto/route-preview.dto';

@ApiTags('External')
@Controller('external')
export class ExternalController {
  constructor(private readonly externalService: ExternalService) {}

  @Get('weather')
  @ApiOperation({
    summary: 'Get weather by coordinates',
    description: '**Access:** `public`',
  })
  getWeather(@Query() query: WeatherQueryDto) {
    return this.externalService.getWeather(
      Number(query.lat),
      Number(query.lng),
    );
  }

  @Post('route-preview')
  @ApiOperation({
    summary: 'Get basic route preview',
    description: '**Access:** `public`',
  })
  getRoutePreview(@Body() dto: RoutePreviewDto) {
    return this.externalService.getRoutePreview(dto.origin, dto.destination);
  }
}