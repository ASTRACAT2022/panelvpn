export class CreateNodeDto {
  name: string;
  ip: string;
  port?: number = 443;
  clusterId?: string;
}
