import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Modifier } from './modifier.entity';

@Injectable()
export class ModifiersService {
    constructor(
        @InjectRepository(Modifier)
        private readonly modifierRepository: Repository<Modifier>,
    ) {}

    // Métodos para crear, actualizar, eliminar y recuperar modificadores
}
