import {
  Injectable,
  HttpException,
  HttpStatus,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { IncidentSeverity, IncidentStatus } from '@prisma/client';
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
    const incident = await this.prisma.incident.create({ data });

    if (incident.status === IncidentStatus.VERIFIED) {
      void this.alertsService
        .generateAlertsForVerifiedIncident(incident.id)
        .catch((error: unknown) => {
          this.logger.error(
            `Failed to generate alerts for incident ${incident.id}`,
            error instanceof Error ? error.stack : String(error),
          );
        });
    }

    return incident;
  }

    async findAll(params: { page?: number; limit?: number }) {
    const page = Number(params?.page ?? 1);
    const limit = Number(params?.limit ?? 10);

    const safePage = Number.isFinite(page) && page > 0 ? page : 1;
    const safeLimit = Number.isFinite(limit) && limit > 0 ? limit : 10;

    const skip = (safePage - 1) * safeLimit;
    const total = await this.prisma.incident.count();

    const data = await this.prisma.incident.findMany({
      skip,
      take: safeLimit,
      orderBy: { createdAt: 'desc' },
    });

    return {
      data,
      meta: {
        total,
        page: safePage,
        limit: safeLimit,
        totalPages: Math.ceil(total / safeLimit),
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
    const incident = await this.prisma.incident.findUnique({ where: { id } });
    if (!incident) {
      throw new HttpException(
        `Incident with id ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    const updatedIncident =
      incident.status === IncidentStatus.VERIFIED
        ? incident
        : await this.prisma.incident.update({
            where: { id },
            data: { status: IncidentStatus.VERIFIED },
          });

    void this.alertsService
      .generateAlertsForVerifiedIncident(updatedIncident.id)
      .catch((error: unknown) => {
        this.logger.error(
          `Failed to generate alerts for incident ${updatedIncident.id}`,
          error instanceof Error ? error.stack : String(error),
        );
      });

    return updatedIncident;
  }


  async close(id: string) {
    const exists = await this.prisma.incident.findUnique({ where: { id } });
    if (!exists) {
      throw new NotFoundException(`Incident with id ${id} not found`);
    }

    return this.prisma.incident.update({
      where: { id },
      data: { status: IncidentStatus.CLOSED },
    });
  }
}