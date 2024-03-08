import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Order, OrderStatus } from './order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderItemsService } from 'src/order_items/order-items.service';
import { Table } from 'src/tables/table.entity';

@Injectable()
export class OrdersService {
    constructor(
        @InjectRepository(Order)
        private readonly orderRepository: Repository<Order>,
        @InjectRepository(Table)
        private readonly tableRepository: Repository<Table>,
        private readonly orderItemService: OrderItemsService, // Asume que tienes este servicio
    ) {}

    async createOrder(createOrderDto: CreateOrderDto): Promise<Order> {
        if (createOrderDto.table) {
            const table = await this.tableRepository.findOne({
                where: { id: createOrderDto.table.id }
            });
            if (!table) {
                throw new Error('Table not found');
            }
        }
    
        const order = this.orderRepository.create({
            ...createOrderDto,
            orderType: createOrderDto.orderType,
            totalCost: createOrderDto.totalCost,
            comments: createOrderDto.comments,
            scheduledDeliveryTime: createOrderDto.scheduledDeliveryTime,
            phoneNumber: createOrderDto.phoneNumber,
            customerName: createOrderDto.customerName,
            area: createOrderDto.area,
            table: createOrderDto.table,

            orderItems: [], 
        });
    
        const savedOrder = await this.orderRepository.save(order);
    
        // Crea OrderItems en cascada, asegurándote de que pasas los datos correctos
        for (const itemDto of createOrderDto.orderItems) {
            await this.orderItemService.create({ ...itemDto, orderId: savedOrder.id });
        }
    
        return this.orderRepository.findOne({ where: { id: savedOrder.id }, relations: ['orderItems', 'table'] });
    }
    async getOpenOrders(): Promise<Order[]> {
        const orders = await this.orderRepository.find({
            where: {
                status: In([OrderStatus.created, OrderStatus.in_preparation, OrderStatus.prepared]),
            },
            relations: ['orderItems', 'table','area', 'orderItems.product', 'orderItems.productVariant', 
            'orderItems.selectedModifiers', 'orderItems.selectedModifiers.modifier', 'orderItems.selectedProductObservations', 
            'orderItems.selectedProductObservations.productObservation'],
        });
        console.log(orders);
        return orders;
    }
}
