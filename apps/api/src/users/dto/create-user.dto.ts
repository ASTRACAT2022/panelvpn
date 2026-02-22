export class CreateUserDto {
  email: string;
  name?: string;
  password?: string; // Optional for admin-created placeholder users
  role?: 'ADMIN' | 'USER';
  trafficLimit?: number;
  expireDate?: Date;
  status?: 'ACTIVE' | 'DISABLED' | 'EXPIRED';
  clusterId?: string;
}
