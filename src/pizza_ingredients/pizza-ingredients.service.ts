import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PizzaIngredient } from './pizza-ingredient.entity';

@Injectable()
export class PizzaIngredientsService {
    constructor(
        @InjectRepository(PizzaIngredient)
        private readonly pizzaIngredientRepository: Repository<PizzaIngredient>,
    ) {}

}