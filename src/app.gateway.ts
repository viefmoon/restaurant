import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { InjectRepository } from '@nestjs/typeorm';
import { Order, OrderStatus } from './orders/order.entity';
import { Repository } from 'typeorm';

@WebSocketGateway()
export class AppGateway {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
  ) {}

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('message')
  handleMessage(@MessageBody() data: string): void {
    console.log(`Mensaje recibido: ${data}`);
    this.server.emit('message', data);
  }

  handleDisconnect(client: Socket) {
    console.log(`Cliente desconectado: ${client.id}`);
  }

  handleConnection(@ConnectedSocket() client: Socket) {
    const screenType = client.handshake.query.screenType;
    const screenTypes = ['pizzaScreen', 'burgerScreen', 'barScreen'];

    if (screenTypes.includes(screenType as string)) {
      client.join(screenType as string);
      console.log(`Cliente ${client.id} se ha unido a ${screenType}`);
    } else {
      console.log(`Tipo de pantalla desconocido: ${screenType}`);
    }

    this.emitPendingOrderItemsToScreens();
  }

  private getOrderItemsByScreen(order: Order) {
    const itemsForPizzaScreen = [];
    const itemsForBurgerScreen = [];
    const itemsForBarScreen = [];

    const containsPizzaOrEntradas = order.orderItems.some((item) => {
      const subcategory = item.product?.subcategory?.name;
      return subcategory === 'Pizzas' || subcategory === 'Entradas';
    });

    order.orderItems.forEach((item) => {
      const category = item.product?.subcategory?.category?.name;
      const subcategory = item.product?.subcategory?.name;

      if (category === 'Bebida') {
        itemsForBarScreen.push(item);
      } else if (containsPizzaOrEntradas) {
        itemsForPizzaScreen.push(item);
      }
      if (
        category === 'Comida' &&
        (subcategory === 'Hamburguesas' || subcategory === 'Ensaladas')
      ) {
        itemsForBurgerScreen.push(item);
      }
    });

    return { itemsForPizzaScreen, itemsForBurgerScreen, itemsForBarScreen };
  }

  emitOrderStatusUpdated(order: Order): void {
    const { itemsForPizzaScreen, itemsForBurgerScreen, itemsForBarScreen } =
      this.getOrderItemsByScreen(order);

    const orderUpdateInfo = {
      orderId: order.id,
      pizzaPreparationStatus: order.pizzaPreparationStatus,
      barPreparationStatus: order.barPreparationStatus,
      burgerPreparationStatus: order.burgerPreparationStatus,
      orderType: order.orderType,
    };

    if (itemsForPizzaScreen.length > 0) {
      this.server.to('pizzaScreen').emit('orderStatusUpdated', {
        messageType: 'orderStatusUpdated',
        ...orderUpdateInfo,
        orderItems: itemsForPizzaScreen,
      });
    }
    if (itemsForBurgerScreen.length > 0) {
      this.server.to('burgerScreen').emit('orderStatusUpdated', {
        messageType: 'orderStatusUpdated',
        ...orderUpdateInfo,
        orderItems: itemsForBurgerScreen,
      });
    }
    if (itemsForBarScreen.length > 0) {
      this.server.to('barScreen').emit('orderStatusUpdated', {
        messageType: 'orderStatusUpdated',
        ...orderUpdateInfo,
        orderItems: itemsForBarScreen,
      });
    }
  }

  async emitOrderItemStatusUpdated(
    order: Order,
    orderItemId: number,
  ): Promise<void> {
    const containsPizzaOrEntradas = order.orderItems.some((item) => {
      const subcategory = item.product?.subcategory?.name;
      return subcategory === 'Pizzas' || subcategory === 'Entradas';
    });

    const specificOrderItem = order.orderItems.find(
      (item) => item.id === orderItemId,
    );
    const category = specificOrderItem?.product?.subcategory?.category?.name;
    const subcategory = specificOrderItem?.product?.subcategory?.name;

    // Ahora se permite que un ítem de orden se emita a múltiples pantallas.
    if (category === 'Bebida') {
      this.server.to('barScreen').emit('orderItemStatusUpdated', {
        messageType: 'orderItemStatusUpdated',
        orderId: order.id,
        orderItemId: orderItemId,
        status: specificOrderItem?.status,
      });
    }
    if (containsPizzaOrEntradas) {
      // Si la orden contiene pizzas o entradas, se emite a la pantalla de pizza.
      this.server.to('pizzaScreen').emit('orderItemStatusUpdated', {
        messageType: 'orderItemStatusUpdated',
        orderId: order.id,
        orderItemId: orderItemId,
        status: specificOrderItem?.status,
      });
    }
    if (
      category === 'Comida' &&
      (subcategory === 'Hamburguesas' || subcategory === 'Ensaladas')
    ) {
      // Si el ítem es de comida y específicamente hamburguesa o ensalada, se emite a la pantalla de burger.
      // Nota: Esto permite la emisión a la pantalla de burger incluso si ya se emitió a la pantalla de pizza.
      this.server.to('burgerScreen').emit('orderItemStatusUpdated', {
        messageType: 'orderItemStatusUpdated',
        orderId: order.id,
        orderItemId: orderItemId,
        status: specificOrderItem?.status,
      });
    }
  }

  async emitPendingOrderItemsToScreens(): Promise<void> {
    const pendingOrders = await this.getPendingOrders();

    pendingOrders.forEach((order) => {
      const orderWithoutItems = {
        ...order,
        orderItems: undefined,
      };
      const { itemsForPizzaScreen, itemsForBurgerScreen, itemsForBarScreen } =
        this.getOrderItemsByScreen(order);

      if (itemsForPizzaScreen.length > 0) {
        this.server.to('pizzaScreen').emit('pendingOrderItems', {
          messageType: 'pendingOrderItems',
          order: orderWithoutItems,
          orderItems: itemsForPizzaScreen,
        });
      }
      if (itemsForBurgerScreen.length > 0) {
        this.server.to('burgerScreen').emit('pendingOrderItems', {
          messageType: 'pendingOrderItems',
          order: orderWithoutItems,
          orderItems: itemsForBurgerScreen,
        });
      }
      if (itemsForBarScreen.length > 0) {
        this.server.to('barScreen').emit('pendingOrderItems', {
          messageType: 'pendingOrderItems',
          order: orderWithoutItems,
          orderItems: itemsForBarScreen,
        });
      }
    });
  }

  async emitNewOrderToScreens(orderId: number): Promise<void> {
    const order = await this.getOrderById(orderId);

    if (!order) {
      console.error('Orden no encontrada');
      return;
    }

    const orderWithoutItems = {
      ...order,
      orderItems: undefined,
    };

    const { itemsForPizzaScreen, itemsForBurgerScreen, itemsForBarScreen } =
      this.getOrderItemsByScreen(order);

    if (itemsForPizzaScreen.length > 0) {
      this.server.to('pizzaScreen').emit('newOrderItems', {
        messageType: 'newOrderItems',
        order: orderWithoutItems,
        orderItems: itemsForPizzaScreen,
      });
    }
    if (itemsForBurgerScreen.length > 0) {
      this.server.to('burgerScreen').emit('newOrderItems', {
        messageType: 'newOrderItems',
        order: orderWithoutItems,
        orderItems: itemsForBurgerScreen,
      });
    }
    if (itemsForBarScreen.length > 0) {
      this.server.to('barScreen').emit('newOrderItems', {
        messageType: 'newOrderItems',
        order: orderWithoutItems,
        orderItems: itemsForBarScreen,
      });
    }
  }

  async emitOrderUpdated(orderId: number): Promise<void> {
    const order = await this.getOrderById(orderId);

    if (!order) {
      console.error('Orden no encontrada');
      return;
    }

    const orderWithoutItems = {
      ...order,
      orderItems: undefined,
    };

    const { itemsForPizzaScreen, itemsForBurgerScreen, itemsForBarScreen } =
      this.getOrderItemsByScreen(order);

    if (itemsForPizzaScreen.length > 0) {
      this.server.to('pizzaScreen').emit('orderUpdated', {
        messageType: 'orderUpdated',
        order: orderWithoutItems,
        orderItems: itemsForPizzaScreen,
      });
    }
    if (itemsForBurgerScreen.length > 0) {
      this.server.to('burgerScreen').emit('orderUpdated', {
        messageType: 'orderUpdated',
        order: orderWithoutItems,
        orderItems: itemsForBurgerScreen,
      });
    }
    if (itemsForBarScreen.length > 0) {
      this.server.to('barScreen').emit('orderUpdated', {
        messageType: 'orderUpdated',
        order: orderWithoutItems,
        orderItems: itemsForBarScreen,
      });
    }
  }

  private async getPendingOrders(): Promise<Order[]> {
    return await this.orderRepository
      .createQueryBuilder('order')
      .where('order.status IN (:...statuses)', {
        statuses: [OrderStatus.created, OrderStatus.in_preparation],
      })
      .leftJoinAndSelect('order.area', 'area')
      .leftJoinAndSelect('order.table', 'table')
      .leftJoinAndSelect('order.orderItems', 'orderItem')
      .leftJoinAndSelect('order.orderUpdates', 'orderUpdate')
      .leftJoinAndSelect('orderUpdate.orderItemUpdates', 'orderItemUpdate')
      .leftJoinAndSelect('orderItemUpdate.orderItem', 'orderItemUpdated')
      .leftJoinAndSelect('orderItem.product', 'product')
      .leftJoinAndSelect('product.subcategory', 'subcategory')
      .leftJoinAndSelect('subcategory.category', 'category')
      .leftJoinAndSelect('orderItem.productVariant', 'productVariant')
      .leftJoinAndSelect('orderItem.selectedModifiers', 'selectedModifiers')
      .leftJoinAndSelect('selectedModifiers.modifier', 'modifier')
      .leftJoinAndSelect(
        'orderItem.selectedProductObservations',
        'selectedProductObservations',
      )
      .leftJoinAndSelect(
        'selectedProductObservations.productObservation',
        'productObservation',
      )
      .leftJoinAndSelect(
        'orderItem.selectedPizzaFlavors',
        'selectedPizzaFlavors',
      )
      .leftJoinAndSelect('selectedPizzaFlavors.pizzaFlavor', 'pizzaFlavor')
      .leftJoinAndSelect(
        'orderItem.selectedPizzaIngredients',
        'selectedPizzaIngredients',
      )
      .leftJoinAndSelect(
        'selectedPizzaIngredients.pizzaIngredient',
        'pizzaIngredient',
      )
      .select([
        'order.id',
        'order.orderType',
        'order.status',
        'order.createdBy',
        'order.creationDate',
        'order.scheduledDeliveryTime',
        'order.comments',
        'order.phoneNumber',
        'order.deliveryAddress',
        'order.customerName',
        'order.barPreparationStatus',
        'order.burgerPreparationStatus',
        'order.pizzaPreparationStatus',
        'orderUpdate.id',
        'orderUpdate.updateAt',
        'orderUpdate.updatedBy',
        'orderUpdate.updateNumber',
        'orderItemUpdate.id',
        'orderItemUpdate.isNewOrderItem',
        'orderItemUpdated.id',
        'area.id',
        'area.name',
        'table.id',
        'table.number',
        'orderItem.id',
        'orderItem.status',
        'orderItem.comments',
        'product.id',
        'product.name',
        'subcategory.id',
        'subcategory.name',
        'category.id',
        'category.name',
        'productVariant.id',
        'productVariant.name',
        'selectedModifiers.id',
        'modifier.id',
        'modifier.name',
        'selectedProductObservations.id',
        'productObservation.id',
        'productObservation.name',
        'selectedPizzaFlavors.id',
        'pizzaFlavor.id',
        'pizzaFlavor.name',
        'selectedPizzaIngredients.id',
        'selectedPizzaIngredients.half',
        'pizzaIngredient.id',
        'pizzaIngredient.name',
      ])
      .getMany();
  }

  private async getOrderById(orderId: number): Promise<Order | undefined> {
    return await this.orderRepository
      .createQueryBuilder('order')
      .where('order.id = :orderId', { orderId })
      .leftJoinAndSelect('order.area', 'area')
      .leftJoinAndSelect('order.table', 'table')
      .leftJoinAndSelect('order.orderItems', 'orderItem')
      .leftJoinAndSelect('order.orderUpdates', 'orderUpdate')
      .leftJoinAndSelect('orderUpdate.orderItemUpdates', 'orderItemUpdate')
      .leftJoinAndSelect('orderItemUpdate.orderItem', 'orderItemUpdated')
      .leftJoinAndSelect('orderItem.product', 'product')
      .leftJoinAndSelect('product.subcategory', 'subcategory')
      .leftJoinAndSelect('subcategory.category', 'category')
      .leftJoinAndSelect('orderItem.productVariant', 'productVariant')
      .leftJoinAndSelect('orderItem.selectedModifiers', 'selectedModifiers')
      .leftJoinAndSelect('selectedModifiers.modifier', 'modifier')
      .leftJoinAndSelect(
        'orderItem.selectedProductObservations',
        'selectedProductObservations',
      )
      .leftJoinAndSelect(
        'selectedProductObservations.productObservation',
        'productObservation',
      )
      .leftJoinAndSelect(
        'orderItem.selectedPizzaFlavors',
        'selectedPizzaFlavors',
      )
      .leftJoinAndSelect('selectedPizzaFlavors.pizzaFlavor', 'pizzaFlavor')
      .leftJoinAndSelect(
        'orderItem.selectedPizzaIngredients',
        'selectedPizzaIngredients',
      )
      .leftJoinAndSelect(
        'selectedPizzaIngredients.pizzaIngredient',
        'pizzaIngredient',
      )
      .select([
        'order.id',
        'order.orderType',
        'order.status',
        'order.createdBy',
        'order.creationDate',
        'order.scheduledDeliveryTime',
        'order.comments',
        'order.phoneNumber',
        'order.deliveryAddress',
        'order.customerName',
        'order.barPreparationStatus',
        'order.burgerPreparationStatus',
        'order.pizzaPreparationStatus',
        'orderUpdate.id',
        'orderUpdate.updateAt',
        'orderUpdate.updatedBy',
        'orderUpdate.updateNumber',
        'orderItemUpdate.id',
        'orderItemUpdate.isNewOrderItem',
        'orderItemUpdated.id',
        'area.id',
        'area.name',
        'table.id',
        'table.number',
        'orderItem.id',
        'orderItem.status',
        'orderItem.comments',
        'product.id',
        'product.name',
        'subcategory.id',
        'subcategory',
        'category.id',
        'category.name',
        'productVariant.id',
        'productVariant.name',
        'selectedModifiers.id',
        'modifier.id',
        'modifier.name',
        'selectedProductObservations.id',
        'productObservation.id',
        'productObservation.name',
        'selectedPizzaFlavors.id',
        'pizzaFlavor.id',
        'pizzaFlavor.name',
        'selectedPizzaIngredients.id',
        'selectedPizzaIngredients.half',
        'pizzaIngredient.id',
        'pizzaIngredient.name',
      ])
      .getOne();
  }
}
