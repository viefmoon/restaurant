import { Type } from 'class-transformer';
import { 
    IsNotEmpty, 
    IsOptional, 
    ValidateNested, 
    IsArray,
    IsInt, 
} from 'class-validator';
import { Modifier } from 'src/modifiers/modifier.entity';
import { PizzaFlavor } from 'src/pizza_flavors/pizza-flavor.entity';
import { PizzaIngredient } from 'src/pizza_ingredients/pizza-ingredient.entity';
import { ProductObservation } from 'src/product_observations/product-observation.entity';
import { ProductVariant } from 'src/product_variants/product-variant.entity';
import { Product } from 'src/products/product.entity';
import { PizzaHalf } from 'src/selected_pizza_ingredients/selected-pizza-ingredient.entity';


export class SelectedModifierDto {
    @IsOptional()
    modifier?: Modifier; 
}

export class SelectedProductObservationDto {
    @IsNotEmpty()
    productObservation: ProductObservation; 
}

export class SelectedPizzaFlavorDto {
    @IsNotEmpty()
    pizzaFlavor: PizzaFlavor; 
}

export class SelectedPizzaIngredientDto {
    @IsNotEmpty()
    pizzaIngredient: PizzaIngredient; 

    
    @IsOptional()
    half: PizzaHalf;
}

export class UpdateOrderItemDto {
    @IsNotEmpty()
    @IsInt()
    id: number;

    @IsOptional()
    comments?: string;

    @IsOptional()
    orderId?: number;

    @IsNotEmpty()
    product: Product;

    @IsOptional()
    productVariant?: ProductVariant;

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

    @IsArray()
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => SelectedPizzaFlavorDto)
    selectedPizzaFlavors?: SelectedPizzaFlavorDto[];

    @IsArray()
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => SelectedPizzaIngredientDto)
    selectedPizzaIngredients?: SelectedPizzaIngredientDto[];
}

