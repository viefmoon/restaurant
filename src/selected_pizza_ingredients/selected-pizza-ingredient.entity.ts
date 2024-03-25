import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  ManyToMany,
} from 'typeorm';
import { PizzaIngredient } from 'src/pizza_ingredients/pizza-ingredient.entity';
import { OrderItem } from 'src/order_items/order-item.entity';

export enum PizzaHalf {
  left = 'left',
  right = 'right',
  none = 'none',
}

@Entity({ name: 'selected_pizza_ingredients' })
export class SelectedPizzaIngredient {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => OrderItem, (orderItem) => orderItem.selectedPizzaIngredients)
  orderItem: OrderItem;

  @Column({
    type: 'enum',
    enum: PizzaHalf,
    default: PizzaHalf.none,
  })
  half: PizzaHalf;

  @ManyToOne(
    () => PizzaIngredient,
    (pizzaIngredient) => pizzaIngredient.selectedPizzaIngredients,
  )
  pizzaIngredient: PizzaIngredient;
}
