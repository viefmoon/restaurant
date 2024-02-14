import { Controller, Get, Post, Body, Put, Delete, Param, ParseIntPipe } from '@nestjs/common';
import { SelectedProductObservationsService } from './selected-product-observations.service';

@Controller('selected-product-observations')
export class SelectedProductObservationsController {
    constructor(private readonly selectedProductObservationsService: SelectedProductObservationsService) {}


    // Implementa los métodos GET, PUT, DELETE basándote en los ejemplos anteriores
}
