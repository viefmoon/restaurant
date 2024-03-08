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
import { PizzaFlavor } from 'src/pizza_flavors/pizza-flavor.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, Table, Area, OrderItem, Product, ProductVariant, ProductObservation, SelectedProductObservation, Modifier, SelectedModifier, PizzaFlavor])], 
  providers: [OrdersService, OrderItemsService], 
  controllers: [OrdersController] 
})
export class OrdersModule {}

