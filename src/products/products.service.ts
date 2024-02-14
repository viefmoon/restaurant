import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
    constructor(
        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,
    ) {}

    async create(createProductDto: CreateProductDto): Promise<Product> {
        const product = this.productRepository.create(createProductDto);
        try {
            return await this.productRepository.save(product);
        } catch (error) {
            throw new HttpException('Error creating product', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async findAll(): Promise<Product[]> {
        try {
            return await this.productRepository.find({ relations: ['subcategory'] });
        } catch (error) {
            throw new HttpException('Error retrieving products', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async findOne(id: number): Promise<Product> {
        try {
            const product = await this.productRepository.findOne({ where: { id }, relations: ['subcategory'] });
            if (!product) {
                throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
            }
            return product;
        } catch (error) {
            throw new HttpException('Error retrieving product', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async update(id: number, updateProductDto: UpdateProductDto): Promise<Product> {
        const product = await this.productRepository.preload({
            id,
            ...updateProductDto,
        });

        if (!product) {
            throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
        }

        try {
            return await this.productRepository.save(product);
        } catch (error) {
            throw new HttpException('Error updating product', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async delete(id: number): Promise<void> {
        const result = await this.productRepository.delete(id);

        if (result.affected === 0) {
            throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
        }
    }
}
