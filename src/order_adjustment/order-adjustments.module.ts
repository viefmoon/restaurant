import { Module } from '@nestjs/common';
import { OrderAdjustmentsService } from './order-adjustments.service';
import { OrderAdjustmentsController } from './order-adjustments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderAdjustment } from './order-adjustment.entity'; // Asume una entidad Category

@Module({
  imports: [TypeOrmModule.forFeature([OrderAdjustment])], // Importa solo las entidades relevantes para categorías
  providers: [OrderAdjustmentsService], // Provee el servicio de categorías
  controllers: [OrderAdjustmentsController] // Registra el controlador de categorías
})
export class OrderAdjustmentsModule {}

