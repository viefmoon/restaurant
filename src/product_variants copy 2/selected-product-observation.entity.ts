import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Product } from '../products/product.entity';
import { SelectedProductObservation } from './selectedProductObservation.entity';

@Entity({ name: 'product_observations' })
export class ProductObservation {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @ManyToOne(() => Product, product => product.productObservations)
    product: Product;

    @OneToMany(() => SelectedProductObservation, selectedProductObservation => selectedProductObservation.productObservation)
    selectedProductObservations: SelectedProductObservation[];
}