import { PartialType } from '@nestjs/mapped-types';
import { CreateSingboxDto } from './create-singbox.dto';

export class UpdateSingboxDto extends PartialType(CreateSingboxDto) {}
