import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  IncidentSeverity,
  IncidentStatus,
  Prisma,
} from '@prisma/client';

@Injectable()
export class IncidentsService {
  constructor(private prisma: PrismaService) {}

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
    try {
      return await this.prisma.incident.update({
        where: { id },
        data: { status: IncidentStatus.VERIFIED },
      });
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
    }
  }
}