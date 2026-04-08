import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CheckpointStatus } from '@prisma/client';

@Injectable()
export class CheckpointsService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    name: string;
    latitude: number;
    longitude: number;
    status: CheckpointStatus; 
  }) {
    return this.prisma.checkpoint.create({
      data,
    });
  }

  async findAll(page = 1, limit = 10) {
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    this.prisma.checkpoint.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    this.prisma.checkpoint.count(),
  ]);

  return {
    data,
    total,
    page,
    lastPage: Math.ceil(total / limit),
  };
}

  async findOne(id: string) {
    return this.prisma.checkpoint.findUnique({
      where: { id },
    });
  }

  async update(id: string, data: Partial<{
    name: string;
    latitude: number;
    longitude: number;
    status: CheckpointStatus;
  }>) {
    return this.prisma.checkpoint.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.checkpoint.delete({
      where: { id },
    });
  }

  async getHistory(id: string) {
    return this.prisma.checkpointStatusHistory.findMany({
      where: { checkpointId: id },
      orderBy: { createdAt: 'desc' },
    });
  }

  async addStatus(checkpointId: string, status: CheckpointStatus) {
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