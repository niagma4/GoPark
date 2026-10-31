import { ConflictException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

const BCRYPT_ROUNDS = 10;

/** Campos públicos del usuario (nunca se expone el hash de la contraseña). */
const publicFields = { id: true, name: true, email: true, role: true, active: true, createdAt: true } as const;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
  }

  list() {
    return this.prisma.user.findMany({ select: publicFields, orderBy: { createdAt: 'asc' } });
  }

  async create(dto: CreateUserDto) {
    const exists = await this.findByEmail(dto.email);
    if (exists) throw new ConflictException('Ya existe un usuario con ese correo');
    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    return this.prisma.user.create({
      data: { name: dto.name.trim(), email: dto.email, passwordHash, role: dto.role },
      select: publicFields,
    });
  }
}
