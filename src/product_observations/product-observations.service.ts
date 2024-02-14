import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductObservation } from './product-observation.entity';

@Injectable()
export class ProductObservationsService {
    constructor(
        @InjectRepository(ProductObservation)
        private readonly productObservationRepository: Repository<ProductObservation>,
    ) {}

}