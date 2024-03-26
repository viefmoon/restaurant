import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './category.entity';
import { Redis } from 'ioredis';
import { InjectRedis } from '@nestjs-modules/ioredis';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRedis() private readonly redisClient: Redis,
  ) {}

  async findAllWithSubcategoriesAndProducts(): Promise<Category[]> {
    const cacheKey = 'categories_with_details';
    try {
      // Intentar recuperar de Redis
      const cached = await this.redisClient.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      // Si no está en caché, buscar en la base de datos
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

      // Guardar el resultado en Redis antes de retornar
      await this.redisClient.set(
        cacheKey,
        JSON.stringify(categories),
        'EX',
        10,
      ); // Expira en 1 hora

      return categories;
    } catch (error) {
      throw new HttpException(
        'Error retrieving categories',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
