import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order, OrderStatus } from './order.entity';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderItem } from 'src/order_items/order-item.entity';
import { AppGateway } from 'src/app.gateway';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly appGateway: AppGateway,
  ) {}
  @Post()
  createOrder(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.createOrder(createOrderDto);
  }
  @Get('/open')
  getOpenOrders() {
    return this.ordersService.getOpenOrders();
  }
  @Get('/closed')
  getClosedOrders() {
    return this.ordersService.getClosedOrders();
  }

  @Get('/synchronize')
  async synchronizeData() {
    await this.appGateway.emitPendingOrderItemsToScreens();
    return { message: 'Synchronization initiated successfully.' };
  }

  @Get('/items/counts')
  async findOrderItemsWithCounts(
    @Query('subcategories') subcategories?: string,
    @Query('ordersLimit') ordersLimit?: number,
  ) {
    const subcategoriesArray = subcategories
      ? subcategories.split(',')
      : undefined;
    const ordersLimitNumber = ordersLimit
      ? parseInt(ordersLimit.toString(), 10)
      : undefined;
    return this.ordersService.findOrderItemsWithCounts(
      subcategoriesArray,
      ordersLimitNumber,
    );
  }

  @Get('/:id')
  getOrderById(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.getOrderById(id);
  }

  
  @Patch('/:id/cancel')
  async cancelOrder(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.cancelOrder(id);
  }
  
  @Patch('/:id/status')
  async updateOrderPreparationStatus(@Body() order: Order) {
    return this.ordersService.updateOrderPreparationStatus(order);
  }

  @Patch('/orderitems/:id/status')
  async updateOrderItemsStatus(@Body() orderItem: OrderItem) {
    return this.ordersService.updateOrderItemStatus(orderItem);
  }

  @Patch('/:id/payment')
  async registerPayment(
    @Param('id', ParseIntPipe) id: number,
    @Body() paymentDto: any,
  ) {
    return this.ordersService.registerPayment(id, paymentDto.amount);
  }

  @Patch('/:id/complete')
  async completeOrder(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.completeOrder(id);
  }

  @Patch('/:id')
  async updateOrder(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOrderDto: UpdateOrderDto,
    @Query('userName') userName: string, // Extrae el nombre del usuario de la URL
  ) {
    return this.ordersService.updateOrder(id, updateOrderDto, userName);
  }

}
