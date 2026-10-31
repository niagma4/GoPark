import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { AuthUser } from '../common/roles';
import { ShiftsService } from './shifts.service';

/**
 * Bloquea la operación si el cajero no tiene un turno abierto (HU-02).
 * Uso en Sprint 2: @UseGuards(OpenShiftGuard) en POST /sessions/check-in y /sessions/check-out.
 * Deja el turno en req.shift para asociar el cobro al turno activo (HU-04).
 */
@Injectable()
export class OpenShiftGuard implements CanActivate {
  constructor(private readonly shifts: ShiftsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request & { user: AuthUser; shift?: unknown }>();
    req.shift = await this.shifts.assertOpenShift(req.user.sub);
    return true;
  }
}
