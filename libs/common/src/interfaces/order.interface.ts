import { OrderStatus } from '@app/common/enums/order-status.enum';

export interface IOrder {
  id: string;
  productName: string;
  quantity: number;
  price: number;
  totalPrice: number;
  userId: string;
  status: OrderStatus;
  createdAt: Date;
}
