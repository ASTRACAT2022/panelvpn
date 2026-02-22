import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClusterDto } from './dto/create-cluster.dto';
import { UpdateClusterDto } from './dto/update-cluster.dto';

@Injectable()
export class ClustersService {
  constructor(private prisma: PrismaService) {}

  create(createClusterDto: CreateClusterDto) {
    return this.prisma.cluster.create({
      data: createClusterDto,
    });
  }

  findAll() {
    return this.prisma.cluster.findMany({
      include: {
        nodes: true,
        users: true,
      },
    });
  }

  findOne(id: string) {
    return this.prisma.cluster.findUnique({
      where: { id },
      include: {
        nodes: true,
        users: true,
      },
    });
  }

  update(id: string, updateClusterDto: UpdateClusterDto) {
    return this.prisma.cluster.update({
      where: { id },
      data: updateClusterDto,
    });
  }

  remove(id: string) {
    return this.prisma.cluster.delete({
      where: { id },
    });
  }

  async addNode(clusterId: string, nodeId: string) {
    return this.prisma.cluster.update({
      where: { id: clusterId },
      data: {
        nodes: {
          connect: { id: nodeId },
        },
      },
    });
  }

  async removeNode(clusterId: string, nodeId: string) {
    return this.prisma.cluster.update({
      where: { id: clusterId },
      data: {
        nodes: {
          disconnect: { id: nodeId },
        },
      },
    });
  }
}
