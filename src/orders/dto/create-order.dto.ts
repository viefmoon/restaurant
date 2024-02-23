import { IsEnum, IsOptional, IsString, ValidateNested, IsArray, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { OrderType } from '../order.entity';
import { CreateOrderItemDto } from 'src/order_items/dto/create-order-item.dto';

export class CreateOrderDto {
    @IsEnum(OrderType)
    orderType: OrderType;

    @IsOptional()
    @IsString()
    comments?: string;

    @IsOptional()
    @IsString()
    phoneNumber?: string;

    @IsOptional()
    @IsString()
    address?: string;

    @IsOptional()
    @IsString()
    customerName?: string;

    @IsOptional()
    @IsInt()
    tableId?: number;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateOrderItemDto)
    orderItems: CreateOrderItemDto[];
}
