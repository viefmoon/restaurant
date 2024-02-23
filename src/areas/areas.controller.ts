import { Body, Controller, Post, Get, Param } from '@nestjs/common';
import { AreasService } from './areas.service';
import { Area } from './area.entity';
import { Table } from '../tables/table.entity';

@Controller('areas')
export class AreasController {
    constructor(private readonly areasService: AreasService) {}

    @Get()
    async getAreas(): Promise<Area[]> {
        return this.areasService.findAll();
    }

    @Get(':id/tables')
    async getTablesFromArea(@Param('id') id: number): Promise<Table[]> {
        return this.areasService.findTablesByAreaId(id);
    }

}