import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { PizzaIngredient } from 'src/pizza_ingredients/pizza-ingredient.entity';
import { OrderItem } from 'src/order_items/order-item.entity';

export enum PizzaHalf {
  left = 'left',
  right = 'right',
  full = 'full',
}

export enum IngredientAction {
  add = 'add',
  remove = 'remove',
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
    default: PizzaHalf.full,
  })
  half: PizzaHalf;

  @Column({
    type: 'enum',
    enum: IngredientAction,
    default: IngredientAction.add,
  })
  action: IngredientAction;

  @ManyToOne(
    () => PizzaIngredient,
    (pizzaIngredient) => pizzaIngredient.selectedPizzaIngredients,
  )
  pizzaIngredient: PizzaIngredient;
}
