import { Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { OrderItem } from '../order_items/order-item.entity';
import { ProductObservation } from '../product_observations/product-observation.entity';

@Entity({ name: 'selected_product_observations' })
export class SelectedProductObservation {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => OrderItem, orderItem => orderItem.selectedProductObservations)
    orderItem: OrderItem;

    @ManyToOne(() => ProductObservation, productObservation => productObservation.selectedProductObservations)
    productObservation: ProductObservation;
}