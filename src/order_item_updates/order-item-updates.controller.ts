import { Controller } from '@nestjs/common';
import { OrderItemUpdatesService } from './order-item-updates.service';

@Controller('order-item-updates')
export class OrderItemUpdatesController {
  constructor(
    private readonly orderItemUpdatesService: OrderItemUpdatesService,
  ) {}
}
