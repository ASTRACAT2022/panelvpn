import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { UsersModule } from './users/users.module';
import { NodesModule } from './nodes/nodes.module';
import { ClustersModule } from './clusters/clusters.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { SingboxModule } from './singbox/singbox.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { MonitoringModule } from './monitoring/monitoring.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    NodesModule,
    ClustersModule,
    SingboxModule,
    SubscriptionsModule,
    MonitoringModule,
    HealthModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '../../web/.next/server/app'),
      exclude: ['/api/(.*)', '/api/docs'],
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
