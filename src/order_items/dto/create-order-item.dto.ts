import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsEnum,
  ValidateNested,
  IsArray,
  IsInt,
} from 'class-validator';
import { Modifier } from 'src/modifiers/modifier.entity';
import { Order } from 'src/orders/order.entity';
import { PizzaFlavor } from 'src/pizza_flavors/pizza-flavor.entity';
import { PizzaIngredient } from 'src/pizza_ingredients/pizza-ingredient.entity';
import { ProductVariant } from 'src/product_variants/product-variant.entity';
import { Product } from 'src/products/product.entity';
import { PizzaHalf } from 'src/selected_pizza_ingredients/selected-pizza-ingredient.entity';
import { OrderItemStatus } from '../order-item.entity';

export class SelectedModifierDto {
  @IsOptional()
  modifier?: Modifier;
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

export class CreateOrderItemDto {
  @IsOptional()
  comments?: string;

  @IsNotEmpty()
  product: Product;

  @IsOptional()
  order: Order;

  @IsOptional()
  status: OrderItemStatus;

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
  @Type(() => SelectedPizzaFlavorDto)
  selectedPizzaFlavors?: SelectedPizzaFlavorDto[];

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => SelectedPizzaIngredientDto)
  selectedPizzaIngredients?: SelectedPizzaIngredientDto[];
}
