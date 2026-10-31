import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

describe('AuthService (HU-01)', () => {
  const hash = bcrypt.hashSync('Operador123*', 4);
  const user = {
    id: 'u1', name: 'Operador', email: 'operador@gopark.co', passwordHash: hash,
    role: 'OPERATOR', active: true, createdAt: new Date(), updatedAt: new Date(),
  };
  let users: { findByEmail: jest.Mock };
  let jwt: { signAsync: jest.Mock };
  let service: AuthService;

  beforeEach(() => {
    users = { findByEmail: jest.fn() };
    jwt = { signAsync: jest.fn().mockResolvedValue('token.jwt') };
    service = new AuthService(users as unknown as UsersService, jwt as unknown as JwtService);
  });

  it('emite un JWT con id, correo, nombre y rol cuando las credenciales son válidas', async () => {
    users.findByEmail.mockResolvedValue(user);
    const res = await service.login('operador@gopark.co', 'Operador123*');
    expect(res.token).toBe('token.jwt');
    expect(res.user).toEqual({ id: 'u1', name: 'Operador', email: 'operador@gopark.co', role: 'OPERATOR' });
    expect(jwt.signAsync).toHaveBeenCalledWith({ sub: 'u1', email: 'operador@gopark.co', name: 'Operador', role: 'OPERATOR' });
  });

  it('rechaza una contraseña incorrecta', async () => {
    users.findByEmail.mockResolvedValue(user);
    await expect(service.login('operador@gopark.co', 'otraClave1')).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rechaza un correo inexistente con el mismo mensaje (no revela usuarios)', async () => {
    users.findByEmail.mockResolvedValue(null);
    await expect(service.login('nadie@gopark.co', 'Operador123*')).rejects.toThrow('Credenciales inválidas');
  });

  it('rechaza un usuario inactivo', async () => {
    users.findByEmail.mockResolvedValue({ ...user, active: false });
    await expect(service.login('operador@gopark.co', 'Operador123*')).rejects.toThrow('Usuario inactivo');
  });
});
