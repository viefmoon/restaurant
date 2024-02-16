import { Module } from '@nestjs/common';
import { PizzaFlavorsService } from './pizza-flavors.service';
import { PizzaFlavorsController } from './pizza-flavors.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PizzaFlavor } from './pizza-flavor.entity'; // Asume una entidad Category

@Module({
  imports: [TypeOrmModule.forFeature([PizzaFlavor])], // Importa solo las entidades relevantes para categorías
  providers: [PizzaFlavorsService], // Provee el servicio de categorías
  controllers: [PizzaFlavorsController] // Registra el controlador de categorías
})
export class PizzaFlavorsModule {}

