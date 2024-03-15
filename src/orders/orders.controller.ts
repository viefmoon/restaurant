import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus } from './order.entity';

@Controller('orders')
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) {}
    @Post()
    createOrder(@Body() createOrderDto: CreateOrderDto) {
        return this.ordersService.createOrder(createOrderDto);
    }
    @Get('/open')
    getOpenOrders() {
        return this.ordersService.getOpenOrders();
    }

    @Patch(':id/status')
    async updateOrderStatus(@Param('id', ParseIntPipe) id: number, @Body() status: OrderStatus) {
    return this.ordersService.updateOrderStatus(id, status);
    }
}
