import { Module } from '@nestjs/common';
import { OpenShiftGuard } from './open-shift.guard';
import { ShiftsController } from './shifts.controller';
import { ShiftsService } from './shifts.service';

@Module({
  controllers: [ShiftsController],
  providers: [ShiftsService, OpenShiftGuard],
  exports: [ShiftsService, OpenShiftGuard],
})
export class ShiftsModule {}
