import { Controller, Get, Post, Body, Put, Delete, Param, ParseIntPipe } from '@nestjs/common';
import { OrderItemsService } from './order-items.service';

@Controller('order-items')
export class OrderItemsController {
    constructor(private readonly orderItemsService: OrderItemsService) {}


    // Implementa los métodos GET, PUT, DELETE basándote en los ejemplos anteriores
}
