import { Controller, Get, Post, Body, Put, Delete, Param, ParseIntPipe } from '@nestjs/common';
import { OrderItemsService } from './order-items.service';
import { CreateOrderItemDto } from './dto/create-order-item.dto';
import { UpdateOrderItemStatusDto } from './dto/update-order-item-status.dto';

@Controller('order-items')
export class OrderItemsController {
    constructor(private readonly orderItemsService: OrderItemsService) {}
    @Post()
    create(@Body() createOrderItemDto: CreateOrderItemDto) {
        return this.orderItemsService.create(createOrderItemDto);
    }

    @Put(':id/status')
    updateOrderItemStatus(@Param('id', ParseIntPipe) id: number, @Body() updateOrderItemStatusDto: UpdateOrderItemStatusDto) {
        return this.orderItemsService.updateOrderItemStatus(id, updateOrderItemStatusDto);
    }
}
