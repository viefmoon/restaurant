import { IsNotEmpty, IsString, IsNumber, IsOptional, IsDate, IsEnum, IsArray, ValidateNested, IsInt } from 'class-validator';
import { OrderType } from '../order.entity';
import { Type } from 'class-transformer';
import { Area } from 'src/areas/area.entity';
import { Table } from 'src/tables/table.entity';
import { UpdateOrderItemDto } from 'src/order_items/dto/update-order-item.dto';
import { UpdateOrderAdjustmentDto } from 'src/order_adjustment/dto/update-order-adjustment.dto';

export class UpdateOrderDto {
    @IsNotEmpty()
    @IsInt()
    id: number;

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
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => UpdateOrderAdjustmentDto)
    orderAdjustments: UpdateOrderAdjustmentDto[];

    @IsOptional()
    area?: Area;

    @IsOptional()
    table?: Table;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => UpdateOrderItemDto)
    orderItems: UpdateOrderItemDto[];
}
