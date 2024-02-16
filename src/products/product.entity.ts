import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Subcategory } from '../subcategories/subcategory.entity'
import { ProductVariant } from '../product_variants/product-variant.entity'
import { ModifierType } from '../modifier_types/modifier-type.entity'
import { ProductObservation } from '../product_observations/product-observation.entity'
import { PizzaFlavor } from '../pizza_flavors/pizza-flavor.entity'
import { OrderItem } from '../order_items/order-item.entity'

@Entity({ name: 'products' })
export class Product {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    price: number;

    @ManyToOne(() => Subcategory, subcategory => subcategory.products)
    subcategory: Subcategory;

    @OneToMany(() => ProductVariant, productVariant => productVariant.product)
    productVariants: ProductVariant[];
    
    @OneToMany(() => ModifierType, modifierType => modifierType.product)
    modifierTypes: ModifierType[];

    @OneToMany(() => ProductObservation, productObservation => productObservation.product)
    productObservations: ProductObservation[];

    @OneToMany(() => PizzaFlavor, pizzaFlavor => pizzaFlavor.product)
    pizzaFlavors: PizzaFlavor[];

    @OneToMany(() => OrderItem, orderItem => orderItem.product)
    orderItems: OrderItem[];
}
