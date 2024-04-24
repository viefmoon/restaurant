import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './category.entity';
// import { Redis } from 'ioredis';
// import { InjectRedis } from '@nestjs-modules/ioredis';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    // @InjectRedis() private readonly redisClient: Redis,
  ) {}

  async findAllWithSubcategoriesAndProducts(): Promise<Category[]> {
    const cacheKey = 'categories_with_details';
    try {
      const categories = await this.categoryRepository.find({
        relations: [
          'subcategories',
          'subcategories.products',
          'subcategories.products.productVariants',
          'subcategories.products.modifierTypes',
          'subcategories.products.modifierTypes.modifiers',
          'subcategories.products.productObservationTypes',
          'subcategories.products.productObservationTypes.productObservations',
          'subcategories.products.pizzaFlavors',
          'subcategories.products.pizzaIngredients',
        ],
      });
  
      // Ordenar pizzaFlavors y pizzaIngredients por ID de forma ascendente después de la carga
      categories.forEach(category => {
        category.subcategories.forEach(subcategory => {
          subcategory.products.forEach(product => {
            if (product.pizzaFlavors) {
              product.pizzaFlavors.sort((a, b) => a.id - b.id);
            }
            if (product.pizzaIngredients) {
              product.pizzaIngredients.sort((a, b) => a.id - b.id);
            }
          });
        });
      });
  
      return categories;
    } catch (error) {
      throw new HttpException(
        'Error retrieving categories',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
