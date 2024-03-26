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
  ) {
    this.testRedisConnection();
  }
  async testRedisConnection() {
    try {
      await this.redisClient.set('test_connection', 'OK', 'EX', 30); // Expira en 30 segundos
      const reply = await this.redisClient.get('test_connection');
      console.log('Test Redis connection:', reply); // Debería imprimir 'OK'
    } catch (error) {
      console.error('Redis connection test failed:', error);
    }
  }
  async findAllWithSubcategoriesAndProducts(): Promise<Category[]> {
    const cacheKey = 'categories_with_details';
    try {
      console.log('Intentando recuperar de Redis');
      const cached = await this.redisClient.get(cacheKey);
      if (cached) {
        console.log('Datos recuperados de Redis');
        return JSON.parse(cached);
      }

      console.log(
        'Datos no encontrados en Redis, buscando en la base de datos',
      );
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

      console.log('Guardando datos en Redis');
      await this.redisClient.set(
        cacheKey,
        JSON.stringify(categories),
        'EX',
        10,
      ); // Expira en 10 segundos

      return categories;
    } catch (error) {
      console.error('Error al recuperar las categorías', error);
      throw new HttpException(
        'Error retrieving categories',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
