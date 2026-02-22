export class CreateUserDto {
  email: string;
  password?: string; // Optional if created via external auth, but typically required
  role?: 'ADMIN' | 'USER';
  trafficLimit?: number;
  expireDate?: Date;
  status?: 'ACTIVE' | 'DISABLED' | 'EXPIRED';
  clusterId?: string;
}
