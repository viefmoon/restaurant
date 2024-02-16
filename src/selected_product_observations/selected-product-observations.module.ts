import { Module } from '@nestjs/common';
import { SelectedProductObservationsService } from './selected-product-observations.service';
import { SelectedProductObservationsController } from './selected-product-observations.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SelectedProductObservation } from './selected-product-observation.entity'; // Asume una entidad Category

@Module({
  imports: [TypeOrmModule.forFeature([SelectedProductObservation])], // Importa solo las entidades relevantes para categorías
  providers: [SelectedProductObservationsService], // Provee el servicio de categorías
  controllers: [SelectedProductObservationsController] // Registra el controlador de categorías
})
export class SelectedProductObservationsModule {}

