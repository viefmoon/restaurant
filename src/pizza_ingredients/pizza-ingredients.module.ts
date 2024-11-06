import { Module } from '@nestjs/common';
import { PizzaIngredientsService } from './pizza-ingredients.service';
import { PizzaIngredientsController } from './pizza-ingredients.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PizzaIngredient } from './pizza-ingredient.entity'; // Asume una entidad Category

@Module({
  imports: [TypeOrmModule.forFeature([PizzaIngredient])], // Importa solo las entidades relevantes para categorías
  providers: [PizzaIngredientsService], // Provee el servicio de categorías
  controllers: [PizzaIngredientsController], // Registra el controlador de categorías
})
export class PizzaFlavorsModule {}
