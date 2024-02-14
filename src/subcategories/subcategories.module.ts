import { Module } from '@nestjs/common';
import { SubcategoriesService } from './subcategories.service';
import { SubcategoriesController } from './subcategories.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subcategory } from './subcategory.entity'; 

@Module({
  imports: [TypeOrmModule.forFeature([Subcategory])], 
  providers: [SubcategoriesService], 
  controllers: [SubcategoriesController] 
})
export class SubcategoriesModule {}