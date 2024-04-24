import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne } from 'typeorm';
import { Order } from 'src/orders/order.entity';
import { Area } from 'src/areas/area.entity';

export enum TableStatus {
    AVAILABLE = 'Disponible',
    OCCUPIED = 'Ocupada'
}

@Entity({ name: 'tables' })
export class Table {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true }) 
    number: number;
    
    @Column({ nullable: true })
    temporaryIdentifier: string;

    @Column({
        type: 'enum',
        enum: TableStatus,
        default: TableStatus.AVAILABLE
    })
    status: TableStatus;

    @ManyToOne(() => Area, (area) => area.tables)
    area: Area;

    @OneToMany(() => Order, (order) => order.table)
    orders: Order[];

}