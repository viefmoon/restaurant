import { Module } from '@nestjs/common';
import { AreasService } from './areas.service';
import { AreasController } from './areas.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Area } from './area.entity'; 
import { JwtStrategy } from '../auth/jwt/jwt.strategy';

@Module({
  imports: [TypeOrmModule.forFeature([Area])], 
  providers: [AreasService, JwtStrategy], 
  controllers: [AreasController]
})
export class AreasModule {}

