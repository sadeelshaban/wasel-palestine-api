import {
	BadRequestException,
	ConflictException,
	Injectable,
	NotFoundException,
	ServiceUnavailableException,
} from '@nestjs/common';
import { Prisma, ReportStatus, VoteType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReportDto } from './dto/create-report.dto';
import { FlagReportDto } from './dto/flag-report.dto';
import { ListReportsDto } from './dto/list-reports.dto';
import { NearbyReportsDto } from './dto/nearby-reports.dto';
import { VoteReportDto } from './dto/vote-report.dto';

@Injectable()
export class ReportsService {
	constructor(private readonly prisma: PrismaService) {}

	private buildReportWhere(filters: ListReportsDto): Prisma.ReportWhereInput {
		const where: Prisma.ReportWhereInput = {};
		if (filters.status) {
			where.status = filters.status;
		}
		if (filters.category) {
			where.category = filters.category;
		}
		return where;
	}

	private async ensureNotDuplicate(dto: CreateReportDto) {
		const duplicateRows = await this.prisma.$queryRaw<Array<{ id: string }>>`
			SELECT r.id
			FROM "Report" r
			WHERE r."createdAt" >= NOW() - INTERVAL '30 minutes'
				AND (
					6371000 * acos(
						cos(radians(${dto.latitude}))
						* cos(radians(r.latitude))
						* cos(radians(r.longitude) - radians(${dto.longitude}))
						+ sin(radians(${dto.latitude})) * sin(radians(r.latitude))
					)
				) <= 100
			LIMIT 1
		`;

		if (duplicateRows.length > 0) {
			throw new ConflictException(
				'Possible duplicate report found within 100 meters in the last 30 minutes',
			);
		}
	}

	async create(userId: string, dto: CreateReportDto) {
		await this.ensureNotDuplicate(dto);

		const report = await this.prisma.report.create({
			data: {
				userId,
				category: dto.category,
				description: dto.description,
				latitude: dto.latitude,
				longitude: dto.longitude,
			},
		});

		return {
			message: 'Report created successfully',
			data: report,
		};
	}

	async list(filters: ListReportsDto) {
		const page = filters.page ?? 1;
		const limit = filters.limit ?? 20;
		const where = this.buildReportWhere(filters);
		const skip = (page - 1) * limit;

		const [items, total] = await Promise.all([
			this.prisma.report.findMany({
				where,
				orderBy: { createdAt: 'desc' },
				skip,
				take: limit,
			}),
			this.prisma.report.count({ where }),
		]);

		return {
			data: items,
			meta: {
				total,
				page,
				limit,
				totalPages: Math.ceil(total / limit),
			},
		};
	}

	async findOne(id: string) {
		const report = await this.prisma.report.findUnique({
			where: { id },
			include: {
				_count: {
					select: {
						votes: true,
						flags: true,
					},
				},
			},
		});

		if (!report) {
			throw new NotFoundException('Report not found');
		}

		return { data: report };
	}

	async remove(id: string) {
		const report = await this.prisma.report.findUnique({ where: { id } });
		if (!report) {
			throw new NotFoundException('Report not found');
		}

		await this.prisma.report.delete({ where: { id } });
		return { message: 'Report deleted', data: { id } };
	}

	async vote(userId: string, reportId: string, dto: VoteReportDto) {
		const report = await this.prisma.report.findUnique({ where: { id: reportId } });
		if (!report) {
			throw new NotFoundException('Report not found');
		}

		const existingVote = await this.prisma.vote.findUnique({
			where: {
				userId_reportId: {
					userId,
					reportId,
				},
			},
		});

		if (existingVote) {
			throw new ConflictException('User has already voted for this report');
		}

		const vote = await this.prisma.vote.create({
			data: {
				userId,
				reportId,
				voteType: dto.voteType,
			},
		});

		return {
			message: 'Vote submitted successfully',
			data: vote,
		};
	}

	async flag(userId: string, reportId: string, dto: FlagReportDto) {
		const report = await this.prisma.report.findUnique({ where: { id: reportId } });
		if (!report) {
			throw new NotFoundException('Report not found');
		}

		const existingFlag = await this.prisma.flag.findFirst({
			where: {
				userId,
				reportId,
			},
		});
		if (existingFlag) {
			throw new ConflictException('User has already flagged this report');
		}

		const flag = await this.prisma.flag.create({
			data: {
				userId,
				reportId,
				reason: dto.reason,
			},
		});

		return {
			message: 'Report flagged successfully',
			data: flag,
		};
	}

	private async transitionStatus(reportId: string, nextStatus: ReportStatus) {
		const report = await this.prisma.report.findUnique({ where: { id: reportId } });
		if (!report) {
			throw new NotFoundException('Report not found');
		}
		if (report.status !== ReportStatus.PENDING) {
			throw new BadRequestException('Only pending reports can be moderated');
		}

		const updated = await this.prisma.report.update({
			where: { id: reportId },
			data: { status: nextStatus },
		});

		return {
			message: `Report ${nextStatus.toLowerCase()}`,
			data: updated,
		};
	}

	async approve(reportId: string) {
		return this.transitionStatus(reportId, ReportStatus.APPROVED);
	}

	async reject(reportId: string) {
		return this.transitionStatus(reportId, ReportStatus.REJECTED);
	}

	async nearby(query: NearbyReportsDto) {
		try {
			const rows = await this.prisma.$queryRaw<
				Array<{
					id: string;
					userId: string;
					category: string;
					description: string;
					latitude: number;
					longitude: number;
					status: ReportStatus;
					createdAt: Date;
					updatedAt: Date;
					distance_meters: number;
				}>
			>`
				SELECT
					r.id,
					r."userId",
					r.category,
					r.description,
					r.latitude,
					r.longitude,
					r.status,
					r."createdAt",
					r."updatedAt",
					ST_Distance(
						geography(ST_SetSRID(ST_MakePoint(r.longitude, r.latitude), 4326)),
						geography(ST_SetSRID(ST_MakePoint(${query.lng}, ${query.lat}), 4326))
					) AS distance_meters
				FROM "Report" r
				WHERE ST_DWithin(
					geography(ST_SetSRID(ST_MakePoint(r.longitude, r.latitude), 4326)),
					geography(ST_SetSRID(ST_MakePoint(${query.lng}, ${query.lat}), 4326)),
					${query.radius}
				)
				ORDER BY distance_meters ASC
			`;

			return {
				data: rows,
				meta: {
					radius: query.radius,
					origin: {
						lat: query.lat,
						lng: query.lng,
					},
					count: rows.length,
				},
			};
		} catch {
			throw new ServiceUnavailableException(
				'Nearby reports query requires PostGIS functions enabled in PostgreSQL',
			);
		}
	}

	async getVotesSummary(reportId: string) {
		const [upvotes, downvotes] = await Promise.all([
			this.prisma.vote.count({ where: { reportId, voteType: VoteType.UPVOTE } }),
			this.prisma.vote.count({ where: { reportId, voteType: VoteType.DOWNVOTE } }),
		]);
		return { upvotes, downvotes };
	}
}
