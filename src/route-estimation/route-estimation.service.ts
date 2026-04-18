import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ExternalService } from '../external/external.service';
import { EstimateRouteDto } from './dto/estimate-route.dto';

@Injectable()
export class RouteEstimationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly externalService: ExternalService,
  ) {}

  async estimate(dto: EstimateRouteDto) {
    const baseRoute = await this.externalService.getRoutePreview(
      dto.origin,
      dto.destination,
    );

    const checkpoints = await this.prisma.checkpoint.findMany();
    const incidents = await this.prisma.incident.findMany({
      where: {
        status: {
          in: ['OPEN', 'VERIFIED'],
        },
      },
    });

    let addedMinutes = 0;
    const factors: string[] = [];

    if (dto.avoidCheckpoints) {
      const openCheckpoints = checkpoints.filter((c) => c.status === 'OPEN');

      if (openCheckpoints.length > 0) {
        addedMinutes += Math.min(openCheckpoints.length * 5, 20);
        factors.push(`${openCheckpoints.length} open checkpoints considered`);
      }
    }

    const severeIncidents = incidents.filter(
      (i) => i.severity === 'HIGH' || i.severity === 'MEDIUM',
    );

    if (severeIncidents.length > 0) {
      addedMinutes += severeIncidents.length * 6;
      factors.push(`${severeIncidents.length} active incidents considered`);
    }

    if (severeIncidents.length > 3) {
      factors.push('high congestion detected');
    }

    if (dto.avoidAreas?.length) {
      addedMinutes += dto.avoidAreas.length * 3;
      factors.push(`${dto.avoidAreas.length} avoid areas applied`);
    }

    const weather = await this.externalService.getWeather(
      dto.destination.lat,
      dto.destination.lng,
    );

    if (weather.condition !== 'Clear') {
      addedMinutes += 3;
      factors.push(`weather affected route: ${weather.condition}`);
    }

    return {
      distanceKm: baseRoute.distanceKm,
      durationMinutes: baseRoute.durationMinutes + addedMinutes,
      metadata: {
        baseDurationMinutes: baseRoute.durationMinutes,
        factors,
        constraintsApplied: {
          avoidCheckpoints: Boolean(dto.avoidCheckpoints),
          avoidAreasCount: dto.avoidAreas?.length ?? 0,
        },
      },
    };
  }
}