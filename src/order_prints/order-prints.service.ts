import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderPrint } from './order-print.entity';

@Injectable()
export class OrderPrintsService {
    constructor(
        @InjectRepository(OrderPrint)
        private readonly orderPrintRepository: Repository<OrderPrint>,
    ) {}

}
