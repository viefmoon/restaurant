import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderCounter } from './order-counter.entity';

@Injectable()
export class OrderCountersService {
  constructor(
    @InjectRepository(OrderCounter)
    private readonly orderCounterRepository: Repository<OrderCounter>,
  ) {}

  // Métodos para crear, actualizar, eliminar y recuperar modificadores
}
