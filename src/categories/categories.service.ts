import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './category.entity';

@Injectable()
export class CategoriesService {
    constructor(
        @InjectRepository(Category)
        private readonly categoryRepository: Repository<Category>,
    ) {}

    async findAllWithSubcategoriesAndProducts(): Promise<Category[]> {
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
            return categories;
        } catch (error) {
            throw new HttpException('Error retrieving categories', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
