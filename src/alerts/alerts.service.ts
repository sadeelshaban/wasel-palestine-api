import {
	BadRequestException,
	ForbiddenException,
	Injectable,
	Logger,
	NotFoundException,
} from '@nestjs/common';
import { IncidentStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { ListAlertFeedDto } from './dto/list-alert-feed.dto';
import { ListSubscriptionsDto } from './dto/list-subscriptions.dto';
import { MarkAlertReadDto } from './dto/mark-alert-read.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';

const MAX_SUBSCRIPTION_RADIUS_METERS = 50000;

@Injectable()
export class AlertsService {
	private readonly logger = new Logger(AlertsService.name);

	constructor(private readonly prisma: PrismaService) {}

	private normalizeCategory(category?: string | null): string | undefined {
		const normalized = category?.trim();
		return normalized ? normalized : undefined;
	}

	private ensureReasonableRadius(radiusMeters?: number) {
		if (radiusMeters === undefined) {
			return;
		}

		if (radiusMeters > MAX_SUBSCRIPTION_RADIUS_METERS) {
			throw new BadRequestException(
				`radiusMeters must be <= ${MAX_SUBSCRIPTION_RADIUS_METERS}`,
			);
		}
	}

	private async publishAlertEvents(alerts: Array<{ userId: string; incidentId: string }>) {
		if (!alerts.length) {
			return;
		}

		// Placeholder for future push/websocket integration.
		this.logger.debug(
			`Queued ${alerts.length} alert notifications for incident ${alerts[0].incidentId}`,
		);
	}

	async subscribe(userId: string, dto: CreateSubscriptionDto) {
		this.ensureReasonableRadius(dto.radiusMeters);

		const created = await this.prisma.subscription.create({
			data: {
				userId,
				latitude: dto.latitude,
				longitude: dto.longitude,
				radiusMeters: dto.radiusMeters,
				category: this.normalizeCategory(dto.category),
			},
		});
		return { message: 'Subscription created', data: created };
	}

	async listSubscriptions(userId: string, query: ListSubscriptionsDto) {
		const page = query.page ?? 1;
		const limit = query.limit ?? 20;
		const skip = (page - 1) * limit;

		const where: Prisma.SubscriptionWhereInput = { userId };
		if (query.category) {
			where.category = {
				equals: query.category,
				mode: 'insensitive',
			};
		}

		const [items, total] = await Promise.all([
			this.prisma.subscription.findMany({
				where,
				orderBy: { createdAt: 'desc' },
				skip,
				take: limit,
			}),
			this.prisma.subscription.count({ where }),
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

	async updateSubscription(
		userId: string,
		id: string,
		dto: UpdateSubscriptionDto,
	) {
		this.ensureReasonableRadius(dto.radiusMeters);

		const existing = await this.prisma.subscription.findUnique({ where: { id } });
		if (!existing) {
			throw new NotFoundException('Subscription not found');
		}
		if (existing.userId !== userId) {
			throw new ForbiddenException('Cannot update another user subscription');
		}

		const updated = await this.prisma.subscription.update({
			where: { id },
			data: {
				...(dto.latitude !== undefined && { latitude: dto.latitude }),
				...(dto.longitude !== undefined && { longitude: dto.longitude }),
				...(dto.radiusMeters !== undefined && { radiusMeters: dto.radiusMeters }),
				...(dto.category !== undefined && {
					category: this.normalizeCategory(dto.category),
				}),
			},
		});

		return { message: 'Subscription updated', data: updated };
	}

	async deleteSubscription(userId: string, id: string) {
		const existing = await this.prisma.subscription.findUnique({ where: { id } });
		if (!existing) {
			throw new NotFoundException('Subscription not found');
		}
		if (existing.userId !== userId) {
			throw new ForbiddenException('Cannot delete another user subscription');
		}

		await this.prisma.subscription.delete({ where: { id } });
		return { message: 'Subscription deleted', data: { id } };
	}

	async listFeed(userId: string, query: ListAlertFeedDto) {
		const page = query.page ?? 1;
		const limit = query.limit ?? 20;
		const skip = (page - 1) * limit;

		const where: Prisma.AlertWhereInput = { userId };
		if (query.category) {
			where.incident = {
				type: {
					equals: query.category,
					mode: 'insensitive',
				},
			};
		}

		const [items, total] = await Promise.all([
			this.prisma.alert.findMany({
				where,
				include: {
					incident: {
						select: {
							id: true,
							type: true,
							status: true,
							severity: true,
							latitude: true,
							longitude: true,
							createdAt: true,
						},
					},
				},
				orderBy: { createdAt: 'desc' },
				skip,
				take: limit,
			}),
			this.prisma.alert.count({ where }),
		]);

		const unreadCount = await this.prisma.alert.count({
			where: {
				userId,
				isRead: false,
			},
		});

		return {
			data: items,
			meta: {
				total,
				page,
				limit,
				totalPages: Math.ceil(total / limit),
				unreadCount,
			},
		};
	}

	async markRead(userId: string, id: string, dto: MarkAlertReadDto) {
		const existing = await this.prisma.alert.findUnique({ where: { id } });
		if (!existing) {
			throw new NotFoundException('Alert not found');
		}
		if (existing.userId !== userId) {
			throw new ForbiddenException('Cannot update another user alert');
		}

		const updated = await this.prisma.alert.update({
			where: { id },
			data: {
				isRead: dto.isRead ?? true,
			},
		});

		return { message: 'Alert updated', data: updated };
	}

	async generateAlertsForVerifiedIncident(incidentId: string) {
		const incident = await this.prisma.incident.findUnique({
			where: { id: incidentId },
			select: {
				id: true,
				type: true,
				status: true,
				latitude: true,
				longitude: true,
			},
		});
		if (!incident) {
			throw new NotFoundException('Incident not found');
		}
		if (incident.status !== IncidentStatus.VERIFIED) {
			return {
				message: 'Incident is not verified, no alerts generated',
				data: { count: 0 },
			};
		}

		const matchedUsers = await this.prisma.$queryRaw<Array<{ userId: string }>>`
			SELECT DISTINCT s."userId"
			FROM "Subscription" s
			WHERE
				(
					s.category IS NOT NULL
					AND lower(trim(s.category)) = lower(trim(${incident.type}))
				)
				OR
				(
					6371000 * acos(
						LEAST(1.0, GREATEST(-1.0,
							cos(radians(${incident.latitude}))
							* cos(radians(s.latitude))
							* cos(radians(s.longitude) - radians(${incident.longitude}))
							+ sin(radians(${incident.latitude})) * sin(radians(s.latitude))
						))
					)
				) <= s."radiusMeters"
		`;

		if (matchedUsers.length === 0) {
			return {
				message: 'No matching subscriptions',
				data: { count: 0 },
			};
		}

		const message = `New incident near your area: ${incident.type}`;
		const alertRows = matchedUsers.map((row) => ({
			userId: row.userId,
			incidentId: incident.id,
			message,
		}));

		const result = await this.prisma.alert.createMany({
			data: alertRows,
			skipDuplicates: true,
		});

		void this.publishAlertEvents(alertRows);

		return {
			message: 'Alerts generated for verified incident',
			data: {
				incidentId: incident.id,
				count: result.count,
			},
		};
	}
}
