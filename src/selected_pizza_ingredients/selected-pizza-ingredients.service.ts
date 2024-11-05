import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SelectedPizzaIngredient } from './selected-pizza-ingredient.entity';

@Injectable()
export class SelectedPizzaIngredientsService {
  constructor(
    @InjectRepository(SelectedPizzaIngredient)
    private readonly selectedPizzaIngredientRepository: Repository<SelectedPizzaIngredient>,
  ) {}
}
