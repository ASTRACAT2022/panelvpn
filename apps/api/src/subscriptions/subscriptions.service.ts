import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, SubscriptionStatus } from '@prisma/client';
import { createHash, randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';

type RemnawaveImportUser = {
  email: string;
  name?: string;
  password?: string;
  role?: 'ADMIN' | 'USER';
  status?: 'ACTIVE' | 'DISABLED' | 'EXPIRED';
  trafficLimit?: number | string;
  expireDate?: string | Date;
  clusterId?: string;
  subscriptions?: RemnawaveImportSubscription[];
};

type RemnawaveImportSubscription = {
  name?: string;
  shortId?: string;
  uuid?: string;
  status?: 'ACTIVE' | 'EXPIRED' | 'SUSPENDED';
  expiresAt?: string | Date;
  clusterId?: string;
  userId?: string;
  userEmail?: string;
  maxConnections?: number;
  bandwidthLimit?: number | string;
};

type RemnawaveImportPayload = {
  defaultClusterId?: string;
  users?: RemnawaveImportUser[];
  subscriptions?: RemnawaveImportSubscription[];
};

@Injectable()
export class SubscriptionsService {
  constructor(private prisma: PrismaService) {}

  create(createSubscriptionDto: CreateSubscriptionDto) {
    const data: Prisma.SubscriptionUncheckedCreateInput = {
      userId: createSubscriptionDto.userId,
      clusterId: createSubscriptionDto.clusterId,
      name: createSubscriptionDto.name,
      uuid: createSubscriptionDto.uuid ?? this.generatePublicId(),
      status: createSubscriptionDto.status,
      maxConnections: createSubscriptionDto.maxConnections,
      bandwidthLimit:
        createSubscriptionDto.bandwidthLimit !== undefined ? BigInt(createSubscriptionDto.bandwidthLimit) : undefined,
      expiresAt: createSubscriptionDto.expiresAt,
    };

    return this.prisma.subscription.create({
      data,
    });
  }

  findAll() {
    return this.prisma.subscription.findMany({
      include: {
        user: true,
        cluster: true,
      },
    });
  }

  findOne(id: string) {
    return this.prisma.subscription.findUnique({
      where: { id },
      include: {
        user: true,
        cluster: true,
      },
    });
  }

  getUserSubscriptions(userId: string) {
    return this.prisma.subscription.findMany({
      where: { userId },
      include: {
        cluster: {
          include: {
            nodes: true,
          },
        },
      },
    });
  }

  update(id: string, updateSubscriptionDto: UpdateSubscriptionDto) {
    const data: Prisma.SubscriptionUncheckedUpdateInput = {
      userId: updateSubscriptionDto.userId,
      clusterId: updateSubscriptionDto.clusterId,
      name: updateSubscriptionDto.name,
      uuid: updateSubscriptionDto.uuid,
      status: updateSubscriptionDto.status as SubscriptionStatus | undefined,
      maxConnections: updateSubscriptionDto.maxConnections,
      bandwidthLimit:
        updateSubscriptionDto.bandwidthLimit !== undefined ? BigInt(updateSubscriptionDto.bandwidthLimit) : undefined,
      expiresAt: updateSubscriptionDto.expiresAt,
    };

    return this.prisma.subscription.update({
      where: { id },
      data,
    });
  }

  remove(id: string) {
    return this.prisma.subscription.delete({
      where: { id },
    });
  }

  async getSubscriptionConfig(subscriptionId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: {
        user: true,
        cluster: {
          include: {
            nodes: true,
          },
        },
      },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    return this.toSubscriptionConfig(subscription);
  }

  async getSubscriptionConfigByPublicId(publicId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { uuid: publicId },
      include: {
        user: true,
        cluster: {
          include: {
            nodes: true,
          },
        },
      },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    return this.toSubscriptionConfig(subscription);
  }

  async importFromRemnawave(payload: RemnawaveImportPayload) {
    const result = {
      usersCreated: 0,
      usersUpdated: 0,
      subscriptionsCreated: 0,
      subscriptionsUpdated: 0,
      errors: [] as string[],
    };

    const defaultClusterId = await this.resolveDefaultClusterId(payload.defaultClusterId);

    for (const user of payload.users ?? []) {
      if (!user?.email) {
        result.errors.push('Skipped user without email');
        continue;
      }

      try {
        const existingUser = await this.prisma.user.findUnique({
          where: { email: user.email },
        });

        const userData: Prisma.UserUncheckedCreateInput = {
          email: user.email,
          password: user.password ?? randomUUID(),
          name: user.name,
          role: user.role,
          status: user.status,
          clusterId: user.clusterId ?? defaultClusterId,
          trafficLimit: user.trafficLimit !== undefined ? BigInt(user.trafficLimit) : undefined,
          expireDate: user.expireDate ? new Date(user.expireDate) : undefined,
        };

        const persistedUser = await this.prisma.user.upsert({
          where: { email: user.email },
          update: {
            name: userData.name,
            role: userData.role,
            status: userData.status,
            clusterId: userData.clusterId,
            trafficLimit: userData.trafficLimit,
            expireDate: userData.expireDate,
          },
          create: userData,
        });

        if (existingUser) {
          result.usersUpdated += 1;
        } else {
          result.usersCreated += 1;
        }

        for (const sub of user.subscriptions ?? []) {
          const upsertResult = await this.upsertImportedSubscription(sub, persistedUser.id, defaultClusterId);
          if (upsertResult === 'created') {
            result.subscriptionsCreated += 1;
          } else {
            result.subscriptionsUpdated += 1;
          }
        }
      } catch (error) {
        result.errors.push(`User import failed for ${user.email}: ${this.errorToString(error)}`);
      }
    }

    for (const sub of payload.subscriptions ?? []) {
      try {
        let userId = sub.userId;
        if (!userId && sub.userEmail) {
          const importedUser = await this.prisma.user.findUnique({
            where: { email: sub.userEmail },
            select: { id: true },
          });
          userId = importedUser?.id;
        }

        if (!userId) {
          result.errors.push(`Skipped subscription without resolvable user: ${sub.shortId ?? sub.uuid ?? sub.name ?? '-'}`);
          continue;
        }

        const upsertResult = await this.upsertImportedSubscription(sub, userId, defaultClusterId);
        if (upsertResult === 'created') {
          result.subscriptionsCreated += 1;
        } else {
          result.subscriptionsUpdated += 1;
        }
      } catch (error) {
        result.errors.push(`Subscription import failed: ${this.errorToString(error)}`);
      }
    }

    return result;
  }

  private async upsertImportedSubscription(
    sub: RemnawaveImportSubscription,
    userId: string,
    defaultClusterId: string,
  ): Promise<'created' | 'updated'> {
    const publicId = sub.shortId ?? sub.uuid ?? this.generatePublicId();
    const existing = await this.prisma.subscription.findUnique({
      where: { uuid: publicId },
      select: { id: true },
    });

    const data: Prisma.SubscriptionUncheckedCreateInput = {
      uuid: publicId,
      name: sub.name ?? `Migrated ${publicId}`,
      userId,
      clusterId: sub.clusterId ?? defaultClusterId,
      status: (sub.status as SubscriptionStatus) ?? 'ACTIVE',
      expiresAt: sub.expiresAt ? new Date(sub.expiresAt) : undefined,
      maxConnections: sub.maxConnections ?? 1,
      bandwidthLimit: sub.bandwidthLimit !== undefined ? BigInt(sub.bandwidthLimit) : undefined,
    };

    await this.prisma.subscription.upsert({
      where: { uuid: publicId },
      update: {
        name: data.name,
        userId: data.userId,
        clusterId: data.clusterId,
        status: data.status,
        expiresAt: data.expiresAt,
        maxConnections: data.maxConnections,
        bandwidthLimit: data.bandwidthLimit,
      },
      create: data,
    });

    return existing ? 'updated' : 'created';
  }

  private async resolveDefaultClusterId(preferredClusterId?: string): Promise<string> {
    if (preferredClusterId) {
      const preferred = await this.prisma.cluster.findUnique({
        where: { id: preferredClusterId },
        select: { id: true },
      });
      if (preferred) {
        return preferred.id;
      }
    }

    const firstCluster = await this.prisma.cluster.findFirst({
      select: { id: true },
      orderBy: { createdAt: 'asc' },
    });
    if (firstCluster) {
      return firstCluster.id;
    }

    const fallbackCluster = await this.prisma.cluster.create({
      data: {
        name: 'Migrated Cluster',
        description: 'Auto-created for Remnawave migration',
        status: 'ACTIVE',
        type: 'LOAD_BALANCE',
      },
    });
    return fallbackCluster.id;
  }

  toSubscriptionConfig(subscription: {
    uuid: string;
    name: string;
    cluster: { name: string; nodes: { id?: string; name: string; ipAddress: string; port: number }[] };
  }) {
    return {
      version: 1,
      servers: subscription.cluster.nodes.map((node) => ({
        name: `${subscription.cluster.name} - ${node.name}`,
        type: 'shadowsocks',
        server: node.ipAddress,
        port: node.port || 8388,
        method: 'aes-256-gcm',
        password: this.generatePassword(subscription.uuid, node.id ?? node.name),
      })),
    };
  }

  toSubscriptionLinks(config: {
    servers: { name: string; server: string; port: number; method: string; password: string }[];
  }): string[] {
    return config.servers.map((server) => {
      const creds = `${server.method}:${server.password}@${server.server}:${server.port}`;
      const encodedCreds = Buffer.from(creds, 'utf8').toString('base64');
      const encodedName = encodeURIComponent(server.name);
      return `ss://${encodedCreds}#${encodedName}`;
    });
  }

  private generatePublicId(): string {
    return randomUUID().replace(/-/g, '');
  }

  private generatePassword(seedA: string, seedB: string): string {
    return createHash('sha256').update(`${seedA}:${seedB}`).digest('hex').slice(0, 32);
  }

  private errorToString(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    return String(error);
  }
}
