import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  create(createUserDto: CreateUserDto) {
    const data: Prisma.UserUncheckedCreateInput = {
      email: createUserDto.email,
      password: createUserDto.password ?? randomUUID(),
      name: createUserDto.name,
      role: createUserDto.role,
      status: createUserDto.status,
      clusterId: createUserDto.clusterId,
      trafficLimit: createUserDto.trafficLimit !== undefined ? BigInt(createUserDto.trafficLimit) : undefined,
      expireDate: createUserDto.expireDate,
    };

    return this.prisma.user.create({
      data,
    });
  }

  findAll() {
    return this.prisma.user.findMany();
  }

  findOne(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    const data: Prisma.UserUncheckedUpdateInput = {
      email: updateUserDto.email,
      password: updateUserDto.password,
      name: updateUserDto.name,
      role: updateUserDto.role,
      status: updateUserDto.status,
      clusterId: updateUserDto.clusterId,
      expireDate: updateUserDto.expireDate,
    };

    if (updateUserDto.trafficLimit !== undefined) {
      data.trafficLimit = BigInt(updateUserDto.trafficLimit);
    }

    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  remove(id: string) {
    return this.prisma.user.delete({
      where: { id },
    });
  }
}
