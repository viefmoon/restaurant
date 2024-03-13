import { Controller, Post, Body, Get, Param, Put, Delete, ParseIntPipe } from '@nestjs/common';
import { SelectedPizzaFlavorsService } from './selected-pizza-flavors.service';

@Controller('selected-pizza-flavors')
export class SelectedPizzaFlavorsController {
    constructor(private readonly selectedPizzaFlavorsService: SelectedPizzaFlavorsService) {}

}
