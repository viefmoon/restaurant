import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, ManyToMany } from 'typeorm';
import { PizzaIngredient } from 'src/pizza_ingredients/pizza-ingredient.entity';
import { OrderItem } from 'src/order_items/order-item.entity';

export enum PizzaHalf {
    LEFT = 'left',
    RIGHT = 'right',
    NONE = 'none',
}

@Entity({ name: 'selected_pizza_ingredients' })
export class SelectedPizzaIngredient {
    @PrimaryGeneratedColumn()
    id: number;


    @ManyToOne(() => OrderItem, orderItem => orderItem.selectedPizzaIngredients)
    orderItem: OrderItem;

    @Column({
        type: 'enum',
        enum: PizzaHalf,
    })
    half: PizzaHalf;

    @ManyToOne(() => PizzaIngredient, pizzaIngredient => pizzaIngredient.selectedPizzaIngredients)
    pizzaIngredient: PizzaIngredient;
}

