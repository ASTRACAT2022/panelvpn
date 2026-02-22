import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SingboxService {
  constructor(private prisma: PrismaService) {}

  async generateConfig(nodeId: string) {
    const node = await this.prisma.node.findUnique({
      where: { id: nodeId },
      include: {
        cluster: {
          include: {
            users: true,
          },
        },
      },
    });

    if (!node) {
      throw new Error('Node not found');
    }

    // Generate Sing-box configuration based on node and cluster settings
    const config = {
      log: {
        level: 'info',
        timestamp: true,
      },
      inbounds: [
        {
          type: 'shadowsocks',
          tag: 'ss-in',
          listen: '0.0.0.0',
          listen_port: 8388,
          method: 'aes-256-gcm',
          password: this.generatePassword(),
        },
      ],
      outbounds: [
        {
          type: 'direct',
          tag: 'direct',
        },
        {
          type: 'block',
          tag: 'block',
        },
      ],
      route: {
        rules: [
          {
            inbound: ['ss-in'],
            outbound: 'direct',
          },
        ],
      },
    };

    return config;
  }

  async generateAndSaveConfig(nodeId: string, configData: any) {
    const config = await this.generateConfig(nodeId);
    
    // Save config to database
    await this.prisma.node.update({
      where: { id: nodeId },
      data: {
        config: config as unknown as any,
      },
    });

    return { message: 'Config generated and saved successfully', config };
  }

  async generateSubscription(userId: string) {
    const subscriptions = await this.prisma.subscription.findMany({
      where: { userId },
      include: {
        cluster: {
          include: {
            nodes: true,
          },
        },
      },
    });

    // Generate subscription configuration aggregated across user's subscriptions
    const servers = subscriptions.flatMap(sub =>
      sub.cluster.nodes.map(node => ({
        name: `${sub.name} - ${node.name}`,
        type: 'shadowsocks',
        server: node.ip,
        port: node.port || 8388,
        method: 'aes-256-gcm',
        password: this.generatePassword(),
      }))
    );

    return {
      version: 1,
      servers,
    };
  }

  async restartService(nodeId: string) {
    // In a real implementation, this would restart the Sing-box service
    // For now, just return success
    return { message: 'Service restart initiated', nodeId };
  }

  async getServiceStatus(nodeId: string) {
    const node = await this.prisma.node.findUnique({
      where: { id: nodeId },
    });

    if (!node) {
      throw new Error('Node not found');
    }

    return {
      nodeId,
      status: node.status,
      version: node.version,
      lastHeartbeat: node.lastHeartbeat,
    };
  }

  private generatePassword(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
}
