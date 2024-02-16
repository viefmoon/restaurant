import { IsEnum, IsNumber, IsOptional } from 'class-validator';
import { Status } from '../table.entity';
import { Area } from '../../areas/area.entity';

export class CreateTableDto {
    @IsNumber()
    number: number;

    @IsOptional()
    @IsEnum(Status)
    status?: Status;

    area: Area;
}

