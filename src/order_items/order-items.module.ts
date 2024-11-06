import { Module } from '@nestjs/common';
import { OrderItem } from './order-item.entity';
import { OrderItemsController } from './order-items.controller';
import { OrderItemsService } from './order-items.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppGateway } from 'src/app.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([OrderItem])], // Importa solo las entidades relevantes para categorías
  providers: [OrderItemsService, AppGateway], // Provee el servicio de categorías
  controllers: [OrderItemsController], // Registra el controlador de categorías
})
export class OrderItemsModule {}
