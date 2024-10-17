import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { Subcategory } from '../subcategories/subcategory.entity';
import { ProductVariant } from '../product_variants/product-variant.entity';
import { ModifierType } from '../modifier_types/modifier-type.entity';
import { OrderItem } from '../order_items/order-item.entity';
import { PizzaFlavor } from 'src/pizza_flavors/pizza-flavor.entity';
import { PizzaIngredient } from 'src/pizza_ingredients/pizza-ingredient.entity';
@Entity({ name: 'products' })
export class Product {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price: number | null;

  @Column({ nullable: true })
  imageUrl: string | null;

  @ManyToOne(() => Subcategory, (subcategory) => subcategory.products)
  subcategory: Subcategory;

  @OneToMany(() => ProductVariant, (productVariant) => productVariant.product)
  productVariants: ProductVariant[];

  @OneToMany(() => ModifierType, (modifierType) => modifierType.product)
  modifierTypes: ModifierType[];

  @OneToMany(() => PizzaFlavor, (pizzaFlavor) => pizzaFlavor.product)
  pizzaFlavors: PizzaFlavor[];

  @OneToMany(
    () => PizzaIngredient,
    (pizzaIngredient) => pizzaIngredient.product,
  )
  pizzaIngredients: PizzaIngredient[];

  @OneToMany(() => OrderItem, (orderItem) => orderItem.product)
  orderItems: OrderItem[];
}
