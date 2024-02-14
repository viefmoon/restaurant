import { Controller, Get, Post, Body, Put, Delete, Param, ParseIntPipe } from '@nestjs/common';
import { SelectedModifiersService } from './selected-modifiers.service';

@Controller('selected-modifiers')
export class SelectedModifiersController {
    constructor(private readonly selectedModifiersService: SelectedModifiersService) {}


    // Implementa los métodos GET, PUT, DELETE basándote en los ejemplos anteriores
}
