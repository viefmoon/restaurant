import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { TableStatus } from '../table.entity';

export class CreateTableDto {
    @IsOptional()
    @IsNumber()
    number?: number;  // Opcional, para mesas regulares

    @IsOptional()
    @IsString()
    temporaryIdentifier?: string;  // Opcional, para mesas temporales

    @IsEnum(TableStatus)
    status: TableStatus = TableStatus.AVAILABLE;  // Estado de la mesa, por defecto 'Disponible'

    @IsNumber()
    areaId: number;  // ID del área a la que pertenece la mesa
}