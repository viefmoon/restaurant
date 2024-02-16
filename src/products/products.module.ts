import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './product.entity'; // Asume una entidad Category

@Module({
  imports: [TypeOrmModule.forFeature([Product])], 
  providers: [ProductsService], 
  controllers: [ProductsController] 
})
export class ProductsModule {}

