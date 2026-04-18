import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  IncidentSeverity,
  IncidentStatus,
  Prisma,
} from '@prisma/client';
import { AlertsService } from '../../alerts/alerts.service';

@Injectable()
export class IncidentsService {
  private readonly logger = new Logger(IncidentsService.name);

  constructor(
    private prisma: PrismaService,
    private readonly alertsService: AlertsService,
  ) {}

  async create(data: {
    type: string;
    description: string;
    latitude: number;
    longitude: number;
    severity: IncidentSeverity;
    status: IncidentStatus;
    checkpointId?: string;
  }) {
    if (data.latitude < -90 || data.latitude > 90) {
      throw new HttpException('Invalid latitude', HttpStatus.BAD_REQUEST);
    }

    if (data.longitude < -180 || data.longitude > 180) {
      throw new HttpException('Invalid longitude', HttpStatus.BAD_REQUEST);
    }

    return this.prisma.incident.create({ data });
  }

  async findAll(params: {
    page?: number;
    limit?: number;
    status?: IncidentStatus;
    severity?: IncidentSeverity;
    type?: string;
    sort?: 'asc' | 'desc';
  }) {
    const { page, limit, status, severity, type, sort = 'desc' } = params;

    const pageNumber = Number(page) || 1;
    const limitNumber = Number(limit) || 10;
    const skip = (pageNumber - 1) * limitNumber;

    const trimmedType = type?.trim();
    const where: Prisma.IncidentWhereInput = {
      ...(status && { status }),
      ...(severity && { severity }),
      ...(trimmedType && {
        type: { equals: trimmedType, mode: 'insensitive' },
      }),
    };

    const total = await this.prisma.incident.count({ where });

    const data = await this.prisma.incident.findMany({
      skip,
      take: limitNumber,
      where,
      orderBy: {
        createdAt: sort,
      },
    });

    return {
      data,
      meta: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber),
      },
    };
  }

  async findOne(id: string) {
    const incident = await this.prisma.incident.findUnique({ where: { id } });
    if (!incident) {
      throw new HttpException(
        `Incident with id ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }
    return incident;
  }

  async verify(id: string) {
    const incident = await this.prisma.incident.findUnique({
      where: { id },
    });

    if (!incident) {
      throw new HttpException(
        `Incident with id ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    if (incident.status === IncidentStatus.CLOSED) {
      throw new HttpException(
        'Cannot verify a closed incident',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (incident.status === IncidentStatus.VERIFIED) {
      throw new HttpException(
        'Incident is already verified',
        HttpStatus.BAD_REQUEST,
      );
    }

    const updated = await this.prisma.incident.update({
      where: { id },
      data: { status: IncidentStatus.VERIFIED },
    });

    try {
      await this.alertsService.generateAlertsForVerifiedIncident(updated.id);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.warn(
        `Incident ${updated.id} verified but alert generation failed: ${msg}`,
      );
    }

    return updated;
  }

  async close(id: string) {
    const incident = await this.prisma.incident.findUnique({
      where: { id },
    });

    if (!incident) {
      throw new HttpException(
        `Incident with id ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    if (incident.status === IncidentStatus.CLOSED) {
      throw new HttpException(
        'Incident is already closed',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.prisma.incident.update({
      where: { id },
      data: { status: IncidentStatus.CLOSED },
    });
  }

  async update(id: string, data: any) {
    if (
      data.latitude !== undefined &&
      (data.latitude < -90 || data.latitude > 90)
    ) {
      throw new HttpException('Invalid latitude', HttpStatus.BAD_REQUEST);
    }

    if (
      data.longitude !== undefined &&
      (data.longitude < -180 || data.longitude > 180)
    ) {
      throw new HttpException('Invalid longitude', HttpStatus.BAD_REQUEST);
    }

    try {
      return await this.prisma.incident.update({
        where: { id },
        data,
      });
    } catch (err) {
      throw new HttpException(
        `Incident with id ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.incident.delete({
        where: { id },
      });
    } catch (err) {
      throw new HttpException(
        `Incident with id ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }
  }
}
