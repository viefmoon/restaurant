import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PizzaFlavor } from './pizza-flavor.entity';

@Injectable()
export class PizzaFlavorsService {
    constructor(
        @InjectRepository(PizzaFlavor)
        private readonly pizzaFlavorRepository: Repository<PizzaFlavor>,
    ) {}

}