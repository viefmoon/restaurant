import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Order } from 'src/orders/order.entity';

export enum Area {
    ARCO = 'ARCO',
    BAR = 'BAR',
    ENTRADA = 'ENTRADA',
    EQUIPAL = 'EQUIPAL',
    JARDIN = 'JARDIN'
}

export enum Status {
    AVAILABLE = 'available',
    OCCUPIED = 'occupied'
}

@Entity({ name: 'tables' })
export class Table {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    number: string;

    @Column({
        type: 'enum',
        enum: Area,
    })
    area: Area;

    @Column({
        type: 'enum',
        enum: Status,
        default: Status.AVAILABLE
    })
    status: Status;

    @OneToMany(() => Order, (order) => order.table)
    orders: Order[];
}