import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  Column,
} from 'typeorm';
import { Order } from '../orders/order.entity';

@Entity({ name: 'order_prints' })
export class OrderPrint {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  printTime: Date;

  @Column({ type: 'varchar', nullable: true })
  printedBy: string;

  @ManyToOne(() => Order, (order) => order.orderPrints)
  order: Order;
}
