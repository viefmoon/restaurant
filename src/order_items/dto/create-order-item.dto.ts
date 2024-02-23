import { Type } from 'class-transformer';
import { 
    IsNotEmpty, 
    IsOptional, 
    IsEnum, 
    ValidateNested, 
    IsArray, 
    IsInt 
} from 'class-validator';
import { OrderItemStatus } from '../order-item.entity';

export class SelectedModifierDto {
    @IsNotEmpty()
    modifierId: number; 
}

export class SelectedProductObservationDto {
    @IsNotEmpty()
    productObservationId: number; 
}

export class CreateOrderItemDto {
    @IsEnum(OrderItemStatus)
    status: OrderItemStatus = OrderItemStatus.CREATED; 

    @IsOptional()
    comments?: string;

    @IsNotEmpty()
    orderId: number;

    @IsNotEmpty()
    productId: number;

    @IsOptional()
    productVariantId?: number;

    
    @IsOptional()
    pizzaFlavorId?: number;

    @IsArray()
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => SelectedModifierDto)
    selectedModifiers?: SelectedModifierDto[];

    @IsArray()
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => SelectedProductObservationDto)
    selectedProductObservations?: SelectedProductObservationDto[];
}

