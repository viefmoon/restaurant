import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subcategory } from './subcategory.entity';
import { CreateSubcategoryDto } from './dto/create-subcategory.dto';
import { UpdateSubcategoryDto } from './dto/update-subcategory.dto';

@Injectable()
export class SubcategoriesService {
    constructor(
        @InjectRepository(Subcategory)
        private readonly subcategoryRepository: Repository<Subcategory>,
    ) {}

    async create(createSubcategoryDto: CreateSubcategoryDto): Promise<Subcategory> {
        const subcategory = this.subcategoryRepository.create(createSubcategoryDto);
        try {
            return await this.subcategoryRepository.save(subcategory);
        } catch (error) {
            throw new HttpException('Error creating subcategory', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async findAll(): Promise<Subcategory[]> {
        try {
            return await this.subcategoryRepository.find({ relations: ['category'] });
        } catch (error) {
            throw new HttpException('Error retrieving subcategories', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async findOne(id: number): Promise<Subcategory> {
        try {
            const subcategory = await this.subcategoryRepository.findOne({ where: { id }, relations: ['category'] });
            if (!subcategory) {
                throw new HttpException('Subcategory not found', HttpStatus.NOT_FOUND);
            }
            return subcategory;
        } catch (error) {
            throw new HttpException('Error retrieving subcategory', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async update(id: number, updateSubcategoryDto: UpdateSubcategoryDto): Promise<Subcategory> {
        const subcategory = await this.subcategoryRepository.preload({
            id,
            ...updateSubcategoryDto,
        });

        if (!subcategory) {
            throw new HttpException('Subcategory not found', HttpStatus.NOT_FOUND);
        }

        try {
            return await this.subcategoryRepository.save(subcategory);
        } catch (error) {
            throw new HttpException('Error updating subcategory', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async delete(id: number): Promise<void> {
        const result = await this.subcategoryRepository.delete(id);

        if (result.affected === 0) {
            throw new HttpException('Subcategory not found', HttpStatus.NOT_FOUND);
        }
    }
}
