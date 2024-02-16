import { Module } from '@nestjs/common';
import { OrderItemUpdatesService } from './order-item-updates.service';
import { OrderItemUpdatesController } from './order-item-updates.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderItemUpdate } from './order-item-update.entity'; // Asume una entidad Category

@Module({
  imports: [TypeOrmModule.forFeature([OrderItemUpdate])], // Importa solo las entidades relevantes para categorías
  providers: [OrderItemUpdatesService], // Provee el servicio de categorías
  controllers: [OrderItemUpdatesController] // Registra el controlador de categorías
})
export class OrderItemUpdatesModule {}

