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
        console.log("createOrderDto.orderItems", createOrderDto.orderItems);
    
        // Crea OrderItems en cascada, asegurándote de que pasas los datos correctos e imprime la respuesta de cada create
        for (const itemDto of createOrderDto.orderItems) {
            const createdItem = await this.orderItemService.create({ ...itemDto, orderId: savedOrder.id });
            console.log(createdItem);
        }
    
        return this.orderRepository.findOne({ where: { id: savedOrder.id }, relations: ['orderItems', 'table'] });
    }
    async getOpenOrders(): Promise<Order[]> {
        const orders = await this.orderRepository.find({
            where: {
                status: In([OrderStatus.created, OrderStatus.in_preparation, OrderStatus.prepared]),
            },
            relations: ['orderItems', 'table','area', 'orderItems.product', 'orderItems.product.productVariants','orderItems.product.pizzaFlavors','orderItems.product.pizzaIngredients',
            'orderItems.product.modifierTypes','orderItems.product.modifierTypes.modifiers','orderItems.product.productObservationTypes',
            'orderItems.product.productObservationTypes.productObservations', 'orderItems.productVariant', 
            'orderItems.selectedModifiers', 'orderItems.selectedModifiers.modifier', 'orderItems.selectedProductObservations', 
            'orderItems.selectedProductObservations.productObservation', 'orderItems.selectedPizzaFlavors', 'orderItems.selectedPizzaFlavors.pizzaFlavor', 'orderItems.selectedPizzaIngredients', 'orderItems.selectedPizzaIngredients.pizzaIngredient'],
        });
        orders.forEach(order => console.log(order.orderItems));
        return orders;
    }
}1
