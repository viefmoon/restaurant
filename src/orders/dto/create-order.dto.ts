import { IsEnum, IsOptional, IsString, ValidateNested, IsArray, IsInt, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { OrderType } from '../order.entity';
import { CreateOrderItemDto } from 'src/order_items/dto/create-order-item.dto';
import { Area } from 'src/areas/area.entity';
import { Table } from 'src/tables/table.entity';

export class CreateOrderDto {
    @IsEnum(OrderType)
    orderType: OrderType;

    @IsOptional()
    @IsString()
    comments?: string;

    @IsOptional()
    @IsString()
    deliveryAddress?: string;

    
    @IsOptional()
    @IsDate()
    @Type(() => Date) 
    scheduledDeliveryTime?: Date;

    @IsOptional()
    @IsString()
    phoneNumber?: string;


    @IsOptional()
    @IsString()
    customerName?: string;
    
    @IsOptional()
    totalCost?: number;

    @IsOptional()
    area?: Area;

    @IsOptional()
    table?: Table;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateOrderItemDto)
    orderItems: CreateOrderItemDto[];
}
