import { Module } from '@nestjs/common';
import { ProductObservationTypesService } from './product-observation-types.service';
import { ProductObservationTypesController } from './product-observation-types.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductObservationType } from './product-observation-type.entity'; // Asume una entidad Category

@Module({
  imports: [TypeOrmModule.forFeature([ProductObservationType])], 
  providers: [ProductObservationTypesService], 
  controllers: [ProductObservationTypesController] 
})
export class ProductObservationTypesModule {}

