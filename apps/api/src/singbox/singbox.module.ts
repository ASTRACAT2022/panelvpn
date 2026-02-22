import { Module } from '@nestjs/common';
import { SingboxService } from './singbox.service';
import { SingboxController } from './singbox.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [SingboxController],
  providers: [SingboxService, PrismaService],
  exports: [SingboxService],
})
export class SingboxModule {}
