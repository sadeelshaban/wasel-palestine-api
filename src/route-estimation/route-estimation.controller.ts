import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RouteEstimationService } from './route-estimation.service';
import { EstimateRouteDto } from './dto/estimate-route.dto';

@ApiTags('Route Estimation')
@Controller('routes')
export class RouteEstimationController {
  constructor(
    private readonly routeEstimationService: RouteEstimationService,
  ) {}

  @Post('estimate')
  @ApiOperation({
    summary: 'Estimate route between two locations',
    description: '**Access:** `public`',
  })
  estimate(@Body() dto: EstimateRouteDto) {
    return this.routeEstimationService.estimate(dto);
  }
}