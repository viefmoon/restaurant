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
import { OrderPrint } from 'src/order_prints/order-print.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      Table,
      Area,
      OrderItem,
      Product,
      ProductVariant,
      Modifier,
      SelectedModifier,
      PizzaFlavor,
      SelectedPizzaFlavor,
      PizzaIngredient,
      SelectedPizzaIngredient,
      OrderUpdate,
      OrderItemUpdate,
      OrderAdjustment,
      OrderCounter,
      OrderPrint,
    ]),
  ],
  providers: [OrdersService, OrderItemsService, AppGateway],
  controllers: [OrdersController],
  exports: [TypeOrmModule],
})
export class OrdersModule {}
