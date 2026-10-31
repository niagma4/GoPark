import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthUser } from '../common/roles';
import { AUTH_COOKIE } from './auth.constants';

/** Lee el JWT desde la cookie HttpOnly (criterio de aceptación HU-01). */
const fromCookie = (req: Request): string | null =>
  (req?.cookies?.[AUTH_COOKIE] as string | undefined) ?? null;

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([fromCookie]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  validate(payload: AuthUser): AuthUser {
    return { sub: payload.sub, email: payload.email, name: payload.name, role: payload.role };
  }
}
