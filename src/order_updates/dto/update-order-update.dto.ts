import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsDate,
} from 'class-validator';

export class UpdateOrderDto {
  @IsOptional()
  @IsNumber()
  updateNumber?: number;

  @IsOptional()
  @IsString()
  updatedBy?: string;

  @IsOptional()
  @IsDate()
  updateAt?: Date;
}
