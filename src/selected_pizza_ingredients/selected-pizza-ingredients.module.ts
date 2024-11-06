import { Module } from '@nestjs/common';
import { SelectedPizzaIngredientsService } from './selected-pizza-ingredients.service';
import { SelectedPizzaIngredientsController } from './selected-pizza-ingredients.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SelectedPizzaIngredient } from './selected-pizza-ingredient.entity'; // Asume una entidad Category

@Module({
  imports: [TypeOrmModule.forFeature([SelectedPizzaIngredient])], // Importa solo las entidades relevantes para categorías
  providers: [SelectedPizzaIngredientsService], // Provee el servicio de categorías
  controllers: [SelectedPizzaIngredientsController], // Registra el controlador de categorías
})
export class PizzaFlavorsModule {}
