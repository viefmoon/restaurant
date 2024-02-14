import { config } from 'dotenv';
config();
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { seedRoles } from './seeders/role.seeder';
import { seedUsers } from './seeders/user.seeder';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ forbidUnknownValues: false }));

  const dataSource = app.get(DataSource);

  if (process.env.SEED_DB === 'true') {
    
    try {
      await seedRoles(dataSource);
      await seedUsers(dataSource);
      console.log('Seeders ejecutados correctamente.');
    } catch (error) {
      console.error('Error ejecutando seeders:', error);
    }
  }

  await app.listen(3000, '192.168.100.32' || 'localhost');
}

bootstrap();
