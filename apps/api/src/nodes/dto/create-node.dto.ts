export class CreateNodeDto {
  name: string;
  hostname?: string;
  ipAddress?: string;
  // Backward-compatibility for old clients.
  ip?: string;
  port?: number = 443;
  apiPort?: number = 8081;
  token?: string;
  status?: 'ONLINE' | 'OFFLINE' | 'WARNING' | 'MAINTENANCE';
  country?: string;
  city?: string;
  clusterId?: string;
}
