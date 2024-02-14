import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
    constructor(
        @InjectRepository(Category)
        private readonly categoryRepository: Repository<Category>,
    ) {}

    async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
        const category = this.categoryRepository.create(createCategoryDto);
        try {
            return await this.categoryRepository.save(category);
        } catch (error) {
            throw new HttpException('Error creating category', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async findAll(): Promise<Category[]> {
        try {
            return await this.categoryRepository.find();
        } catch (error) {
            throw new HttpException('Error retrieving categories', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async findOne(id: number): Promise<Category> {
        try {
            const category = await this.categoryRepository.findOneBy({ id });
            if (!category) {
                throw new HttpException('Category not found', HttpStatus.NOT_FOUND);
            }
            return category;
        } catch (error) {
            throw new HttpException('Error retrieving category', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async update(id: number, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
        const category = await this.categoryRepository.preload({
            id,
            ...updateCategoryDto,
        });

        if (!category) {
            throw new HttpException('Category not found', HttpStatus.NOT_FOUND);
        }

        try {
            return await this.categoryRepository.save(category);
        } catch (error) {
            throw new HttpException('Error updating category', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async delete(id: number): Promise<void> {
        const result = await this.categoryRepository.delete(id);

        if (result.affected === 0) {
            throw new HttpException('Category not found', HttpStatus.NOT_FOUND);
        }
    }
}
