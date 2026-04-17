import {
  Injectable,
  HttpException,
  HttpStatus,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
<<<<<<< HEAD
import {
  IncidentSeverity,
  IncidentStatus,
  Prisma,
} from '@prisma/client';
=======
import { IncidentSeverity, IncidentStatus } from '@prisma/client';
import { AlertsService } from '../../alerts/alerts.service';
>>>>>>> 2f85236b6e27ab1b7df4282bb2f1f376887afa4b

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
<<<<<<< HEAD
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
    sort?: 'asc' | 'desc';
  }) {
    const {
      page,
      limit,
      status,
      severity,
      sort = 'desc',
    } = params;

    const pageNumber = Number(page) || 1;
    const limitNumber = Number(limit) || 10;
    const skip = (pageNumber - 1) * limitNumber;

    const where: Prisma.IncidentWhereInput = {
      ...(status && { status }),
      ...(severity && { severity }),
    };

    const total = await this.prisma.incident.count({ where });

    const data = await this.prisma.incident.findMany({
      skip,
      take: limitNumber,
      where,
      orderBy: {
        createdAt: sort,
      },
=======
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
>>>>>>> 2f85236b6e27ab1b7df4282bb2f1f376887afa4b
    });

    return {
      data,
      meta: {
        total,
<<<<<<< HEAD
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber),
=======
        page: safePage,
        limit: safeLimit,
        totalPages: Math.ceil(total / safeLimit),
>>>>>>> 2f85236b6e27ab1b7df4282bb2f1f376887afa4b
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
<<<<<<< HEAD
    try {
      return await this.prisma.incident.update({
        where: { id },
        data: { status: IncidentStatus.VERIFIED },
      });
    } catch (err) {
=======
    const incident = await this.prisma.incident.findUnique({ where: { id } });
    if (!incident) {
>>>>>>> 2f85236b6e27ab1b7df4282bb2f1f376887afa4b
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
<<<<<<< HEAD
    try {
      return await this.prisma.incident.update({
        where: { id },
        data: { status: IncidentStatus.CLOSED },
      });
    } catch (err) {
      throw new HttpException(
        `Incident with id ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }
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
=======
    const exists = await this.prisma.incident.findUnique({ where: { id } });
    if (!exists) {
      throw new NotFoundException(`Incident with id ${id} not found`);
>>>>>>> 2f85236b6e27ab1b7df4282bb2f1f376887afa4b
    }

    return this.prisma.incident.update({
      where: { id },
      data: { status: IncidentStatus.CLOSED },
    });
  }
}