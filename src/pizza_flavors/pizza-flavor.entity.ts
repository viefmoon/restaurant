import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Product } from '../products/product.entity';
import { OrderItem } from '../order_items/order-item.entity';

@Entity({ name: 'pizza_flavors' })
export class PizzaFlavor {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    description: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    additionalCost: number;

    @ManyToOne(() => Product, product => product.pizzaFlavors)
    product: Product;

    @OneToMany(() => OrderItem, orderItem => orderItem.pizzaFlavor)
    orderItems: OrderItem[];
}