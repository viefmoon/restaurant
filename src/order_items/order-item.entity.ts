import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Order } from '../orders/order.entity';
import { Product } from '../products/product.entity';
import { ProductVariant } from '../product_variants/product-variant.entity';
import { SelectedModifier } from '../selected_modifiers/selected-modifier.entity';
import { SelectedProductObservation } from '../selected_product_observations/selected-product-observation.entity';
import { PizzaFlavor } from '../pizza_flavors/pizza-flavor.entity';
import { OrderItemUpdate } from '../order_item_updates/order-item-update.entity';

export enum OrderItemStatus {
    CREATED = "creado",
    IN_PREPARATION = "en preparación",
    FINISHED = "finalizado"
}

@Entity({ name: 'order_items' })
export class OrderItem {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: "enum",
        enum: OrderItemStatus,
        default: OrderItemStatus.CREATED
    })
    status: OrderItemStatus;

    @Column({ nullable: true })
    comments: string;

    @ManyToOne(() => Order, order => order.orderItems)
    order: Order;

    @ManyToOne(() => Product, product => product.orderItems)
    product: Product;

    @ManyToOne(() => ProductVariant, productVariant => productVariant.orderItems)
    productVariant: ProductVariant;

    @OneToMany(() => SelectedModifier, selectedModifier => selectedModifier.orderItem, { nullable: true })
    selectedModifiers: SelectedModifier[];

    @OneToMany(() => SelectedProductObservation, selectedProductObservation => selectedProductObservation.orderItem, { nullable: true })
    selectedProductObservations: SelectedProductObservation[];

    @ManyToOne(() => PizzaFlavor, pizzaFlavor => pizzaFlavor.orderItems, { nullable: true })
    pizzaFlavor: PizzaFlavor;

    @OneToMany(() => OrderItemUpdate, orderItemUpdate => orderItemUpdate.orderItem, { nullable: true })
    orderItemUpdates: OrderItemUpdate[];
}