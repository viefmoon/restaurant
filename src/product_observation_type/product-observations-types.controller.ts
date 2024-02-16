import { Controller, Post, Body, Get, Param, Put, Delete, ParseIntPipe } from '@nestjs/common';
import { ProductObservationsService } from './product-observations.service';

@Controller('product-observations')
export class ProductObservationsController {
    constructor(private readonly productObservationsService: ProductObservationsService) {}


}
