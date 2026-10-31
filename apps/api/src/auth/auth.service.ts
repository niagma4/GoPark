import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { AuthUser, Role } from '../common/roles';
import { UsersService } from '../users/users.service';

export interface LoginResult {
  token: string;
  user: { id: string; name: string; email: string; role: Role };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
  ) {}

  async login(email: string, password: string): Promise<LoginResult> {
    const user = await this.users.findByEmail(email);
    // Mismo mensaje para usuario inexistente o contraseña errada: no revela qué correos existen.
    const valid = user ? await bcrypt.compare(password, user.passwordHash) : false;
    if (!user || !valid) throw new UnauthorizedException('Credenciales inválidas');
    if (!user.active) throw new UnauthorizedException('Usuario inactivo');

    const payload: AuthUser = { sub: user.id, email: user.email, name: user.name, role: user.role as Role };
    const token = await this.jwt.signAsync(payload);
    return { token, user: { id: user.id, name: user.name, email: user.email, role: user.role as Role } };
  }
}
