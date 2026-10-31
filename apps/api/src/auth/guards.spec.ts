import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './guards';

const ctxWith = (user?: { role: string }) =>
  ({
    getHandler: () => undefined,
    getClass: () => undefined,
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
  }) as unknown as ExecutionContext;

describe('RolesGuard (RBAC HU-01)', () => {
  const reflector = new Reflector();
  const guard = new RolesGuard(reflector);

  it('permite el acceso si la ruta no exige rol', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    expect(guard.canActivate(ctxWith({ role: 'OPERATOR' }))).toBe(true);
  });

  it('permite al ADMIN entrar a una ruta de ADMIN', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN']);
    expect(guard.canActivate(ctxWith({ role: 'ADMIN' }))).toBe(true);
  });

  it('bloquea al OPERATOR en una ruta de ADMIN', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN']);
    expect(() => guard.canActivate(ctxWith({ role: 'OPERATOR' }))).toThrow(ForbiddenException);
  });

  it('bloquea si no hay usuario en la petición', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['OPERATOR']);
    expect(() => guard.canActivate(ctxWith(undefined))).toThrow(ForbiddenException);
  });
});
