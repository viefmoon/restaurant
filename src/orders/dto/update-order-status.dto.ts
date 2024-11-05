import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsDate,
  IsEnum,
  IsArray,
  ValidateNested,
  IsInt,
} from 'class-validator';
import { OrderStatus, OrderType } from '../order.entity';

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus)
  status: OrderStatus;
}
