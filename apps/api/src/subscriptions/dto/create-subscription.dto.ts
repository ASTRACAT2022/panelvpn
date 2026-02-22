export class CreateSubscriptionDto {
  userId: string;
  clusterId: string;
  name: string;
  expiresAt?: Date;
}
