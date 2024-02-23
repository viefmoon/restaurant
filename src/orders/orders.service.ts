import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './order.entity';
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
        let table: Table = null;
        if (createOrderDto.tableId) {
            const table = await this.tableRepository.findOne({
                where: { id: createOrderDto.tableId }
            });
            if (!table) {
                throw new Error('Table not found');
            }
        }
    
        // Asegúrate de que estás pasando el objeto completo de la mesa a la creación de la orden
        const order = this.orderRepository.create({
            ...createOrderDto,
            table: table, // Asociar la mesa si es especificada
            orderItems: [], // Inicializamos vacío; se llenará en cascada
        });
    
        const savedOrder = await this.orderRepository.save(order);
    
        // Crea OrderItems en cascada, asegurándote de que pasas los datos correctos
        for (const itemDto of createOrderDto.orderItems) {
            await this.orderItemService.create({ ...itemDto, orderId: savedOrder.id });
        }
    
        return this.orderRepository.findOne({ where: { id: savedOrder.id }, relations: ['orderItems', 'table'] });
    }
}
