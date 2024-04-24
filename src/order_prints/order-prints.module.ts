import { Module } from '@nestjs/common';
import { OrderPrintsService } from './order-prints.service';
import { OrderPrintsController } from './order-prints.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderPrint } from './order-print.entity'; // Asume una entidad Category

@Module({
  imports: [TypeOrmModule.forFeature([OrderPrint])], // Importa solo las entidades relevantes para categorías
  providers: [OrderPrintsService], // Provee el servicio de categorías
  controllers: [OrderPrintsController] // Registra el controlador de categorías
})
export class OrderPrintsModule {}

