import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNodeDto } from './dto/create-node.dto';
import { UpdateNodeDto } from './dto/update-node.dto';

@Injectable()
export class NodesService {
  constructor(private prisma: PrismaService) {}

  create(createNodeDto: CreateNodeDto) {
    const ipAddress = createNodeDto.ipAddress ?? createNodeDto.ip;
    if (!ipAddress) {
      throw new Error('ipAddress is required');
    }

    const data: Prisma.NodeUncheckedCreateInput = {
      name: createNodeDto.name,
      hostname: createNodeDto.hostname ?? `${createNodeDto.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
      ipAddress,
      port: createNodeDto.port ?? 443,
      apiPort: createNodeDto.apiPort ?? 8081,
      token: createNodeDto.token ?? randomUUID(),
      status: createNodeDto.status,
      country: createNodeDto.country,
      city: createNodeDto.city,
      clusterId: createNodeDto.clusterId,
    };

    return this.prisma.node.create({
      data,
    });
  }

  findAll() {
    return this.prisma.node.findMany({
      include: {
        cluster: true,
      },
    });
  }

  findOne(id: string) {
    return this.prisma.node.findUnique({
      where: { id },
      include: {
        cluster: true,
      },
    });
  }

  update(id: string, updateNodeDto: UpdateNodeDto) {
    const data: Prisma.NodeUncheckedUpdateInput = {
      name: updateNodeDto.name,
      hostname: updateNodeDto.hostname,
      port: updateNodeDto.port,
      apiPort: updateNodeDto.apiPort,
      token: updateNodeDto.token,
      status: updateNodeDto.status,
      country: updateNodeDto.country,
      city: updateNodeDto.city,
      clusterId: updateNodeDto.clusterId,
    };
    const ipAddress = updateNodeDto.ipAddress ?? updateNodeDto.ip;
    if (ipAddress) {
      data.ipAddress = ipAddress;
    }

    return this.prisma.node.update({
      where: { id },
      data,
    });
  }

  remove(id: string) {
    return this.prisma.node.delete({
      where: { id },
    });
  }

  async handleHeartbeat(heartbeatData: { node_id: string; status: string; timestamp: number; version?: string }) {
    const { node_id, status, version } = heartbeatData;
    
    const node = await this.prisma.node.findUnique({
      where: { id: node_id },
    });

    if (!node) {
      throw new Error('Node not found');
    }

    return this.prisma.node.update({
      where: { id: node_id },
      data: {
        status: status as any,
        version,
        lastHeartbeat: new Date(),
      },
    });
  }
}
