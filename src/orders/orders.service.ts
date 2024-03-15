import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Order, OrderStatus } from './order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderItemsService } from 'src/order_items/order-items.service';
import { Table } from 'src/tables/table.entity';
import { AppGateway } from '../app.gateway';
import { OrderItem, OrderItemStatus } from 'src/order_items/order-item.entity';
import { UpdateOrderDto } from './dto/update-order.dto';

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

       // this.appGateway.emitOrderCreated(completeOrder); // Asegúrate de que este método exista en tu AppGateway
    
        return completeOrder;
    }

    async updateOrder(orderId: number, updateOrderDto: UpdateOrderDto): Promise<Order> {
        const order = await this.orderRepository.findOne({
            where: { id: orderId },
            relations: ['orderItems', 'table']
        });
    
        if (!order) {
            throw new HttpException('Order not found', HttpStatus.NOT_FOUND);
        }
    
        // Actualiza los campos de la orden
        order.orderType = updateOrderDto.orderType;
        order.scheduledDeliveryTime = updateOrderDto.scheduledDeliveryTime;
        order.totalCost = updateOrderDto.totalCost;
        order.comments = updateOrderDto.comments;
        order.phoneNumber = updateOrderDto.phoneNumber;
        order.deliveryAddress = updateOrderDto.deliveryAddress;
        order.customerName = updateOrderDto.customerName;
        order.area = updateOrderDto.area;
        order.table = updateOrderDto.table;
    
        await this.orderRepository.save(order);
    
        // Actualiza los OrderItems existentes o crea nuevos si es necesario
        const existingItemIds = order.orderItems.map(item => item.id);
        const updatedOrNewItems = updateOrderDto.orderItems.map(async itemDto => {
            if (itemDto.id && existingItemIds.includes(itemDto.id)) {
                // Actualiza el OrderItem existente
                return await this.orderItemService.update(itemDto.id, itemDto);
            } else {
                // Crea un nuevo OrderItem si no tiene ID o el ID no está en los existentes
                return await this.orderItemService.create({ ...itemDto, orderId: order.id });
            }
        });
    
        await Promise.all(updatedOrNewItems);
    
        // Opcional: Eliminar los OrderItems que no están en updateOrderDto
        const newItemIds = updateOrderDto.orderItems.filter(item => item.id).map(item => item.id);
        const itemsToDelete = existingItemIds.filter(id => !newItemIds.includes(id));
        if (itemsToDelete.length > 0) {
            await this.orderItemRepository.delete(itemsToDelete);
        }
    
        // Recupera la orden actualizada con sus OrderItems actualizados
        const updatedOrder = await this.orderRepository.findOne({
            where: { id: orderId },
            relations: ['orderItems', 'table']
        });

        // Llama al método emitOrderUpdated del AppGateway con el ID de la orden actualizada
        this.appGateway.emitOrderUpdated(updatedOrder.id);
    
        return updatedOrder;
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

    async updateOrderStatus(orderId: number, newStatus: OrderStatus): Promise<Order> {
        const order = await this.orderRepository.createQueryBuilder('order')
        .leftJoinAndSelect('order.orderItems', 'orderItem')
        .leftJoinAndSelect('orderItem.product', 'product')
        .leftJoinAndSelect('product.subcategory', 'subcategory')
        .leftJoinAndSelect('subcategory.category', 'category')
        .select([
            'order.id', 'order.status', 
            'orderItem.id', 'orderItem.status', 
            'subcategory.id','subcategory.name', 
            'category.id','category.name' 
        ])
        .where('order.id = :orderId', { orderId })
        .getOne();
    
    if (!order) {
        throw new Error('Order not found');
    }
    
        order.status = newStatus;
    
        if ([OrderStatus.created, OrderStatus.in_preparation, OrderStatus.prepared].includes(newStatus)) {
            await Promise.all(order.orderItems.map(async (item) => {
                switch (newStatus) {
                    case OrderStatus.created:
                        item.status = OrderItemStatus.created;
                        break;
                    case OrderStatus.in_preparation:
                        item.status = OrderItemStatus.inPreparation;
                        break;
                    case OrderStatus.prepared:
                        item.status = OrderItemStatus.prepared;
                        break;
                    default:
                        break;
                }
                await this.orderItemRepository.save(item);
            }));
        }
    
        await this.orderRepository.save(order);
    
        this.appGateway.emitOrderStatusUpdated(order);
    
        return order;
    }
}
