import { IsEnum } from 'class-validator';
import { Status } from '../table.entity';

export class UpdateTableStatusDto {
    @IsEnum(Status)
    status: Status;
}