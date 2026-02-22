export class CreateSubscriptionDto {
  userId: string;
  clusterId: string;
  name: string;
  uuid?: string;
  status?: 'ACTIVE' | 'EXPIRED' | 'SUSPENDED';
  maxConnections?: number;
  bandwidthLimit?: number;
  expiresAt?: Date;
}
