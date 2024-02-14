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
        { username: 'user1', name: 'Leonel', password: '123456', roles: ['ADMIN'] },
        { username: 'user2', name: 'Sofia', password: '123456', roles: ['WAITER'] },
        { username: 'user3', name: 'Tanilo', password: '123456', roles: ['PIZZA_CHEF'] },
        { username: 'user4', name: 'Emma', password: '123456', roles: ['HAMBURGER_CHEF'] },
        { username: 'user5', name: 'Bety', password: '123456', roles: ['COOKIE_CHEF'] },
        { username: 'user6', name: 'Hugo', password: '123456', roles: ['BAR'] },
    ];
    for (const user of users) {
        let dbUser = await userRepository.findOneBy({ username: user.username });
        if (!dbUser) {
            const hashedPassword = await bcrypt.hash(user.password, 10);
            dbUser = userRepository.create({
                username: user.username,
                name: user.name,
                password: hashedPassword,
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
