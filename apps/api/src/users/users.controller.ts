import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decorators';
import { Role } from '../common/roles';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@Roles(Role.ADMIN)
@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Lista los usuarios (solo ADMIN)' })
  list() {
    return this.users.list();
  }

  @Post()
  @ApiOperation({ summary: 'Registra un usuario con su rol (solo ADMIN)' })
  create(@Body() dto: CreateUserDto) {
    return this.users.create(dto);
  }
}
