import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './order.entity'; // Asume una entidad Category
import { OrderItemsService } from 'src/order_items/order-items.service';
import { Table } from 'src/tables/table.entity';
import { Area } from 'src/areas/area.entity';
import { OrderItem } from 'src/order_items/order-item.entity';
import { Product } from 'src/products/product.entity';
import { ProductVariant } from 'src/product_variants/product-variant.entity';
import { ProductObservation } from 'src/product_observations/product-observation.entity';
import { SelectedProductObservation } from 'src/selected_product_observations/selected-product-observation.entity';
import { Modifier } from 'src/modifiers/modifier.entity';
import { SelectedModifier } from 'src/selected_modifiers/selected-modifier.entity';
import { SelectedPizzaFlavor } from 'src/selected_pizza_flavors/selected-pizza-flavor.entity';
import { PizzaIngredient } from 'src/pizza_ingredients/pizza-ingredient.entity';
import { SelectedPizzaIngredient } from 'src/selected_pizza_ingredients/selected-pizza-ingredient.entity';
import { PizzaFlavor } from 'src/pizza_flavors/pizza-flavor.entity';
import { AppGateway } from 'src/app.gateway';
import { OrderUpdate } from 'src/order_updates/order-update.entity';
import { OrderItemUpdate } from 'src/order_item_updates/order-item-update.entity';
import { OrderAdjustment } from 'src/order_adjustment/order-adjustment.entity';
import { OrderCounter } from 'src/order_counters/order-counter.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, Table, Area, OrderItem, Product, ProductVariant, ProductObservation, SelectedProductObservation, Modifier, SelectedModifier, PizzaFlavor, SelectedPizzaFlavor, PizzaIngredient, SelectedPizzaIngredient, OrderUpdate, OrderItemUpdate, OrderAdjustment, OrderCounter])], 
  providers: [OrdersService, OrderItemsService, AppGateway], 
  controllers: [OrdersController], 
  exports: [TypeOrmModule]
})
export class OrdersModule {}

