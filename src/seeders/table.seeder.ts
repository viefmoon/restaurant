import { DataSource } from 'typeorm';
import { Area } from '../areas/area.entity';
import { Table } from '../tables/table.entity';

export const seedTables = async (dataSource: DataSource) => {
  const areaRepository = dataSource.getRepository(Area);
  const tableRepository = dataSource.getRepository(Table);

  // Nombres de las áreas a crear con el número deseado de mesas
  const areaTargets = {
    'ARCO': 2,
    'BAR': 12,
    'ENTRADA': 5,
    'EQUIPAL': 2,
    'JARDIN': 5
  };

  for (const [name, targetTableCount] of Object.entries(areaTargets)) {
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

    // Si el área ya tiene el número deseado de mesas, continuar con la siguiente iteración
    if (tableCount >= targetTableCount) continue;

    // Crear las mesas faltantes hasta llegar al número deseado para cada área
    for (let i = tableCount + 1; i <= targetTableCount; i++) {
      let table = new Table();
      table.number = i; // Asignar el número directamente como un número
      table.area = area; // Asignar el área a la mesa
      await tableRepository.save(table);
    }
  }
};