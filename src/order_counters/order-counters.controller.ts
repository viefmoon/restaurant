import { Controller } from '@nestjs/common';
import { OrderCountersService } from './order-counters.service';

@Controller('order-counters')
export class OrderCountersController {
    constructor(private readonly orderCountersService: OrderCountersService) {}

    // Métodos para crear, actualizar, eliminar y recuperar modificadores se definirán aquí
}

