import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ShiftsService } from './shifts.service';

describe('ShiftsService (HU-02)', () => {
  const openShift = { id: 's1', userId: 'u1', status: 'OPEN', openingAmount: 50_000, cashCollected: 30_000 };
  let prisma: {
    cashShift: { findFirst: jest.Mock; create: jest.Mock; update: jest.Mock; findUnique: jest.Mock; findMany: jest.Mock };
    $transaction: jest.Mock;
  };
  let service: ShiftsService;

  beforeEach(() => {
    prisma = {
      cashShift: { findFirst: jest.fn(), create: jest.fn(), update: jest.fn(), findUnique: jest.fn(), findMany: jest.fn() },
      $transaction: jest.fn((fn: (tx: unknown) => unknown) => fn(prisma)),
    };
    service = new ShiftsService(prisma as unknown as PrismaService);
  });

  describe('open', () => {
    it('abre un turno con la base indicada', async () => {
      prisma.cashShift.findFirst.mockResolvedValue(null);
      prisma.cashShift.create.mockResolvedValue({ id: 's1' });
      await service.open('u1', 50_000);
      expect(prisma.cashShift.create).toHaveBeenCalledWith(expect.objectContaining({ data: { userId: 'u1', openingAmount: 50_000 } }));
    });

    it('no permite abrir un segundo turno', async () => {
      prisma.cashShift.findFirst.mockResolvedValue(openShift);
      await expect(service.open('u1', 10_000)).rejects.toBeInstanceOf(ConflictException);
      expect(prisma.cashShift.create).not.toHaveBeenCalled();
    });
  });

  describe('close', () => {
    it('calcula esperado = base + recaudo y la diferencia con lo declarado', async () => {
      prisma.cashShift.findFirst.mockResolvedValue(openShift);
      prisma.cashShift.update.mockImplementation(({ data }) => Promise.resolve({ ...openShift, ...data }));
      const res = await service.close('u1', { declaredAmount: 79_000, notes: '  billete roto ' });
      expect(prisma.cashShift.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 's1' },
          data: expect.objectContaining({
            status: 'CLOSED', expectedAmount: 80_000, declaredAmount: 79_000, difference: -1_000, notes: 'billete roto',
          }),
        }),
      );
      expect(res.result).toBe('FALTANTE');
    });

    it('falla si no hay turno abierto', async () => {
      prisma.cashShift.findFirst.mockResolvedValue(null);
      await expect(service.close('u1', { declaredAmount: 0 })).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('assertOpenShift (bloqueo de operación sin turno)', () => {
    it('lanza 403 si el cajero no tiene turno abierto', async () => {
      prisma.cashShift.findFirst.mockResolvedValue(null);
      await expect(service.assertOpenShift('u1')).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('devuelve el turno abierto si existe', async () => {
      prisma.cashShift.findFirst.mockResolvedValue(openShift);
      await expect(service.assertOpenShift('u1')).resolves.toBe(openShift);
    });
  });

  describe('findOne', () => {
    it('impide que un operador consulte el turno de otro', async () => {
      prisma.cashShift.findUnique.mockResolvedValue({ ...openShift, userId: 'otro' });
      await expect(service.findOne('s1', { sub: 'u1', role: 'OPERATOR', email: '', name: '' })).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('permite al ADMIN consultar cualquier turno', async () => {
      prisma.cashShift.findUnique.mockResolvedValue({ ...openShift, userId: 'otro' });
      await expect(service.findOne('s1', { sub: 'admin', role: 'ADMIN', email: '', name: '' })).resolves.toBeDefined();
    });
  });
});
