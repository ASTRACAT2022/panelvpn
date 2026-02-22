import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNodeDto } from './dto/create-node.dto';
import { UpdateNodeDto } from './dto/update-node.dto';

@Injectable()
export class NodesService {
  constructor(private prisma: PrismaService) {}

  create(createNodeDto: CreateNodeDto) {
    return this.prisma.node.create({
      data: createNodeDto,
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
    return this.prisma.node.update({
      where: { id },
      data: updateNodeDto,
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
