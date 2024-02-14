import { Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { OrderItem } from '../orders/orderItem.entity';
import { ProductObservation } from './productObservation.entity';

@Entity({ name: 'selected_product_observations' })
export class SelectedProductObservation {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => OrderItem, orderItem => orderItem.selectedProductObservations)
    orderItem: OrderItem;

    @ManyToOne(() => ProductObservation, productObservation => productObservation.selectedProductObservations)
    productObservation: ProductObservation;
}