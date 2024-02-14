import { IsOptional, IsNumber } from 'class-validator';

export class UpdateProductDto {
    @IsOptional()
    name?: string;

    @IsOptional()
    @IsNumber()
    price?: number;

    @IsOptional()
    @IsNumber()
    subcategoryId?: number;

    // Incluir campos opcionales para relaciones cuando estén disponibles
}
