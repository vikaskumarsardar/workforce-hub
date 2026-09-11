import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, EventPattern, Payload } from '@nestjs/microservices';
import { OrdersServiceService } from '@orders/orders-service.service';
import { CreateOrderDto, PATTERNS, EVENTS } from '@app/common';

@Controller()
export class OrdersServiceController {
  private readonly logger = new Logger(OrdersServiceController.name);

  constructor(private readonly ordersService: OrdersServiceService) {}

  /**
   * Request-Response Handlers (Commands)
   */
  @MessagePattern(PATTERNS.ORDERS.CREATE)
  async handleCreateOrder(@Payload() dto: CreateOrderDto) {
    this.logger.log(`Received RPC pattern '${PATTERNS.ORDERS.CREATE}' for product: ${dto.productName}`);
    return this.ordersService.createOrder(dto);
  }

  @MessagePattern(PATTERNS.ORDERS.FIND_ALL)
  async handleFindAll() {
    this.logger.log(`Received RPC pattern '${PATTERNS.ORDERS.FIND_ALL}'`);
    return this.ordersService.findAll();
  }

  @MessagePattern(PATTERNS.ORDERS.FIND_ONE)
  async handleFindOne(@Payload() data: { id: string }) {
    this.logger.log(`Received RPC pattern '${PATTERNS.ORDERS.FIND_ONE}' for ID: ${data.id}`);
    return this.ordersService.findOne(data.id);
  }

  /**
   * Event-Driven Handler (Pub/Sub)
   */
  @EventPattern(EVENTS.ORDER_CREATED)
  async handleOrderCreatedEvent(@Payload() eventData: any) {
    this.logger.log(`Received Event pattern '${EVENTS.ORDER_CREATED}' for Order ID: ${eventData.id}`);
    return this.ordersService.handleOrderCreatedEvent(eventData);
  }
}
