import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductObservationType } from './product-observation-type.entity';

@Injectable()
export class ProductObservationTypesService {
    constructor(
        @InjectRepository(ProductObservationType)
        private readonly productObservationTypeRepository: Repository<ProductObservationType>,
    ) {}

}