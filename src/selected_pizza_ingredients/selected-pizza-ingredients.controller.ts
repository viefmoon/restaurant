import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { SelectedPizzaIngredientsService } from './selected-pizza-ingredients.service';

@Controller('selected-pizza-ingredients')
export class SelectedPizzaIngredientsController {
  constructor(
    private readonly selectedPizzaIngredientsService: SelectedPizzaIngredientsService,
  ) {}
}
