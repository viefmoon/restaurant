import {
  IsEnum,
  IsOptional,
  IsString,
  ValidateNested,
  IsArray,
  IsInt,
  IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus, OrderType } from '../order.entity';
import { CreateOrderItemDto } from 'src/order_items/dto/create-order-item.dto';
import { Area } from 'src/areas/area.entity';
import { Table } from 'src/tables/table.entity';
import { CreateOrderAdjustmentDto } from 'src/order_adjustment/dto/create-order-adjustment.dto';


export class CreateOrderDto {
  @IsEnum(OrderType)
  orderType: OrderType;

  @IsOptional()
  @IsString()
  comments?: string;

  @IsOptional()
  @IsEnum(OrderStatus)
  status: OrderStatus;

  
  createdAt: Date;

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
  @IsString()
  createdBy?: string;

  @IsOptional()
  totalCost?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderAdjustmentDto)
  orderAdjustments: CreateOrderAdjustmentDto[];

  @IsOptional()
  area?: Area;

  @IsOptional()
  table?: Table;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  orderItems: CreateOrderItemDto[];
}
