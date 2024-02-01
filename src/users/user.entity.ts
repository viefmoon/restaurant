import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert } from 'typeorm';
import { hash } from 'bcrypt';

enum Role {
    Administrador = "Administrador",
    Mesero = "Mesero",
    Hamburguesas = "Hamburguesas",
    Pizzas = "Pizzas",
    Bar = "Bar"
}

@Entity({ name: 'users' })
export class User {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    username: string;

    @Column()
    name: string;

    @Column({ select: false })
    password: string;

    @Column({
        type: "enum",
        enum: Role,
        default: Role.Mesero
    })
    role: Role;

    @BeforeInsert()
    async hashPassword() {
        this.password = await hash(this.password, Number(process.env.HASH_SALT));
    }
}
