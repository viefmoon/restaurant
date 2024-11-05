import { Module } from '@nestjs/common';
import { OrderCountersService } from './order-counters.service';
import { OrderCountersController } from './order-counters.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderCounter } from './order-counter.entity'; // Asume una entidad Category

@Module({
  imports: [TypeOrmModule.forFeature([OrderCounter])],
  providers: [OrderCountersService],
  controllers: [OrderCountersController],
})
export class OrderCountersModule {}
