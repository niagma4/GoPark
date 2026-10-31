import { Body, Controller, Get, HttpCode, Post, Res } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CookieOptions, Response } from 'express';
import { AuthUser } from '../common/roles';
import { AUTH_COOKIE } from './auth.constants';
import { AuthService } from './auth.service';
import { CurrentUser, Public } from './decorators';
import { LoginDto } from './dto/login.dto';

const EIGHT_HOURS_MS = 8 * 60 * 60 * 1000;

export function authCookieOptions(): CookieOptions {
  return {
    httpOnly: true, // el JavaScript del navegador no puede leer el token (protección XSS)
    secure: process.env.COOKIE_SECURE === 'true',
    sameSite: 'lax',
    path: '/',
    maxAge: EIGHT_HOURS_MS,
  };
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Inicia sesión y deja el JWT en una cookie HttpOnly' })
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { token, user } = await this.auth.login(dto.email, dto.password);
    res.cookie(AUTH_COOKIE, token, authCookieOptions());
    return { user };
  }

  @Public()
  @Post('logout')
  @HttpCode(204)
  @ApiOperation({ summary: 'Cierra la sesión (borra la cookie)' })
  logout(@Res({ passthrough: true }) res: Response): void {
    const { maxAge: _maxAge, ...opts } = authCookieOptions();
    res.clearCookie(AUTH_COOKIE, opts);
  }

  @Get('me')
  @ApiOperation({ summary: 'Devuelve el usuario autenticado' })
  me(@CurrentUser() user: AuthUser) {
    return { user: { id: user.sub, name: user.name, email: user.email, role: user.role } };
  }
}
