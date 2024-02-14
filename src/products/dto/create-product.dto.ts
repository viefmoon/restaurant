import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateProductDto {
    @IsNotEmpty()
    name: string;

    @IsNumber()
    price: number;

    @IsNumber()
    @IsNotEmpty()
    subcategoryId: number;

    // Incluir campos para relaciones cuando estén disponibles
}
