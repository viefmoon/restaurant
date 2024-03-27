import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Order } from '../orders/order.entity';

@Entity({ name: 'order_adjustments' })
export class OrderAdjustment {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    amount: number;

    @ManyToOne(() => Order, order => order.orderAdjustments)
    order: Order;
}