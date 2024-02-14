import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderItem } from './order-item.entity';

@Injectable()
export class OrderItemsService {
    constructor(
        @InjectRepository(OrderItem)
        private readonly orderItemRepository: Repository<OrderItem>,
    ) {}

    // Métodos para crear, actualizar, eliminar y recuperar órdenes
}
