import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AuthUser, Role } from '../common/roles';
import { PrismaService } from '../prisma/prisma.service';
import { CloseShiftDto } from './dto/close-shift.dto';
import { countCash } from './shift-math';

const withUser = { user: { select: { id: true, name: true, email: true } } } as const;

@Injectable()
export class ShiftsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Turno abierto del usuario, o null. */
  findOpen(userId: string) {
    return this.prisma.cashShift.findFirst({ where: { userId, status: 'OPEN' }, include: withUser });
  }

  /**
   * Regla HU-02: no se registran entradas ni cobros sin turno abierto.
   * La usarán check-in y check-out (Sprint 2) a través de OpenShiftGuard.
   */
  async assertOpenShift(userId: string) {
    const shift = await this.findOpen(userId);
    if (!shift) throw new ForbiddenException('Debe abrir un turno de caja antes de operar');
    return shift;
  }

  async open(userId: string, openingAmount: number) {
    const current = await this.findOpen(userId);
    if (current) throw new ConflictException('Ya tiene un turno de caja abierto');
    try {
      return await this.prisma.cashShift.create({ data: { userId, openingAmount }, include: withUser });
    } catch (e) {
      // Dos aperturas simultáneas: el índice único parcial de la BD rechaza la segunda.
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new ConflictException('Ya tiene un turno de caja abierto');
      }
      throw e;
    }
  }

  async close(userId: string, dto: CloseShiftDto) {
    return this.prisma.$transaction(async (tx) => {
      const shift = await tx.cashShift.findFirst({ where: { userId, status: 'OPEN' } });
      if (!shift) throw new NotFoundException('No tiene un turno de caja abierto');

      const { expectedAmount, difference, result } = countCash(
        shift.openingAmount,
        shift.cashCollected,
        dto.declaredAmount,
      );
      const closed = await tx.cashShift.update({
        where: { id: shift.id },
        data: {
          status: 'CLOSED',
          closedAt: new Date(),
          expectedAmount,
          declaredAmount: dto.declaredAmount,
          difference,
          notes: dto.notes?.trim() || null,
        },
        include: withUser,
      });
      return { ...closed, result };
    });
  }

  /** Auditoría de turnos para el administrador. */
  list(status?: 'OPEN' | 'CLOSED') {
    return this.prisma.cashShift.findMany({
      where: status ? { status } : undefined,
      include: withUser,
      orderBy: { openedAt: 'desc' },
      take: 100,
    });
  }

  async findOne(id: string, requester: AuthUser) {
    const shift = await this.prisma.cashShift.findUnique({ where: { id }, include: withUser });
    if (!shift) throw new NotFoundException('Turno no encontrado');
    if (requester.role !== Role.ADMIN && shift.userId !== requester.sub) {
      throw new ForbiddenException('No puede consultar turnos de otros usuarios');
    }
    return shift;
  }
}
