import { Module } from '@nestjs/common';
import { TablesService } from './tables.service';
import { TablesController } from './tables.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Table } from './table.entity'; 
import { JwtStrategy } from '../auth/jwt/jwt.strategy';
import { Order } from '../orders/order.entity'; 

@Module({
  imports: [TypeOrmModule.forFeature([Table, Order])], 
  providers: [TablesService, JwtStrategy], 
  controllers: [TablesController]
})
export class TablesModule {}