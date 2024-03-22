import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  Column,
} from 'typeorm';
import { Order } from '../orders/order.entity';
import { OrderItemUpdate } from '../order_item_updates/order-item-update.entity';

@Entity({ name: 'order_updates' })
export class OrderUpdate {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  updateAt: Date;

  @Column({ default: 1 })
  updateNumber: number;

  @ManyToOne(() => Order, (order) => order.orderUpdates)
  order: Order;

  @OneToMany(
    () => OrderItemUpdate,
    (orderItemUpdate) => orderItemUpdate.orderUpdate,
  )
  orderItemUpdates: OrderItemUpdate[];
}
