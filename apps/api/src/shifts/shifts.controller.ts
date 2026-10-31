import { Body, Controller, Get, HttpCode, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CurrentUser, Roles } from '../auth/decorators';
import { AuthUser, Role } from '../common/roles';
import { CloseShiftDto } from './dto/close-shift.dto';
import { OpenShiftDto } from './dto/open-shift.dto';
import { ShiftsService } from './shifts.service';

@ApiTags('shifts')
@Controller('shifts')
export class ShiftsController {
  constructor(private readonly shifts: ShiftsService) {}

  @Roles(Role.OPERATOR)
  @Get('current')
  @ApiOperation({ summary: 'Turno abierto del cajero autenticado (o null)' })
  async current(@CurrentUser() user: AuthUser) {
    return { shift: await this.shifts.findOpen(user.sub) };
  }

  @Roles(Role.OPERATOR)
  @Post('open')
  @ApiOperation({ summary: 'Abre un turno con una base de efectivo inicial' })
  open(@CurrentUser() user: AuthUser, @Body() dto: OpenShiftDto) {
    return this.shifts.open(user.sub, dto.openingAmount);
  }

  @Roles(Role.OPERATOR)
  @Post('close')
  @HttpCode(200)
  @ApiOperation({ summary: 'Cierra el turno: compara el total esperado con el efectivo declarado' })
  close(@CurrentUser() user: AuthUser, @Body() dto: CloseShiftDto) {
    return this.shifts.close(user.sub, dto);
  }

  @Roles(Role.ADMIN)
  @Get()
  @ApiQuery({ name: 'status', required: false, enum: ['OPEN', 'CLOSED'] })
  @ApiOperation({ summary: 'Auditoría de turnos (solo ADMIN)' })
  list(@Query('status') status?: 'OPEN' | 'CLOSED') {
    const valid = status === 'OPEN' || status === 'CLOSED' ? status : undefined;
    return this.shifts.list(valid);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalle de un turno (ADMIN, o el dueño del turno)' })
  findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: AuthUser) {
    return this.shifts.findOne(id, user);
  }
}
