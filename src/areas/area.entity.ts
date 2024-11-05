import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Table } from 'src/tables/table.entity';
import { Order } from 'src/orders/order.entity';

@Entity({ name: 'areas' })
export class Area {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(() => Table, (table) => table.area)
  tables: Table[];

  @OneToMany(() => Order, (order) => order.table)
  orders: Order[];
}
