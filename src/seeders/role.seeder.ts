import { DataSource } from 'typeorm';
import { Rol } from 'src/roles/rol.entity';

export const seedRoles = async (dataSource: DataSource) => {
    const roleRepository = dataSource.getRepository(Rol);

    const roles = [
        { id: 'ADMIN', name: 'Administrador', route: 'saleshome' },
        { id: 'WAITER', name: 'Mesero', route: 'waiterhome' },
        { id: 'HAMBURGER_CHEF', name: 'Cocinero de Hamburguesa', route: 'hamburger' },
        { id: 'PIZZA_CHEF', name: 'Cocinero de Pizza', route: 'pizza' },
        { id: 'BAR_CHEF', name: 'Bar', route: 'bar' },
    ];

    for (const role of roles) {
        let dbRole = await roleRepository.findOneBy({ id: role.id });
        if (!dbRole) {
            dbRole = roleRepository.create(role);
            await roleRepository.save(dbRole);
            console.log(`Rol ${role.name} creado con éxito.`);
        }
    }
};
