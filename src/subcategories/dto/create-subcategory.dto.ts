import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateSubcategoryDto {
    @IsNotEmpty()
    name: string;

    @IsNumber()
    @IsNotEmpty()
    categoryId: number;
}
