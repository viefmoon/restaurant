import { Module } from '@nestjs/common';
import { OrderUpdatesService } from './order-updates.service';
import { OrderUpdatesController } from './order-updates.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderUpdate } from './order-update.entity'; // Asume una entidad Category

@Module({
  imports: [TypeOrmModule.forFeature([OrderUpdate])], // Importa solo las entidades relevantes para categorías
  providers: [OrderUpdatesService], // Provee el servicio de categorías
  controllers: [OrderUpdatesController], // Registra el controlador de categorías
})
export class OrderUpdatesModule {}
