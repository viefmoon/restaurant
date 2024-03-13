import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Order, OrderStatus } from './order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderItemsService } from 'src/order_items/order-items.service';
import { Table } from 'src/tables/table.entity';
import { AppGateway } from '../app.gateway';
import { OrderItem, OrderItemStatus } from 'src/order_items/order-item.entity';

@Injectable()
export class OrdersService {
    constructor(
        @InjectRepository(Order)
        private readonly orderRepository: Repository<Order>,
        @InjectRepository(Table)
        private readonly tableRepository: Repository<Table>,
        @InjectRepository(Table)
        private readonly orderItemRepository: Repository<OrderItem>,
        private readonly orderItemService: OrderItemsService,
        private readonly appGateway: AppGateway,
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
    
        const completeOrder = await this.orderRepository.findOne({ where: { id: savedOrder.id }, relations: ['orderItems', 'table'] });

        this.appGateway.emitOrderCreated(completeOrder); // Asegúrate de que este método exista en tu AppGateway
    
        return completeOrder;
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

    // async updateOrderStatus(orderId: number, newStatus: OrderStatus): Promise<Order> {
    //     const order = await this.orderRepository.findOne({ where: { id: orderId }, relations: ['orderItems'] });
    
    //     if (!order) {
    //         throw new Error('Order not found');
    //     }
    
    //     order.status = newStatus;
    //     await this.orderRepository.save(order);
    
    //     // Si la orden cambia a "en preparación" o "preparado", actualiza también los ítems de orden
    //     if ([OrderStatus.in_preparation, OrderStatus.prepared].includes(newStatus)) {
    //         await Promise.all(order.orderItems.map(async (item) => {
    //             item.status = newStatus === OrderStatus.in_preparation ? OrderItemStatus.inPreparation : OrderItemStatus.prepared;
    //             await this.orderItemRepository.save(item);
    //         }));
    //     }
    
    //     // Emitir evento a través del WebSocket
    //     this.appGateway.emitOrderStatusUpdated(order);
    
    //     return this.orderRepository.findOne({ where: { id: orderId }, relations: ['orderItems', 'table'] });
    // }
}
