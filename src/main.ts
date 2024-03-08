import { config } from 'dotenv';
config();
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { seedRoles } from './seeders/role.seeder';
import { seedUsers } from './seeders/user.seeder';
import { seedProducts } from './seeders/product.seeder';
import { seedTables } from './seeders/table.seeder';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ forbidUnknownValues: false, transform: true }));

  const dataSource = app.get(DataSource);

  if (process.env.SEED_DB === 'true') {
    
    try {
      await seedRoles(dataSource);
      await seedUsers(dataSource);
      await seedTables(dataSource);
      await seedProducts(dataSource);
      console.log('Seeders ejecutados correctamente.');
    } catch (error) {
      console.error('Error ejecutando seeders:', error);
    }
  }

  await app.listen(3000, '192.168.100.32' || 'localhost' || '192.168.100.32');
}

bootstrap();
