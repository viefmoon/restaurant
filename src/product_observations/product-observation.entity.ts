import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { ProductObservationType } from '../product_observation_types/product-observation-type.entity';

import { SelectedProductObservation } from '../selected_product_observations/selected-product-observation.entity';

@Entity({ name: 'product_observations' })
export class ProductObservation {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @ManyToOne(() => ProductObservationType, productObservationType => productObservationType.productObservations)
    productObservationType: ProductObservationType;

    @OneToMany(() => SelectedProductObservation, selectedProductObservation => selectedProductObservation.productObservation)
    selectedProductObservations: SelectedProductObservation[];
}