import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
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
import { PrintOrderDto } from 'src/order_prints/dto/print-order.dto';

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

  @Get('/with-prints')
  async getOrdersWithPrints() {
    return this.ordersService.getOrdersWithPrints();
  }

  @Get('/delivery-prepared')
  async getDeliveryPreparedOrders(): Promise<{ id: number; orderType: string; totalCost: number }[]> {
    return this.ordersService.getDeliveryPreparedOrders();
  }
  
  @Get('/sales-report')
  async getSalesReport(): Promise<{ totalSales: number; totalAmountPaid: number; subcategories: { subcategoryName: string; totalSales: number; products: { name: string; quantity: number; totalSales: number }[] }[] }> {
    return this.ordersService.getSalesReport();
  }

  @Get('/closed')
  getClosedOrders() {
    return this.ordersService.getClosedOrders();
  }
  @Get('/delivery')
  getDeliveryOrders(): Promise<Order[]> {
    return this.ordersService.getDeliveryOrders();
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
  
  @Patch('/complete-multiple')
  async completeMultipleOrders(@Body() orderIds: number[]) {
    return this.ordersService.completeMultipleOrders(orderIds);
  }

  @Patch('/:id/print')
  async registerTicketPrint(
    @Param('id', ParseIntPipe) orderId: number,
    @Body() printOrderDto: PrintOrderDto
  ) {
    return this.ordersService.registerPrint(orderId, printOrderDto.printedBy);
  }

  @Patch('/revert-prepared-multiple')
  async revertMultipleOrdersToPrepared(@Body() orderIds: number[]): Promise<Order[]> {
    return this.ordersService.revertMultipleOrdersToPrepared(orderIds);
  }

  @Patch('/delivery/mark-in-delivery')
  markOrdersAsInDelivery(@Body() orders: Order[]): Promise<void> {
    return this.ordersService.markOrdersAsInDelivery(orders);
  }

  @Patch('/:id')
  async updateOrder(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOrderDto: UpdateOrderDto,
    @Query('userName') userName: string, // Extrae el nombre del usuario de la URL
  ) {
    return this.ordersService.updateOrder(id, updateOrderDto, userName);
  }

  @Delete('/reset-database')
  @HttpCode(HttpStatus.OK)
  async resetDatabase() {
    // Asegúrate de implementar medidas de seguridad aquí
    await this.ordersService.resetDatabase();
    return { message: 'La base de datos ha sido reseteada y el servidor se está reiniciando.' };
  }

}
