import { Controller, Get, Post, Body, Put, Delete, Param, ParseIntPipe } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Controller('orders')
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) {}

    @Post()
    create(@Body() createOrderDto: CreateOrderDto) {
        // Implementación
    }

    // Implementa los métodos GET, PUT, DELETE basándote en los ejemplos anteriores
}
