import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, ManyToMany } from 'typeorm';
import { PizzaFlavor } from 'src/pizza_flavors/pizza-flavor.entity';
import { OrderItem } from 'src/order_items/order-item.entity';

@Entity({ name: 'selected_pizza_flavors' })
export class SelectedPizzaFlavor {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => OrderItem, orderItem => orderItem.selectedPizzaFlavors)
    orderItem: OrderItem;

    @ManyToOne(() => PizzaFlavor, pizzaFlavor => pizzaFlavor.selectedPizzaFlavors)
    pizzaFlavor: PizzaFlavor;
}

