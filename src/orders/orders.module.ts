import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './order.entity'; // Asume una entidad Category

@Module({
  imports: [TypeOrmModule.forFeature([Order])], // Importa solo las entidades relevantes para categorías
  providers: [OrdersService], // Provee el servicio de categorías
  controllers: [OrdersController] // Registra el controlador de categorías
})
export class CategoriesModule {}