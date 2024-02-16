import { Module } from '@nestjs/common';
import { SelectedModifiersService } from './selected-modifiers.service';
import { SelectedModifiersController } from './selected-modifiers.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SelectedModifier } from './selected-modifier.entity'; 

@Module({
  imports: [TypeOrmModule.forFeature([SelectedModifier])], 
  providers: [SelectedModifiersService], 
  controllers: [SelectedModifiersController] 
})
export class SelectedModifiersModule {}

