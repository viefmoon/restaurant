import { Controller } from '@nestjs/common';
import { ModifierTypesService } from './modifier-types.service';

@Controller('modifier-types')
export class ModifierTypesController {
    constructor(private readonly modifierTypesService: ModifierTypesService) {}

    // Métodos para crear, actualizar, eliminar y recuperar modificadores se definirán aquí
}

