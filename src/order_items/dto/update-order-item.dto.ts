import { IsNotEmpty, IsString, IsNumber, IsOptional, IsDate } from 'class-validator';

export class UpdateOrderDto {
    @IsNotEmpty()
    @IsString()
    orderType?: string;

    @IsNotEmpty()
    @IsString()
    status?: string;

    @IsNumber()
    amountPaid?: number;

    @IsNumber()
    total?: number;

    @IsOptional()
    @IsString()
    comments?: string;

    // Incluye tableId si la entidad Table está disponible
    // @IsOptional()
    // @IsNumber()
    // tableId?: number;
}
