import { Controller } from '@nestjs/common';
import { ModifiersService } from './modifiers.service';

@Controller('modifiers')
export class ModifiersController {
    constructor(private readonly modifiersService: ModifiersService) {}

    // Métodos para crear, actualizar, eliminar y recuperar modificadores se definirán aquí
}

