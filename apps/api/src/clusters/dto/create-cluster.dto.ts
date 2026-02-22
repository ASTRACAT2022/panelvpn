export class CreateClusterDto {
  name: string;
  type: 'LOAD_BALANCE' | 'FAILOVER' | 'GEO_BASED' = 'LOAD_BALANCE';
}
