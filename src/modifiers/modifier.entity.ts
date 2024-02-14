import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Product } from '../products/product.entity';
import { SelectedModifier } from './selectedModifier.entity';

@Entity({ name: 'modifiers' })
export class Modifier {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    price: number;

    @ManyToOne(() => Product, product => product.modifiers)
    product: Product;

    @OneToMany(() => SelectedModifier, selectedModifier => selectedModifier.modifier)
    selectedModifiers: SelectedModifier[];
}