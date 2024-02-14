import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderUpdate } from './order-update.entity';

@Injectable()
export class OrderUpdatesService {
    constructor(
        @InjectRepository(OrderUpdate)
        private readonly orderUpdateRepository: Repository<OrderUpdate>,
    ) {}

}
