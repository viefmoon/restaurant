import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn } from 'typeorm';
import { OrderItem } from '../order_items/order-item.entity';
import { OrderUpdate } from '../order_updates/order-update.entity';
import { Table } from '../tables/table.entity';

enum OrderType {
    DELIVERY = "A domicilio",
    DINE_IN = "Para comer aquí",
    PICK_UP_WAIT = "Pasan/Esperan",
}

enum OrderStatus {
    CREATED = "Creado",
    IN_PREPARATION = "En preparacion",
    FINISHED = "Finalizado"
}

@Entity({ name: 'orders' })
export class Order {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: "enum",
        enum: OrderType,
    })
    orderType: OrderType;

    @Column({
        type: "enum",
        enum: OrderStatus,
        default: OrderStatus.CREATED
    })
    status: OrderStatus;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    amountPaid: number;

    @CreateDateColumn()
    creationDate: Date;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    total: number;

    @Column({ nullable: true })
    comments: string;

    @ManyToOne(() => Table, table => table.orders, { nullable: true })
    table: Table;

    @OneToMany(() => OrderItem, orderItem => orderItem.order, { nullable: true })
    orderItems: OrderItem[];

    @OneToMany(() => OrderUpdate, orderUpdate => orderUpdate.order, { nullable: true })
    orderUpdates: OrderUpdate[];
}