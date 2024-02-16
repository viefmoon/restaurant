import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Area, Status } from '../table.entity';

export class CreateTableDto {
    @IsString()
    number: string;

    @IsEnum(Area)
    area: Area;

    @IsOptional()
    @IsEnum(Status)
    status?: Status;
}