import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MonitoringService {
  constructor(private prisma: PrismaService) {}

  create(data: any) {
    return this.prisma.monitoring.create({
      data,
    });
  }

  async getMonitoringData(filters: { nodeId?: string; userId?: string }) {
    const where = {};
    if (filters.nodeId) {
      where['nodeId'] = filters.nodeId;
    }
    if (filters.userId) {
      where['userId'] = filters.userId;
    }

    return this.prisma.monitoring.findMany({
      where,
      orderBy: {
        timestamp: 'desc',
      },
      take: 100,
    });
  }

  async getSystemStats() {
    const totalUsers = await this.prisma.user.count();
    const totalNodes = await this.prisma.node.count();
    const totalClusters = await this.prisma.cluster.count();
    const activeNodes = await this.prisma.node.count({
      where: { status: 'ONLINE' },
    });

    return {
      totalUsers,
      totalNodes,
      totalClusters,
      activeNodes,
      onlineNodes: activeNodes,
      offlineNodes: totalNodes - activeNodes,
    };
  }

  async getTrafficStats(filters: { nodeId?: string; userId?: string }) {
    const where = {};
    if (filters.nodeId) {
      where['nodeId'] = filters.nodeId;
    }
    if (filters.userId) {
      where['userId'] = filters.userId;
    }

    const stats = await this.prisma.monitoring.aggregate({
      where,
      _sum: {
        upload: true,
        download: true,
      },
      _avg: {
        upload: true,
        download: true,
      },
    });

    return {
      totalUpload: stats._sum.upload || 0,
      totalDownload: stats._sum.download || 0,
      avgUpload: stats._avg.upload || 0,
      avgDownload: stats._avg.download || 0,
    };
  }

  async getNodeHealth() {
    const nodes = await this.prisma.node.findMany({
      select: {
        id: true,
        name: true,
        status: true,
        lastHeartbeat: true,
        version: true,
      },
    });

    return nodes.map(node => ({
      ...node,
      isHealthy: node.status === 'ONLINE' && 
        node.lastHeartbeat && 
        new Date().getTime() - new Date(node.lastHeartbeat).getTime() < 300000, // 5 minutes
    }));
  }

  findOne(id: string) {
    return this.prisma.monitoring.findUnique({
      where: { id },
    });
  }
}
