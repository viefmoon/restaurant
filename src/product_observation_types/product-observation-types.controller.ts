import { Controller, Post, Body, Get, Param, Put, Delete, ParseIntPipe } from '@nestjs/common';
import { ProductObservationTypesService } from './product-observation-types.service';

@Controller('product-observation-types')
export class ProductObservationTypesController {
    constructor(private readonly productObservationTypesService: ProductObservationTypesService) {}


}
