import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CheckpointStatus, Prisma } from '@prisma/client';

@Injectable()
export class CheckpointsService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    name: string;
    latitude: number;
    longitude: number;
    status: CheckpointStatus;
  }) {
    if (data.latitude < -90 || data.latitude > 90) {
      throw new HttpException('Invalid latitude', HttpStatus.BAD_REQUEST);
    }

    if (data.longitude < -180 || data.longitude > 180) {
      throw new HttpException('Invalid longitude', HttpStatus.BAD_REQUEST);
    }

    return this.prisma.checkpoint.create({
      data,
    });
  }

  async findAll(page = 1, limit = 10, status?: CheckpointStatus) {
    const skip = (page - 1) * limit;

    const where: Prisma.CheckpointWhereInput = {
      ...(status && { status }),
    };

    const [data, total] = await Promise.all([
      this.prisma.checkpoint.findMany({
        skip,
        take: limit,
        where,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.checkpoint.count({ where }),
    ]);

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
    const checkpoint = await this.prisma.checkpoint.findUnique({
      where: { id },
    });

    if (!checkpoint) {
      throw new HttpException('Checkpoint not found', HttpStatus.NOT_FOUND);
    }

    return checkpoint;
  }

  async update(
    id: string,
    data: Partial<{
      name: string;
      latitude: number;
      longitude: number;
      status: CheckpointStatus;
    }>,
  ) {
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
      return await this.prisma.checkpoint.update({
        where: { id },
        data,
      });
    } catch (err) {
      throw new HttpException('Checkpoint not found', HttpStatus.NOT_FOUND);
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.checkpoint.delete({
        where: { id },
      });
    } catch (err) {
      throw new HttpException('Checkpoint not found', HttpStatus.NOT_FOUND);
    }
  }

  async getHistory(id: string) {
    return this.prisma.checkpointStatusHistory.findMany({
      where: { checkpointId: id },
      orderBy: { createdAt: 'desc' },
    });
  }

  async addStatus(checkpointId: string, status: CheckpointStatus) {
  const checkpoint = await this.prisma.checkpoint.findUnique({
    where: { id: checkpointId },
  });

  if (!checkpoint) {
    throw new HttpException('Checkpoint not found', HttpStatus.NOT_FOUND);
  }

  if (checkpoint.status === status) {
    throw new HttpException(
      'Checkpoint already has this status',
      HttpStatus.BAD_REQUEST,
    );
  }

  await this.prisma.checkpointStatusHistory.create({
    data: {
      checkpointId,
      status,
    },
  });

  return this.prisma.checkpoint.update({
    where: { id: checkpointId },
    data: { status },
  });
}
}