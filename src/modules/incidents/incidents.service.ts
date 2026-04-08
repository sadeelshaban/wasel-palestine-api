import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { IncidentSeverity, IncidentStatus } from '@prisma/client';

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
    return this.prisma.incident.create({ data });
  }

  async findAll(params: { page?: number; limit?: number }) {
    const { page = 1, limit = 10 } = params;
    const skip = (page - 1) * limit;
    const total = await this.prisma.incident.count();
    const data = await this.prisma.incident.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
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
        data: { status: 'VERIFIED' },
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