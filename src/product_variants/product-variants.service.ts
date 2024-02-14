import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductVariant } from './product-variant.entity';
import { CreateProductVariantDto } from './dto/create-product-variant.dto';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto';

@Injectable()
export class ProductVariantsService {
    constructor(
        @InjectRepository(ProductVariant)
        private readonly productVariantRepository: Repository<ProductVariant>,
    ) {}

    async create(createProductVariantDto: CreateProductVariantDto): Promise<ProductVariant> {
        const productVariant = this.productVariantRepository.create(createProductVariantDto);
        try {
            return await this.productVariantRepository.save(productVariant);
        } catch (error) {
            throw new HttpException('Error creating product variant', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async findAll(): Promise<ProductVariant[]> {
        try {
            return await this.productVariantRepository.find({ relations: ['product'] });
        } catch (error) {
            throw new HttpException('Error retrieving product variants', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async findOne(id: number): Promise<ProductVariant> {
        try {
            const productVariant = await this.productVariantRepository.findOne({ where: { id }, relations: ['product'] });
            if (!productVariant) {
                throw new HttpException('Product variant not found', HttpStatus.NOT_FOUND);
            }
            return productVariant;
        } catch (error) {
            throw new HttpException('Error retrieving product variant', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async update(id: number, updateProductVariantDto: UpdateProductVariantDto): Promise<ProductVariant> {
        const productVariant = await this.productVariantRepository.preload({
            id,
            ...updateProductVariantDto,
        });

        if (!productVariant) {
            throw new HttpException('Product variant not found', HttpStatus.NOT_FOUND);
        }

        try {
            return await this.productVariantRepository.save(productVariant);
        } catch (error) {
            throw new HttpException('Error updating product variant', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async delete(id: number): Promise<void> {
        const result = await this.productVariantRepository.delete(id);

        if (result.affected === 0) {
            throw new HttpException('Product variant not found', HttpStatus.NOT_FOUND);
        }
    }
}