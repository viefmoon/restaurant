import { Controller, Post, Body, Get, Param, Put, Delete, ParseIntPipe } from '@nestjs/common';
import { PizzaFlavorsService } from './pizza-flavors.service';

@Controller('pizza-flavors')
export class PizzaFlavorsController {
    constructor(private readonly pizzaFlavorsService: PizzaFlavorsService) {}

}
