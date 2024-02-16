import { Module } from '@nestjs/common';
import { ProductObservationsService } from './product-observations.service';
import { ProductObservationsController } from './product-observations.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductObservation } from './product-observation.entity'; 

@Module({
  imports: [TypeOrmModule.forFeature([ProductObservation])], 
  providers: [ProductObservationsService], 
  controllers: [ProductObservationsController] 
})
export class ProductObservationsModule {}

