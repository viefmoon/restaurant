import { Module } from '@nestjs/common';
import { ModifiersService } from './modifiers.service';
import { ModifiersController } from './modifiers.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Modifier } from './modifier.entity'; // Asume una entidad Category

@Module({
  imports: [TypeOrmModule.forFeature([Modifier])], // Importa solo las entidades relevantes para categorías
  providers: [ModifiersService], // Provee el servicio de categorías
  controllers: [ModifiersController] // Registra el controlador de categorías
})
export class ModifiersModule {}

