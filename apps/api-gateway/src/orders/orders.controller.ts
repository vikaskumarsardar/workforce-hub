import {
  Body,
  Controller,
  Get,
  Inject,
  Logger,
  Param,
  Post,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  ORDERS_SERVICE,
  CreateOrderDto,
  PATTERNS,
  EVENTS,
  ROUTES,
  MESSAGES,
} from '@app/common';
import { firstValueFrom } from 'rxjs';

@Controller(ROUTES.ORDERS.ROOT)
export class OrdersController {
  private readonly logger = new Logger(OrdersController.name);

  constructor(
    @Inject(ORDERS_SERVICE) private readonly ordersClient: ClientProxy,
  ) {}

  @Post()
  async createOrder(@Body() createOrderDto: CreateOrderDto) {
    this.logger.log(`Forwarding order creation request for product: ${createOrderDto.productName}`);
    const newOrder = await firstValueFrom(
      this.ordersClient.send(PATTERNS.ORDERS.CREATE, createOrderDto),
    );

    this.logger.log(`Emitting background event '${EVENTS.ORDER_CREATED}' for Order ID: ${newOrder.id}`);
    this.ordersClient.emit(EVENTS.ORDER_CREATED, newOrder);

    return {
      message: MESSAGES.ORDERS.CREATE_SUCCESS,
      order: newOrder,
    };
  }

  @Get()
  async getAllOrders() {
    this.logger.log(`Forwarding request to fetch all orders`);
    return firstValueFrom(
      this.ordersClient.send(PATTERNS.ORDERS.FIND_ALL, {}),
    );
  }

  @Get(ROUTES.ORDERS.BY_ID)
  async getOrderById(@Param('id') id: string) {
    this.logger.log(`Forwarding request to fetch order by ID: ${id}`);
    return firstValueFrom(
      this.ordersClient.send(PATTERNS.ORDERS.FIND_ONE, { id }),
    );
  }
}
