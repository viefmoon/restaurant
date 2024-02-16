import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Subcategory } from '../subcategories/subcategory.entity'
import { ProductVariant } from '../product_variants/product-variant.entity'
import { ModifierType } from '../modifier_types/modifier-type.entity'
import { ProductObservationType } from '../product_observation_types/product-observation-type.entity'
import { PizzaFlavor } from '../pizza_flavors/pizza-flavor.entity'
import { OrderItem } from '../order_items/order-item.entity'

@Entity({ name: 'products' })
export class Product {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    price: number | null;

    @ManyToOne(() => Subcategory, subcategory => subcategory.products)
    subcategory: Subcategory;

    @OneToMany(() => ProductVariant, productVariant => productVariant.product)
    productVariants: ProductVariant[];
    
    @OneToMany(() => ModifierType, modifierType => modifierType.product)
    modifierTypes: ModifierType[];

    @OneToMany(() => ProductObservationType, productObservationType => productObservationType.product)
    productObservationTypes: ProductObservationType[];

    @OneToMany(() => PizzaFlavor, pizzaFlavor => pizzaFlavor.product)
    pizzaFlavors: PizzaFlavor[];

    @OneToMany(() => OrderItem, orderItem => orderItem.product)
    orderItems: OrderItem[];
}
