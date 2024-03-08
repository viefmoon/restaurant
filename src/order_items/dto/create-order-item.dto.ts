import { Type } from 'class-transformer';
import { 
    IsNotEmpty, 
    IsOptional, 
    IsEnum, 
    ValidateNested, 
    IsArray, 
    IsInt 
} from 'class-validator';
import { Modifier } from 'src/modifiers/modifier.entity';
import { ProductObservation } from 'src/product_observations/product-observation.entity';
import { ProductVariant } from 'src/product_variants/product-variant.entity';
import { Product } from 'src/products/product.entity';


export class SelectedModifierDto {
    @IsOptional()
    modifier?: Modifier; 
}

export class SelectedProductObservationDto {
    @IsNotEmpty()
    productObservation: ProductObservation; 
}

export class CreateOrderItemDto {

    @IsOptional()
    comments?: string;

    @IsOptional()
    orderId?: number;

    @IsOptional()
    product?: Product;

    @IsOptional()
    productVariant?: ProductVariant;

    
    @IsOptional()
    pizzaFlavorId?: number;

    @IsOptional()
    price: number;

    @IsArray()
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => SelectedModifierDto)
    selectedModifiers?: SelectedModifierDto[];

    @IsArray()
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => SelectedProductObservationDto)
    selectedProductObservations?: SelectedProductObservationDto[];
}

