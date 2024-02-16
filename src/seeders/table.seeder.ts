import { DataSource } from 'typeorm';
import { Area } from '../areas/area.entity';
import { Table } from '../tables/table.entity';

export const seedTables = async (dataSource: DataSource) => {
  const areaRepository = dataSource.getRepository(Area);
  const tableRepository = dataSource.getRepository(Table);

  // Nombres de las áreas a crear
  const areaNames = ['ARCO', 'BAR', 'ENTRADA', 'EQUIPAL', 'JARDIN'];

  for (const name of areaNames) {
    // Verificar si el área ya existe
    let area = await areaRepository.findOneBy({ name });

    if (!area) {
      // Crear y guardar el área si no existe
      area = new Area();
      area.name = name;
      await areaRepository.save(area);
    }

    // Obtener el conteo de mesas para el área actual
    const tableCount = await tableRepository.countBy({ area });

    // Si el área ya tiene 15 mesas, continuar con la siguiente iteración
    if (tableCount >= 15) continue;

    // Crear las mesas faltantes hasta llegar a 15 para cada área
    for (let i = tableCount + 1; i <= 15; i++) {
      let table = new Table();
      table.number = i; // Asignar el número directamente como un número
      table.area = area; // Asignar el área a la mesa
      await tableRepository.save(table);
    }
  }
};