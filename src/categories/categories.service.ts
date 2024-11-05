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
    try {
      const categories = await this.categoryRepository
        .createQueryBuilder('category')
        .leftJoinAndSelect('category.subcategories', 'subcategory')
        .leftJoinAndSelect('subcategory.products', 'product')
        .leftJoinAndSelect('product.productVariants', 'productVariant')
        .leftJoinAndSelect('product.modifierTypes', 'modifierType')
        .leftJoinAndSelect('modifierType.modifiers', 'modifier')
        .leftJoinAndSelect('product.pizzaFlavors', 'pizzaFlavor')
        .leftJoinAndSelect('product.pizzaIngredients', 'pizzaIngredient')
        .orderBy('category.id', 'ASC')
        .addOrderBy('subcategory.id', 'ASC')
        .addOrderBy('product.id', 'ASC')
        .addOrderBy('LENGTH(pizzaFlavor.id)', 'ASC')
        .addOrderBy('pizzaFlavor.id', 'ASC')
        .addOrderBy('LENGTH(productVariant.id)', 'ASC')
        .addOrderBy('productVariant.id', 'ASC')
        .addOrderBy('LENGTH(modifierType.id)', 'ASC')
        .addOrderBy('modifierType.id', 'ASC')
        .addOrderBy('LENGTH(modifier.id)', 'ASC')
        .addOrderBy('modifier.id', 'ASC')
        .addOrderBy('LENGTH(pizzaIngredient.id)', 'ASC')
        .addOrderBy('pizzaIngredient.id', 'ASC')
        .getMany();

      return categories;
    } catch (error) {
      throw new HttpException(
        'Error retrieving categories',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
