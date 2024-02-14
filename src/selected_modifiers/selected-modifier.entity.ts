import { Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { OrderItem } from '../order_items/order-item.entity';
import { Modifier } from '../modifiers/modifier.entity';

@Entity({ name: 'selected_modifiers' })
export class SelectedModifier {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => OrderItem, orderItem => orderItem.selectedModifiers)
    orderItem: OrderItem;

    @ManyToOne(() => Modifier, modifier => modifier.selectedModifiers)
    modifier: Modifier;
}