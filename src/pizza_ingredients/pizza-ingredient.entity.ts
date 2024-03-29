import { Product } from 'src/products/product.entity';
import { SelectedPizzaIngredient } from 'src/selected_pizza_ingredients/selected-pizza-ingredient.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, ManyToMany } from 'typeorm';

@Entity({ name: 'pizza_ingredients' })
export class PizzaIngredient {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    price: number;
    

    @Column({
        type: "int",
    })
    ingredientValue: number;

    @ManyToOne(() => Product, product => product.pizzaIngredients)
    product: Product;

    @ManyToMany(() => SelectedPizzaIngredient, selectedPizzaIngredient => selectedPizzaIngredient.pizzaIngredient)
    selectedPizzaIngredients: SelectedPizzaIngredient[]; 
}

