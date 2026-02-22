import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';

@Injectable()
export class SubscriptionsService {
  constructor(private prisma: PrismaService) {}

  create(createSubscriptionDto: CreateSubscriptionDto) {
    return this.prisma.subscription.create({
      data: {
        ...createSubscriptionDto,
        uuid: this.generateUUID(),
      },
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
    return this.prisma.subscription.update({
      where: { id },
      data: updateSubscriptionDto,
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
      throw new Error('Subscription not found');
    }

    // Generate subscription configuration
    const config = {
      version: 1,
      servers: subscription.cluster.nodes.map(node => ({
        name: `${subscription.cluster.name} - ${node.name}`,
        type: 'shadowsocks',
        server: node.ipAddress,
        port: node.port || 8388,
        method: 'aes-256-gcm',
        password: this.generatePassword(),
      })),
    };

    return config;
  }

  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  private generatePassword(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
}
