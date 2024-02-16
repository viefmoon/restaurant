import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Product } from '../products/product.entity';
import { Modifier } from '../modifiers/modifier.entity';

@Entity({ name: 'modifier_types' })
export class ModifierType {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @ManyToOne(() => Product, product => product.modifierTypes)
    product: Product;

    @OneToMany(() => Modifier, modifier => modifier.modifierType)
    modifiers: Modifier[];
}

