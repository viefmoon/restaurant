import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Area } from './area.entity';
import { Repository } from 'typeorm';
import { Table } from '../tables/table.entity';

@Injectable()
export class AreasService {
  constructor(
    @InjectRepository(Area) private areasRepository: Repository<Area>,
  ) {}

  async findAll(): Promise<Area[]> {
    return this.areasRepository.find();
  }

  async findTablesByAreaId(id: number): Promise<Table[]> {
    const areaWithTables = await this.areasRepository
      .createQueryBuilder('area')
      .leftJoinAndSelect('area.tables', 'table')
      .where('area.id = :id', { id })
      .andWhere('table.temporaryIdentifier IS NULL')
      .getOne();

    return areaWithTables ? areaWithTables.tables : [];
  }
}
