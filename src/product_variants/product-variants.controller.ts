import { Controller, Post, Body, Get, Param, Put, Delete, ParseIntPipe } from '@nestjs/common';
import { ProductVariantsService } from './product-variants.service';
import { CreateProductVariantDto } from './dto/create-product-variant.dto';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto';

@Controller('product-variants')
export class ProductVariantsController {
    constructor(private readonly productVariantsService: ProductVariantsService) {}

    @Post()
    create(@Body() createProductVariantDto: CreateProductVariantDto) {
        return this.productVariantsService.create(createProductVariantDto);
    }

    @Get()
    findAll() {
        return this.productVariantsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.productVariantsService.findOne(id);
    }

    @Put(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() updateProductVariantDto: UpdateProductVariantDto) {
        return this.productVariantsService.update(id, updateProductVariantDto);
    }

    @Delete(':id')
    delete(@Param('id', ParseIntPipe) id: number) {
        return this.productVariantsService.delete(id);
    }
}
