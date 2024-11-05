import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderItemUpdate } from './order-item-update.entity';

@Injectable()
export class OrderItemUpdatesService {
  constructor(
    @InjectRepository(OrderItemUpdate)
    private readonly orderItemUpdateRepository: Repository<OrderItemUpdate>,
  ) {}

  // Métodos para crear, actualizar, eliminar y recuperar órdenes
}
