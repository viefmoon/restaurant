import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Product } from '../products/product.entity';
import { ProductObservation } from '../product_observations/product-observation.entity';

@Entity({ name: 'product_observation_types' })
export class ProductObservationType {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @ManyToOne(() => Product, product => product.productObservationTypes)
    product: Product;

    @Column({ default: false })
    acceptsMultiple: boolean;

    @OneToMany(() => ProductObservation, productObservation => productObservation.productObservationType)
    productObservations: ProductObservation[];
}

