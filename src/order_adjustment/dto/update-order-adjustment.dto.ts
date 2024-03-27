import { IsInt, IsNumber, IsOptional, IsString } from "class-validator";

export class UpdateOrderAdjustmentDto {

  @IsInt()
  @IsOptional()
  id: number;

    @IsOptional()
    @IsString()
    name: string;

    @IsOptional()
    @IsNumber()
    amount: number;
  }