import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Area } from './area.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AreasService {

    constructor(
        @InjectRepository(Area) private areasRepository: Repository<Area>,
    ) {}

}