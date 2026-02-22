import { Module } from '@nestjs/common';
import { NodesService } from './nodes.service';
import { NodesController } from './nodes.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [NodesController],
  providers: [NodesService, PrismaService],
  exports: [NodesService],
})
export class NodesModule {}
