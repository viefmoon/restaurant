import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Table } from './table.entity'; // Asegúrate de importar la entidad correcta
import { Repository } from 'typeorm';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableStatusDto } from './dto/update-table-status.dto';

@Injectable()
export class TablesService {
  constructor(
    @InjectRepository(Table) private tablesRepository: Repository<Table>,
  ) {}

  create(createTableDto: CreateTableDto) {
    const newTable = this.tablesRepository.create(createTableDto);
    return this.tablesRepository.save(newTable);
  }

  findAll() {
    return this.tablesRepository.find();
  }

  async updateStatus(id: number, updateTableStatusDto: UpdateTableStatusDto) {
    const table = await this.tablesRepository.findOneBy({ id: id });

    table.status = updateTableStatusDto.status;
    return this.tablesRepository.save(table);
  }
}
