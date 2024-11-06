import { Module } from '@nestjs/common';
import { ModifierTypesService } from './modifier-types.service';
import { ModifierTypesController } from './modifier-types.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModifierType } from './modifier-type.entity'; // Asume una entidad Category

@Module({
  imports: [TypeOrmModule.forFeature([ModifierType])],
  providers: [ModifierTypesService],
  controllers: [ModifierTypesController],
})
export class ModifierTypesModule {}
