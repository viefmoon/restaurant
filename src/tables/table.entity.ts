import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne } from 'typeorm';
import { Order } from 'src/orders/order.entity';
import { Area } from 'src/areas/area.entity';

export enum Status {
    AVAILABLE = 'disponible',
    OCCUPIED = 'ocupada'
}

@Entity({ name: 'tables' })
export class Table {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    number: string;

    @Column({
        type: 'enum',
        enum: Status,
        default: Status.AVAILABLE
    })
    status: Status;

    @ManyToOne(() => Area, (area) => area.tables)
    area: Area;

    @OneToMany(() => Order, (order) => order.table)
    orders: Order[];

}