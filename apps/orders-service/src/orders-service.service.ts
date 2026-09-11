import { Injectable, Logger, HttpStatus } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { CreateOrderDto, IOrder, MESSAGES, OrderStatus } from '@app/common';

@Injectable()
export class OrdersServiceService {
  private readonly logger = new Logger(OrdersServiceService.name);
  private orders: Map<string, IOrder> = new Map();

  async createOrder(dto: CreateOrderDto): Promise<IOrder> {
    this.logger.log(`Processing new order for product: ${dto.productName}, quantity: ${dto.quantity}`);

    const orderId = `ord_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const newOrder: IOrder = {
      id: orderId,
      productName: dto.productName,
      quantity: dto.quantity,
      price: dto.price,
      totalPrice: dto.price * dto.quantity,
      userId: dto.userId,
      status: OrderStatus.CONFIRMED,
      createdAt: new Date(),
    };

    this.orders.set(orderId, newOrder);
    this.logger.log(`Order created successfully with ID: ${orderId}`);

    return newOrder;
  }

  async findAll(): Promise<IOrder[]> {
    this.logger.log(`Fetching all orders (total count: ${this.orders.size})`);
    return Array.from(this.orders.values());
  }

  async findOne(id: string): Promise<IOrder> {
    this.logger.log(`Looking up order by ID: ${id}`);
    const order = this.orders.get(id);
    if (!order) {
      this.logger.warn(`Order not found for ID: ${id}`);
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: MESSAGES.ORDERS.NOT_FOUND(id),
      });
    }
    this.logger.log(`Order found: ${id}`);
    return order;
  }

  async handleOrderCreatedEvent(eventData: IOrder): Promise<void> {
    this.logger.warn(
      `⚡ [EVENT SUBSCRIBER] Processing background event 'ORDER_CREATED' for Order ID: ${eventData.id}`,
    );
  }
}
