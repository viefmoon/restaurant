import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SelectedPizzaFlavor } from './selected-pizza-flavor.entity';

@Injectable()
export class SelectedPizzaFlavorsService {
    constructor(
        @InjectRepository(SelectedPizzaFlavor)
        private readonly selectedPizzaFlavorRepository: Repository<SelectedPizzaFlavor>,
    ) {}

}