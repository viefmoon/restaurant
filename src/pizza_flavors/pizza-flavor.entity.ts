import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  ManyToMany,
} from 'typeorm';

import { SelectedPizzaFlavor } from 'src/selected_pizza_flavors/selected-pizza-flavor.entity';
import { Product } from 'src/products/product.entity';

// export enum PizzaHalf {
//   left = 'left',
//   right = 'right',
//   none = 'none',
// }

@Entity({ name: 'pizza_flavors' })
export class PizzaFlavor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price: number;

  @ManyToOne(() => Product, (product) => product.pizzaFlavors)
  product: Product;

  //   @Column({
  //     type: 'enum',
  //     enum: PizzaHalf,
  //     default: PizzaHalf.none,
  //   })
  //   half: PizzaHalf;

  @ManyToMany(
    () => SelectedPizzaFlavor,
    (selectedPizzaFlavor) => selectedPizzaFlavor.pizzaFlavor,
  )
  selectedPizzaFlavors: SelectedPizzaFlavor[];
}
