import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class CloseShiftDto {
  @ApiProperty({ example: 50000, description: 'Efectivo contado por el cajero al cierre (COP)' })
  @IsInt({ message: 'El efectivo declarado debe ser un valor entero en pesos' })
  @Min(0, { message: 'El efectivo declarado no puede ser negativo' })
  @Max(100_000_000)
  declaredAmount: number;

  @ApiPropertyOptional({ example: 'Sin novedades' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
