import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Delete,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { OrderPrintsService } from './order-prints.service';

@Controller('order-prints')
export class OrderPrintsController {
  constructor(private readonly orderPrintsService: OrderPrintsService) {}
}
