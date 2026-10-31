import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Max, Min } from 'class-validator';

export class OpenShiftDto {
  @ApiProperty({ example: 50000, description: 'Base de efectivo inicial en pesos (COP)' })
  @IsInt({ message: 'La base debe ser un valor entero en pesos' })
  @Min(0, { message: 'La base no puede ser negativa' })
  @Max(10_000_000, { message: 'La base supera el máximo permitido' })
  openingAmount: number;
}
