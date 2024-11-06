import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderAdjustment } from './order-adjustment.entity';

@Injectable()
export class OrderAdjustmentsService {
  constructor(
    @InjectRepository(OrderAdjustment)
    private readonly orderAdjustmentRepository: Repository<OrderAdjustment>,
  ) {}
}
