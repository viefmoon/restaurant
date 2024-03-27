import { IsNumber, IsOptional, IsString, IsInt } from "class-validator";

export class CreateOrderAdjustmentDto {

    @IsOptional()
    @IsString()
    name: string;

    @IsOptional()
    @IsNumber()
    amount: number;
    
  }