import { Controller, Post, Body, Get, Param, Put, Delete, ParseIntPipe } from '@nestjs/common';
import { PizzaIngredientsService } from './pizza-ingredients.service';

@Controller('pizza-ingredients')
export class PizzaIngredientsController {
    constructor(private readonly pizzaIngredientsService: PizzaIngredientsService) {}

}
