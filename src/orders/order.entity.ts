import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  ManyToMany,
} from 'typeorm';
import { OrderItem } from '../order_items/order-item.entity';
import { OrderUpdate } from '../order_updates/order-update.entity';
import { Table } from '../tables/table.entity';
import { Area } from 'src/areas/area.entity';
import { OrderAdjustment } from 'src/order_adjustment/order-adjustment.entity';
import { OrderPrint } from 'src/order_prints/order-print.entity';
export enum OrderType {
  dineIn = 'dineIn',
  delivery = 'delivery',
  pickup = 'pickup',
}

export enum OrderStatus {
  created = 'created',
  in_preparation = 'in_preparation',
  prepared = 'prepared',
  in_delivery = 'in_delivery',
  finished = 'finished',
  canceled = 'canceled',
}

export enum OrderPreparationStatus {
  created = 'created',
  in_preparation = 'in_preparation',
  prepared = 'prepared',
  not_required = 'not_required',
}

@Entity({ name: 'orders' })
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'int',
    nullable: true,
  })
  orderNumber: number;

  @Column({
    type: 'enum',
    enum: OrderType,
  })
  orderType: OrderType;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.created,
  })
  status: OrderStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  amountPaid: number;

  @CreateDateColumn()
  creationDate: Date;

  @CreateDateColumn({ nullable: true })
  completionDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  scheduledDeliveryTime: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  totalCost: number;

  @Column({ nullable: true })
  comments: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ nullable: true })
  deliveryAddress: string;

  @Column({ nullable: true })
  customerName: string;

  @Column({ type: 'varchar', nullable: true })
  createdBy: string;

  @Column({
    type: 'enum',
    enum: OrderPreparationStatus,
  })
  barPreparationStatus: OrderPreparationStatus;

  @Column({
    type: 'enum',
    enum: OrderPreparationStatus,
  })
  burgerPreparationStatus: OrderPreparationStatus;

  @Column({
    type: 'enum',
    enum: OrderPreparationStatus,
  })
  pizzaPreparationStatus: OrderPreparationStatus;

  @ManyToOne(() => Area, (area) => area.orders, { nullable: true })
  area: Area;

  @ManyToOne(() => Table, (table) => table.orders, { nullable: true })
  table: Table;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, {
    nullable: true,
  })
  orderItems: OrderItem[];

  @OneToMany(
    () => OrderAdjustment,
    (orderAdjustment) => orderAdjustment.order,
    { nullable: true },
  )
  orderAdjustments: OrderAdjustment[];

  @OneToMany(() => OrderUpdate, (orderUpdate) => orderUpdate.order, {
    nullable: true,
  })
  orderUpdates: OrderUpdate[];

  @OneToMany(() => OrderPrint, (orderPrint) => orderPrint.order, {
    nullable: true,
  })
  orderPrints: OrderPrint[];
}
