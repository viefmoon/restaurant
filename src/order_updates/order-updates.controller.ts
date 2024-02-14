import { Controller, Get, Post, Body, Put, Delete, Param, ParseIntPipe } from '@nestjs/common';
import { OrderUpdatesService } from './order-updates.service';

@Controller('order-updates')
export class OrderUpdatesController {
    constructor(private readonly orderUpdatesService: OrderUpdatesService) {}

}
