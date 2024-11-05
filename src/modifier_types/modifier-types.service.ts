import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ModifierType } from './modifier-type.entity';

@Injectable()
export class ModifierTypesService {
  constructor(
    @InjectRepository(ModifierType)
    private readonly modifierTypeRepository: Repository<ModifierType>,
  ) {}

  // Métodos para crear, actualizar, eliminar y recuperar modificadores
}
