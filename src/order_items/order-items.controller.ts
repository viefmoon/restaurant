import { Controller, Get, Post, Body, Put, Delete, Param, ParseIntPipe } from '@nestjs/common';
import { OrderItemsService } from './order-items.service';
import { CreateOrderItemDto } from './dto/create-order-item.dto';
import { OrderItemStatus } from './order-item.entity';

@Controller('order-items')
export class OrderItemsController {
    constructor(private readonly orderItemsService: OrderItemsService) {}
    @Post()
    create(@Body() createOrderItemDto: CreateOrderItemDto) {
        return this.orderItemsService.create(createOrderItemDto);
    }

    @Put(':id/status')
    updateOrderItemStatus(@Param('id', ParseIntPipe) id: number, @Body() status: OrderItemStatus) {
        return this.orderItemsService.updateOrderItemStatus(id, status);
    }
}
