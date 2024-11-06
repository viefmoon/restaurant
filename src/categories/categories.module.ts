import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './category.entity'; // Asume una entidad Category

@Module({
  imports: [TypeOrmModule.forFeature([Category])], // Importa solo las entidades relevantes para categorías
  providers: [CategoriesService], // Provee el servicio de categorías
  controllers: [CategoriesController], // Registra el controlador de categorías
})
export class CategoriesModule {}
