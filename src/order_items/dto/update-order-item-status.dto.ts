import { IsEnum } from 'class-validator';
import { OrderItemStatus } from '../order-item.entity';

export class UpdateOrderItemStatusDto {
    @IsEnum(OrderItemStatus)
    status: OrderItemStatus;
}

