import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Order } from '../orders/order.entity';
import { Product } from '../products/product.entity';
import { ProductVariant } from '../product_variants/product-variant.entity';
import { SelectedModifier } from '../selected_modifiers/selected-modifier.entity';
import { SelectedProductObservation } from '../selected_product_observations/selected-product-observation.entity';
import { OrderItemUpdate } from '../order_item_updates/order-item-update.entity';
import { SelectedPizzaFlavor } from 'src/selected_pizza_flavors/selected-pizza-flavor.entity';
import { SelectedPizzaIngredient } from 'src/selected_pizza_ingredients/selected-pizza-ingredient.entity';

export enum OrderItemStatus { created = "created", in_preparation = "in_preparation", prepared = "prepared", canceled = "canceled" }

@Entity({ name: 'order_items' })
export class OrderItem {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: "enum",
        enum: OrderItemStatus,
        default: OrderItemStatus.created
    })
    status: OrderItemStatus;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    price: number;

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

    @OneToMany(() => SelectedPizzaFlavor, selectedPizzaFlavor => selectedPizzaFlavor.orderItem)
    selectedPizzaFlavors: SelectedPizzaFlavor[];
    
    @OneToMany(() => SelectedPizzaIngredient, selectedPizzaIngredient => selectedPizzaIngredient.orderItem)
    selectedPizzaIngredients: SelectedPizzaIngredient[];

    @OneToMany(() => OrderItemUpdate, orderItemUpdate => orderItemUpdate.orderItem, { nullable: true })
    orderItemUpdates: OrderItemUpdate[];
}