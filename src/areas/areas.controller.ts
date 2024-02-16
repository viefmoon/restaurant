import { Body, Controller, Post, Get, UseGuards, Put, Param, ParseIntPipe } from '@nestjs/common';
import { AreasService } from './areas.service';



@Controller('areas')
export class AreasController {

    constructor(private areasService: AreasService) {}
}

