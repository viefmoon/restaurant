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
import { OrderAdjustmentsService } from './order-adjustments.service';

@Controller('order-adjustments')
export class OrderAdjustmentsController {
  constructor(
    private readonly orderAdjustmentsService: OrderAdjustmentsService,
  ) {}
}
