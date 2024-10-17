import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { Product } from '../products/product.entity';
import { Modifier } from '../modifiers/modifier.entity';

@Entity({ name: 'modifier_types' })
export class ModifierType {
  @PrimaryColumn({ unique: true })
  id: string;

  @Column()
  name: string;

  @Column({ default: false })
  required: boolean;

  @Column({ default: false })
  acceptsMultiple: boolean;

  @ManyToOne(() => Product, (product) => product.modifierTypes)
  product: Product;

  @OneToMany(() => Modifier, (modifier) => modifier.modifierType)
  modifiers: Modifier[];
}
