import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Product } from '../products/product.entity';
import { OrderItem } from '../order_items/order-item.entity';

@Entity({ name: 'product_variants' })
export class ProductVariant {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    price: number;

    @ManyToOne(() => Product, product => product.productVariants)
    product: Product;

    @OneToMany(() => OrderItem, orderItem => orderItem.productVariant)
    orderItems: OrderItem[];
}
