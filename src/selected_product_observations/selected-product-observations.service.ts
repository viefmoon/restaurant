import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SelectedProductObservation } from './selected-product-observation.entity';

@Injectable()
export class SelectedProductObservationsService {
    constructor(
        @InjectRepository(SelectedProductObservation)
        private readonly selectedProductObservationRepository: Repository<SelectedProductObservation>,
    ) {}

}