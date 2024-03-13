import { Module } from '@nestjs/common';
import { SelectedPizzaFlavorsService } from './selected-pizza-flavors.service';
import { SelectedPizzaFlavorsController } from './selected-pizza-flavors.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SelectedPizzaFlavor } from './selected-pizza-flavor.entity'; // Asume una entidad Category

@Module({
  imports: [TypeOrmModule.forFeature([SelectedPizzaFlavor])], // Importa solo las entidades relevantes para categorías
  providers: [SelectedPizzaFlavorsService], // Provee el servicio de categorías
  controllers: [SelectedPizzaFlavorsController] // Registra el controlador de categorías
})
export class PizzaFlavorsModule {}

