import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Table } from 'src/tables/table.entity';

@Entity({ name: 'areas' })
export class Area {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @OneToMany(() => Table, (table) => table.area)
    tables: Table[];
}

