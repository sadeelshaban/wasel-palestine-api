import {
	BadRequestException,
	ConflictException,
	HttpException,
	HttpStatus,
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

const REPORTS_PER_HOUR_LIMIT = 5;
const SPAM_WINDOW_MINUTES = 10;
const SPAM_REPORT_THRESHOLD = 3;
const SPAM_BLOCK_MINUTES = 15;
const DUPLICATE_WINDOW_MINUTES = 30;
const DUPLICATE_RADIUS_METERS = 100;
const DESCRIPTION_SIMILARITY_THRESHOLD = 0.4;
const FLAG_UNDER_REVIEW_THRESHOLD = 5;

@Injectable()
export class ReportsService {
	constructor(private readonly prisma: PrismaService) {}

	private normalizeText(text: string): string {
		return text
			.toLowerCase()
			.replace(/[^a-z0-9\s]/gi, ' ')
			.replace(/\s+/g, ' ')
			.trim();
	}

	private toKeywords(text: string): Set<string> {
		return new Set(
			this.normalizeText(text)
				.split(' ')
				.filter((word) => word.length > 2),
		);
	}

	private jaccardSimilarity(a: Set<string>, b: Set<string>): number {
		if (a.size === 0 || b.size === 0) {
			return 0;
		}

		let intersection = 0;
		for (const token of a) {
			if (b.has(token)) {
				intersection += 1;
			}
		}

		const union = a.size + b.size - intersection;
		return union === 0 ? 0 : intersection / union;
	}

	private isCategorySimilar(incomingCategory: string, existingCategory: string): boolean {
		const incoming = this.normalizeText(incomingCategory);
		const existing = this.normalizeText(existingCategory);

		if (!incoming || !existing) {
			return false;
		}

		return incoming === existing || incoming.includes(existing) || existing.includes(incoming);
	}

	private isDescriptionSimilar(incomingDescription: string, existingDescription: string): boolean {
		const incomingNormalized = this.normalizeText(incomingDescription);
		existingDescription = this.normalizeText(existingDescription);

		if (!incomingNormalized || !existingDescription) {
			return false;
		}

		if (
			incomingNormalized.includes(existingDescription) ||
			existingDescription.includes(incomingNormalized)
		) {
			return true;
		}

		const incomingKeywords = this.toKeywords(incomingDescription);
		const existingKeywords = this.toKeywords(existingDescription);
		const similarity = this.jaccardSimilarity(incomingKeywords, existingKeywords);

		return similarity >= DESCRIPTION_SIMILARITY_THRESHOLD;
	}

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

	private async enforceReportCreationLimits(userId: string) {
		const now = new Date();
		const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
		const spamWindowStart = new Date(now.getTime() - SPAM_WINDOW_MINUTES * 60 * 1000);

		const [reportsInLastHour, recentBurstCount, latestReport] = await Promise.all([
			this.prisma.report.count({
				where: {
					userId,
					createdAt: { gte: oneHourAgo },
				},
			}),
			this.prisma.report.count({
				where: {
					userId,
					createdAt: { gte: spamWindowStart },
				},
			}),
			this.prisma.report.findFirst({
				where: { userId },
				orderBy: { createdAt: 'desc' },
				select: { createdAt: true },
			}),
		]);

		if (reportsInLastHour >= REPORTS_PER_HOUR_LIMIT) {
			throw new HttpException(
				'Rate limit exceeded: max 5 reports per hour',
				HttpStatus.TOO_MANY_REQUESTS,
			);
		}

		if (recentBurstCount >= SPAM_REPORT_THRESHOLD && latestReport) {
			const blockedUntil = new Date(
				latestReport.createdAt.getTime() + SPAM_BLOCK_MINUTES * 60 * 1000,
			);
			if (blockedUntil > now) {
				throw new HttpException(
					`Spam protection active. You can submit again after ${blockedUntil.toISOString()}`,
					HttpStatus.TOO_MANY_REQUESTS,
				);
			}
		}
	}

	private async ensureNotDuplicate(dto: CreateReportDto) {
		const candidates = await this.prisma.$queryRaw<
			Array<{ id: string; category: string; description: string }>
		>`
			SELECT r.id
				, r.category
				, r.description
			FROM "Report" r
			WHERE r."createdAt" >= NOW() - (${DUPLICATE_WINDOW_MINUTES} * INTERVAL '1 minute')
				AND (
					6371000 * acos(
						cos(radians(${dto.latitude}))
						* cos(radians(r.latitude))
						* cos(radians(r.longitude) - radians(${dto.longitude}))
						+ sin(radians(${dto.latitude})) * sin(radians(r.latitude))
					)
				) <= ${DUPLICATE_RADIUS_METERS}
		`;

		const duplicate = candidates.find(
			(candidate) =>
				this.isCategorySimilar(dto.category, candidate.category) &&
				this.isDescriptionSimilar(dto.description, candidate.description),
		);

		if (duplicate) {
			throw new ConflictException(
				`Potential duplicate detected (report: ${duplicate.id}) within 100 meters in the last 30 minutes`,
			);
		}
	}

	private async recomputeCredibilityScore(
		reportId: string,
		tx: Prisma.TransactionClient = this.prisma,
	) {
		const [upvotes, downvotes, flagsCount] = await Promise.all([
			tx.vote.count({ where: { reportId, voteType: VoteType.UPVOTE } }),
			tx.vote.count({ where: { reportId, voteType: VoteType.DOWNVOTE } }),
			tx.flag.count({ where: { reportId } }),
		]);

		const credibilityScore = upvotes * 2 - downvotes * 2 - flagsCount * 5;

		return tx.report.update({
			where: { id: reportId },
			data: { credibilityScore },
		});
	}

	private async autoMoveToUnderReviewIfNeeded(
		reportId: string,
		tx: Prisma.TransactionClient = this.prisma,
	) {
		const flagsCount = await tx.flag.count({ where: { reportId } });
		if (flagsCount <= FLAG_UNDER_REVIEW_THRESHOLD) {
			return;
		}

		const report = await tx.report.findUnique({ where: { id: reportId } });
		if (!report) {
			return;
		}

		if (
			report.status !== ReportStatus.UNDER_REVIEW &&
			report.status !== ReportStatus.REJECTED
		) {
			await tx.report.update({
				where: { id: reportId },
				data: { status: ReportStatus.UNDER_REVIEW },
			});
		}
	}

	async create(userId: string, dto: CreateReportDto) {
		await this.enforceReportCreationLimits(userId);
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
				orderBy: [{ credibilityScore: 'desc' }, { createdAt: 'desc' }],
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
		const result = await this.prisma.$transaction(async (tx) => {
			const report = await tx.report.findUnique({ where: { id: reportId } });
			if (!report) {
				throw new NotFoundException('Report not found');
			}

			const existingVote = await tx.vote.findUnique({
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

			const vote = await tx.vote.create({
				data: {
					userId,
					reportId,
					voteType: dto.voteType,
				},
			});

			const updatedReport = await this.recomputeCredibilityScore(reportId, tx);
			return { vote, credibilityScore: updatedReport.credibilityScore };
		});

		return {
			message: 'Vote submitted successfully',
			data: result.vote,
			meta: {
				credibilityScore: result.credibilityScore,
			},
		};
	}

	async flag(userId: string, reportId: string, dto: FlagReportDto) {
		const result = await this.prisma.$transaction(async (tx) => {
			const report = await tx.report.findUnique({ where: { id: reportId } });
			if (!report) {
				throw new NotFoundException('Report not found');
			}

			const existingFlag = await tx.flag.findFirst({
				where: {
					userId,
					reportId,
				},
			});
			if (existingFlag) {
				throw new ConflictException('User has already flagged this report');
			}

			const flag = await tx.flag.create({
				data: {
					userId,
					reportId,
					reason: dto.reason,
				},
			});

			await this.autoMoveToUnderReviewIfNeeded(reportId, tx);
			const updatedReport = await this.recomputeCredibilityScore(reportId, tx);
			return {
				flag,
				status: updatedReport.status,
				credibilityScore: updatedReport.credibilityScore,
			};
		});

		return {
			message: 'Report flagged successfully',
			data: result.flag,
			meta: {
				status: result.status,
				credibilityScore: result.credibilityScore,
			},
		};
	}

	private async transitionStatus(reportId: string, nextStatus: ReportStatus) {
		const report = await this.prisma.report.findUnique({ where: { id: reportId } });
		if (!report) {
			throw new NotFoundException('Report not found');
		}

		if (report.status === nextStatus) {
			throw new BadRequestException(`Report is already ${nextStatus.toLowerCase()}`);
		}

		if (report.status === ReportStatus.REJECTED && nextStatus === ReportStatus.APPROVED) {
			throw new BadRequestException('Cannot approve a rejected report');
		}

		const validCurrentStates = new Set<ReportStatus>([
			ReportStatus.PENDING,
			ReportStatus.UNDER_REVIEW,
		]);

		if (!validCurrentStates.has(report.status)) {
			throw new BadRequestException(
				`Invalid status transition from ${report.status} to ${nextStatus}`,
			);
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
					credibilityScore: number;
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
					r."credibilityScore",
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
