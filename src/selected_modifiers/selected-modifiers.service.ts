import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SelectedModifier } from './selected-modifier.entity';
@Injectable()
export class SelectedModifiersService {
  constructor(
    @InjectRepository(SelectedModifier)
    private readonly selectedModifierRepository: Repository<SelectedModifier>,
  ) {}

  // Métodos para crear, actualizar, eliminar y recuperar órdenes
}
