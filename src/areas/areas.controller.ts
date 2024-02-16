import { Body, Controller, Post, Get, UseGuards, Put, Param, ParseIntPipe } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';
import { JwtRolesGuard } from 'src/auth/jwt/jwt-roles.guard';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableStatusDto } from './dto/update-table-status.dto';
import { TablesService } from './tables.service';
import { HasRoles } from 'src/auth/jwt/has-roles';
import { JwtRole } from 'src/auth/jwt/jwt-role';



@Controller('tables')
export class TablesController {

    constructor(private tablesService: TablesService) {}

    @HasRoles(JwtRole.WAITER, JwtRole.ADMIN)
    @UseGuards(JwtAuthGuard, JwtRolesGuard)
    @Get() // http://localhost/tables -> GET
    findAll() {
        return this.tablesService.findAll();
    }

    @HasRoles(JwtRole.WAITER, JwtRole.ADMIN)
    @UseGuards(JwtAuthGuard, JwtRolesGuard)
    @Post() // http://localhost/tables -> POST
    create(@Body() table: CreateTableDto) {
        return this.tablesService.create(table);
    }
    @HasRoles(JwtRole.WAITER, JwtRole.ADMIN)
    @UseGuards(JwtAuthGuard, JwtRolesGuard)
    @Put(':id') // http://localhost/tables/:id -> PUT
    update(@Param('id', ParseIntPipe) id: number, @Body() updateTableStatusDto: UpdateTableStatusDto) {
        return this.tablesService.updateStatus(id, updateTableStatusDto);
    }
}

