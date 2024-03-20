import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { OrderItem } from '../order_items/order-item.entity';
import { OrderUpdate } from '../order_updates/order-update.entity';

@Entity({ name: 'order_item_updates' })
export class OrderItemUpdate {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => OrderItem, orderItem => orderItem.orderItemUpdates)
    orderItem: OrderItem;

    @ManyToOne(() => OrderUpdate, orderUpdate => orderUpdate.orderItemUpdates)
    orderUpdate: OrderUpdate;

    @Column({ type: 'boolean' })
    isNewOrderItem: boolean; 
}