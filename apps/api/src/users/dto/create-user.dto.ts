import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsIn, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { Role } from '../../common/roles';

export class CreateUserDto {
  @ApiProperty({ example: 'Laura Gómez' })
  @IsString()
  @MinLength(3)
  @MaxLength(80)
  name: string;

  @ApiProperty({ example: 'laura@gopark.co' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsEmail({}, { message: 'Correo inválido' })
  email: string;

  @ApiProperty({ example: 'Clave123*', description: 'Mínimo 8 caracteres, con letras y números' })
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @Matches(/(?=.*[A-Za-z])(?=.*\d)/, { message: 'La contraseña debe tener letras y números' })
  password: string;

  @ApiProperty({ enum: Object.values(Role), example: Role.OPERATOR })
  @IsIn(Object.values(Role), { message: 'Rol inválido' })
  role: Role;
}
