import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'order_counters' })
export class OrderCounter {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'date' })
    date: Date;

    @Column()
    counter: number;
}