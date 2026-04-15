import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { IncidentSeverity, IncidentStatus } from '@prisma/client';
import { AlertsService } from '../../alerts/alerts.service';

@Injectable()
export class IncidentsService {
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
    return this.prisma.incident.create({ data });
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
    try {
      const incident = await this.prisma.incident.update({
        where: { id },
        data: { status: 'VERIFIED' },
      });

      await this.alertsService.generateAlertsForVerifiedIncident(incident.id);
      return incident;
    } catch (err) {
      throw new HttpException(
        `Incident with id ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }
  }


  async close(id: string) {
    try {
      return await this.prisma.incident.update({
        where: { id },
        data: { status: 'CLOSED' },
      });
    } catch (err) {
      throw new HttpException(
        `Incident with id ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }
  }
}