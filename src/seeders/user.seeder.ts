// src/seeders/user.seeder.ts

import { DataSource } from 'typeorm';
import { User } from 'src/users/user.entity';
import { Rol } from 'src/roles/rol.entity';
import * as bcrypt from 'bcrypt';
import { In } from 'typeorm';

export const seedUsers = async (dataSource: DataSource) => {
    const userRepository = dataSource.getRepository(User);
    const roleRepository = dataSource.getRepository(Rol);

    const users = [
        { username: 'leonel', name: 'Leonel', password: 'root_123', roles: ['ADMIN'] },
        { username: 'daniela', name: 'Daniela', password: 'root_123', roles: ['ADMIN'] },
        { username: 'sofia', name: 'Sofia', password: 'root_123', roles: ['ADMIN'] },
        { username: 'bere', name: 'Bere', password: '123456', roles: ['WAITER'] },
        { username: 'chava', name: 'Chava', password: '123456', roles: ['WAITER'] },
        { username: 'pablo', name: 'Pablo', password: '123456', roles: ['WAITER'] },
        { username: 'kevin', name: 'Kevin', password: '123456', roles: ['WAITER'] },
        { username: 'bere', name: 'Bere', password: '123456', roles: ['WAITER'] },
        { username: 'adriana', name: 'Adriana', password: '123456', roles: ['WAITER'] },
        { username: 'pizza', name: 'Tanilo', password: 'pizza_admin', roles: ['PIZZA_CHEF'] },
        { username: 'burger', name: 'Emma', password: 'burger_admin', roles: ['HAMBURGER_CHEF'] },
        { username: 'bar', name: 'Hugo', password: 'bar_admin', roles: ['BAR_CHEF'] },
    ];
    for (const user of users) {
        let dbUser = await userRepository.findOneBy({ username: user.username });
        if (!dbUser) {

            dbUser = userRepository.create({
                username: user.username,
                name: user.name,
                password: user.password,
                roles: [],
            });

            // Asignar roles
            const assignedRoles = await roleRepository.findBy({ id: In(user.roles) });
            dbUser.roles = assignedRoles;

            await userRepository.save(dbUser);
            console.log(`Usuario ${user.username} creado con éxito.`);
        }
    }
};
