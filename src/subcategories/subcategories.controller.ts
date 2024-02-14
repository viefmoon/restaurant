import { Controller, Post, Body, Get, Param, Put, Delete, ParseIntPipe } from '@nestjs/common';
import { SubcategoriesService } from './subcategories.service';
import { CreateSubcategoryDto } from './dto/create-subcategory.dto';
import { UpdateSubcategoryDto } from './dto/update-subcategory.dto';

@Controller('subcategories')
export class SubcategoriesController {
    constructor(private readonly subcategoriesService: SubcategoriesService) {}

    @Post()
    create(@Body() createSubcategoryDto: CreateSubcategoryDto) {
        return this.subcategoriesService.create(createSubcategoryDto);
    }

    @Get()
    findAll() {
        return this.subcategoriesService.findAll();
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.subcategoriesService.findOne(id);
    }

    @Put(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() updateSubcategoryDto: UpdateSubcategoryDto) {
        return this.subcategoriesService.update(id, updateSubcategoryDto);
    }

    @Delete(':id')
    delete(@Param('id', ParseIntPipe) id: number) {
        return this.subcategoriesService.delete(id);
    }
}
