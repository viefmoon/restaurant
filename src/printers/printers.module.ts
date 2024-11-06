import { Module } from '@nestjs/common';
import { PrinterService } from './printers.service';

@Module({
  providers: [PrinterService],
  exports: [PrinterService],
})
export class PrintersModule {}
