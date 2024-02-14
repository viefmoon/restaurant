import { IsOptional, IsNotEmpty } from 'class-validator';

export class UpdateCategoryDto {
    @IsOptional()
    @IsNotEmpty()
    name?: string;
}
