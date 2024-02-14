import { IsOptional, IsNotEmpty, IsNumber } from 'class-validator';

export class UpdateSubcategoryDto {
    @IsOptional()
    @IsNotEmpty()
    name?: string;

    @IsOptional()
    @IsNumber()
    categoryId?: number;
}
