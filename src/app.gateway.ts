import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer, ConnectedSocket } from '@nestjs/websockets';
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
    console.log(`Nueva conexión: ${client.id}`);
    const screenType = client.handshake.query.screenType;
  
    console.log(`Tipo de pantalla conectada: ${screenType}`);
    switch(screenType) {
      case 'pizzaScreen':
        client.join('pizzaScreen');
        console.log(`Cliente ${client.id} se ha unido a pizzaScreen`);
        break;
      case 'burgerScreen':
        client.join('burgerScreen');
        console.log(`Cliente ${client.id} se ha unido a burgerScreen`);
        break;
      case 'barScreen':
        client.join('barScreen');
        console.log(`Cliente ${client.id} se ha unido a barScreen`);
        break;
      default:
        console.log(`Tipo de pantalla desconocido: ${screenType}`);
    }
  
    this.emitPendingOrderItemsToScreens();
  }

  emitOrderStatusUpdated(order: Order): void {
    const itemsForPizzaScreen = [];
    const itemsForBurgerScreen = [];
    const itemsForBarScreen = [];

    // Verificar si la orden contiene ítems de 'Pizzas' o 'Entradas'
    const containsPizzaOrEntradas = order.orderItems.some(item => {
        const subcategory = item.product?.subcategory?.name;
        return subcategory === 'Pizzas' || subcategory === 'Entradas';
    });

    order.orderItems.forEach(item => {
        const category = item.product?.subcategory?.category?.name;
        const subcategory = item.product?.subcategory?.name;
        if (!category) return; // Si no hay categoría, saltar este ítem

        // Separar ítems de bebidas a la pantalla de bar
        if (category === 'Bebidas') {
            itemsForBarScreen.push(item);
        } else {
            // Si la orden contiene 'Pizzas' o 'Entradas', los ítems de comida van a la pantalla de pizza
            if (containsPizzaOrEntradas) {
                itemsForPizzaScreen.push(item);
            } else if (category === 'Comida' && (subcategory === 'Hamburguesas' || subcategory === 'Ensaladas')) {
                // Los ítems de hamburguesas y ensaladas van a la pantalla de hamburguesas si no hay 'Pizzas' o 'Entradas'
                itemsForBurgerScreen.push(item);
            }
        }
    });

    // Definir el objeto de actualización con solo los campos necesarios
    const orderUpdateInfo = {
        orderId: order.id,
        status: order.status,
        orderItems: order.orderItems,
        itemsForPizzaScreen,
        itemsForBurgerScreen,
        itemsForBarScreen
    };

    // Emitir el evento a las pantallas correspondientes
    if (itemsForPizzaScreen.length > 0) {
        this.server.to('pizzaScreen').emit('orderStatusUpdated', orderUpdateInfo);
    }
    if (itemsForBurgerScreen.length > 0) {
        this.server.to('burgerScreen').emit('orderStatusUpdated', orderUpdateInfo);
    }
    if (itemsForBarScreen.length > 0) {
        this.server.to('barScreen').emit('orderStatusUpdated', orderUpdateInfo);
    }
}
  
async emitOrderItemStatusUpdated(order: Order, orderItemId: number): Promise<void> {
    // La lógica dentro de la función ahora opera en base a la orden pasada como argumento
    // y utiliza orderItemId para referenciar el item específico cuando sea necesario

    // Verificar si la orden contiene ítems de 'Pizzas' o 'Entradas'
    const containsPizzaOrEntradas = order.orderItems.some(item => {
        const subcategory = item.product?.subcategory?.name;
        return subcategory === 'Pizzas' || subcategory === 'Entradas';
    });

    let screenType;
    // Encuentra el orderItem específico usando orderItemId
    const specificOrderItem = order.orderItems.find(item => item.id === orderItemId);
    const category = specificOrderItem?.product?.subcategory?.category?.name;

    if (category === 'Bebidas') {
        screenType = 'barScreen';
    } else if (containsPizzaOrEntradas) {
        screenType = 'pizzaScreen';
    } else if (category === 'Comida') {
        const subcategory = specificOrderItem?.product?.subcategory?.name;
        if (subcategory === 'Hamburguesas' || subcategory === 'Ensaladas') {
            screenType = 'burgerScreen';
        }
    }

    if (screenType) {
        this.server.to(screenType).emit('orderItemStatusUpdated', {
            orderId: order.id,
            orderItemId: orderItemId,
            status: specificOrderItem?.status
        });
    } else {
        console.error('No se pudo determinar la pantalla para emitir el evento de OrderItem');
    }
}

async emitPendingOrderItemsToScreens(): Promise<void> {
  const pendingOrders = await this.orderRepository.createQueryBuilder('order')
      .where('order.status IN (:...statuses)', { statuses: [OrderStatus.created, OrderStatus.in_preparation] })
      .leftJoinAndSelect('order.area', 'area')
      .leftJoinAndSelect('order.table', 'table')
      .leftJoinAndSelect('order.orderItems', 'orderItem')
      .leftJoinAndSelect('orderItem.product', 'product')
      .leftJoinAndSelect('product.subcategory', 'subcategory')
      .leftJoinAndSelect('subcategory.category', 'category')
      .leftJoinAndSelect('orderItem.productVariant', 'productVariant')
      .leftJoinAndSelect('orderItem.selectedModifiers', 'selectedModifiers')
      .leftJoinAndSelect('selectedModifiers.modifier', 'modifier')
      .leftJoinAndSelect('orderItem.selectedProductObservations', 'selectedProductObservations')
      .leftJoinAndSelect('selectedProductObservations.productObservation', 'productObservation')
      .leftJoinAndSelect('orderItem.selectedPizzaFlavors', 'selectedPizzaFlavors')
      .leftJoinAndSelect('selectedPizzaFlavors.pizzaFlavor', 'pizzaFlavor')
      .leftJoinAndSelect('orderItem.selectedPizzaIngredients', 'selectedPizzaIngredients')
      .leftJoinAndSelect('selectedPizzaIngredients.pizzaIngredient', 'pizzaIngredient')
      .select([
          'order.id','order.orderType', 'order.status', 'order.creationDate','order.scheduledDeliveryTime','order.comments','order.phoneNumber','order.deliveryAddress','order.customerName',
          'area.id','area.name',
          'table.id','table.number',
          'orderItem.id', 'orderItem.status','orderItem.comments',
          'product.id', 'product.name',
          'subcategory.id', 'subcategory.name',
          'category.id', 'category.name',
          'productVariant.id', 'productVariant.name',
          'selectedModifiers.id',
          'modifier.id', 'modifier.name',
          'selectedProductObservations.id',
          'productObservation.id', 'productObservation.name',
          'selectedPizzaFlavors.id',
          'pizzaFlavor.id', 'pizzaFlavor.name',
          'selectedPizzaIngredients.id', 'selectedPizzaIngredients.half',
          'pizzaIngredient.id', 'pizzaIngredient.name'
      ])
      .getMany();

  pendingOrders.forEach(order => {
      const itemsForPizzaScreen = [];
      const itemsForBurgerScreen = [];
      const itemsForBarScreen = [];

      // Verificar si la orden contiene ítems de 'Pizzas' o 'Entradas'
      const containsPizzaOrEntradas = order.orderItems.some(item => {
          const subcategory = item.product.subcategory.name;
          return subcategory === 'Pizzas' || subcategory === 'Entradas';
      });

      for (const item of order.orderItems) {
          const category = item.product.subcategory.category.name;
          const subcategory = item.product.subcategory.name;

          // Separar ítems de bebidas a la pantalla de bar
          if (category === 'Bebida') {
              itemsForBarScreen.push(item);
          } else {
              // Si la orden contiene 'Pizzas' o 'Entradas', los ítems de comida van a la pantalla de pizza
              if (containsPizzaOrEntradas) {
                  itemsForPizzaScreen.push(item);
              } else if (category === 'Comida' && (subcategory === 'Hamburguesas' || subcategory === 'Ensaladas')) {
                  // Los ítems de hamburguesas y ensaladas van a la pantalla de hamburguesas si no hay 'Pizzas' o 'Entradas'
                  itemsForBurgerScreen.push(item);
              }
          }
      }
      // Emitir eventos a las pantallas correspondientes
      if (itemsForPizzaScreen.length > 0) {
          this.server.to('pizzaScreen').emit('pendingOrderItems', { order, items: itemsForPizzaScreen });
      }
      if (!containsPizzaOrEntradas && itemsForBurgerScreen.length > 0) {
          this.server.to('burgerScreen').emit('pendingOrderItems', { order, items: itemsForBurgerScreen });
      }
      if (itemsForBarScreen.length > 0) {
          console.log('Emitiendo ítems de orden pendientes a la pantalla de bar...');
          console.log('order', order);
          console.log("itemsForBarScreen", itemsForBarScreen);
          this.server.to('barScreen').emit('pendingOrderItems', { order, items: itemsForBarScreen });
      }
  });
}

    async emitNewOrderToScreens(orderId: number): Promise<void> {
    const order = await this.orderRepository.createQueryBuilder('order')
        .where('order.id = :orderId', { orderId })
        .leftJoinAndSelect('order.area', 'area')
        .leftJoinAndSelect('order.table', 'table')
        .leftJoinAndSelect('order.orderItems', 'orderItem')
        .leftJoinAndSelect('orderItem.product', 'product')
        .leftJoinAndSelect('product.subcategory', 'subcategory')
        .leftJoinAndSelect('subcategory.category', 'category')
        .leftJoinAndSelect('orderItem.productVariant', 'productVariant')
        .leftJoinAndSelect('orderItem.selectedModifiers', 'selectedModifiers')
        .leftJoinAndSelect('selectedModifiers.modifier', 'modifier')
        .leftJoinAndSelect('orderItem.selectedProductObservations', 'selectedProductObservations')
        .leftJoinAndSelect('selectedProductObservations.productObservation', 'productObservation')
        .leftJoinAndSelect('orderItem.selectedPizzaFlavors', 'selectedPizzaFlavors')
        .leftJoinAndSelect('selectedPizzaFlavors.pizzaFlavor', 'pizzaFlavor')
        .leftJoinAndSelect('orderItem.selectedPizzaIngredients', 'selectedPizzaIngredients')
        .leftJoinAndSelect('selectedPizzaIngredients.pizzaIngredient', 'pizzaIngredient')
        .select([
            'order.id', 'order.orderType', 'order.status', 'order.creationDate', 'order.scheduledDeliveryTime', 'order.comments', 'order.phoneNumber', 'order.deliveryAddress', 'order.customerName',
            'area.id', 'area.name',
            'table.id', 'table.number',
            'orderItem.id', 'orderItem.status', 'orderItem.comments',
            'product.id', 'product.name',
            'subcategory.id', 'subcategory.name',
            'category.id', 'category.name',
            'productVariant.id', 'productVariant.name',
            'selectedModifiers.id',
            'modifier.id', 'modifier.name',
            'selectedProductObservations.id',
            'productObservation.id', 'productObservation.name',
            'selectedPizzaFlavors.id',
            'pizzaFlavor.id', 'pizzaFlavor.name',
            'selectedPizzaIngredients.id', 'selectedPizzaIngredients.half',
            'pizzaIngredient.id', 'pizzaIngredient.name'
        ])
        .getOne();

    if (!order) {
        console.error('Orden no encontrada');
        return;
    }
    const itemsForPizzaScreen = [];
    const itemsForBurgerScreen = [];
    const itemsForBarScreen = [];

    // Verificar si la orden contiene ítems de 'Pizzas' o 'Entradas'
    const containsPizzaOrEntradas = order.orderItems.some(item => {
        const subcategory = item.product.subcategory.name;
        return subcategory === 'Pizzas' || subcategory === 'Entradas';
    });

    for (const item of order.orderItems) {
        const category = item.product.subcategory.category.name;
        const subcategory = item.product.subcategory.name;

        // Separar ítems de bebidas a la pantalla de bar
        if (category === 'Bebida') {
            itemsForBarScreen.push(item);
        } else {
            // Si la orden contiene 'Pizzas' o 'Entradas', los ítems de comida van a la pantalla de pizza
            if (containsPizzaOrEntradas) {
                itemsForPizzaScreen.push(item);
            } else if (category === 'Comida' && (subcategory === 'Hamburguesas' || subcategory === 'Ensaladas')) {
                // Los ítems de hamburguesas y ensaladas van a la pantalla de hamburguesas si no hay 'Pizzas' o 'Entradas'
                itemsForBurgerScreen.push(item);
            }
        }
    }
    // Emitir eventos a las pantallas correspondientes directamente
    if (itemsForPizzaScreen.length > 0) {
        this.server.to('pizzaScreen').emit('newOrderItems', { order, items: itemsForPizzaScreen });
    }
    if (!containsPizzaOrEntradas && itemsForBurgerScreen.length > 0) {
        this.server.to('burgerScreen').emit('newOrderItems', { order, items: itemsForBurgerScreen });
    }
    if (itemsForBarScreen.length > 0) {
        this.server.to('barScreen').emit('newOrderItems', { order, items: itemsForBarScreen });
    }
}

async emitOrderUpdated(orderId: number): Promise<void> {
    const order = await this.orderRepository.createQueryBuilder('order')
        .where('order.id = :orderId', { orderId })
        .leftJoinAndSelect('order.area', 'area')
        .leftJoinAndSelect('order.table', 'table')
        .leftJoinAndSelect('order.orderItems', 'orderItem')
        .leftJoinAndSelect('orderItem.product', 'product')
        .leftJoinAndSelect('product.subcategory', 'subcategory')
        .leftJoinAndSelect('subcategory.category', 'category')
        .leftJoinAndSelect('orderItem.productVariant', 'productVariant')
        .leftJoinAndSelect('orderItem.selectedModifiers', 'selectedModifiers')
        .leftJoinAndSelect('selectedModifiers.modifier', 'modifier')
        .leftJoinAndSelect('orderItem.selectedProductObservations', 'selectedProductObservations')
        .leftJoinAndSelect('selectedProductObservations.productObservation', 'productObservation')
        .leftJoinAndSelect('orderItem.selectedPizzaFlavors', 'selectedPizzaFlavors')
        .leftJoinAndSelect('selectedPizzaFlavors.pizzaFlavor', 'pizzaFlavor')
        .leftJoinAndSelect('orderItem.selectedPizzaIngredients', 'selectedPizzaIngredients')
        .leftJoinAndSelect('selectedPizzaIngredients.pizzaIngredient', 'pizzaIngredient')
        .select([
            'order.id', 'order.orderType', 'order.status', 'order.creationDate', 'order.scheduledDeliveryTime', 'order.comments', 'order.phoneNumber', 'order.deliveryAddress', 'order.customerName',
            'area.id', 'area.name',
            'table.id', 'table.number',
            'orderItem.id', 'orderItem.status', 'orderItem.comments',
            'product.id', 'product.name',
            'subcategory.id', 'subcategory.name',
            'category.id', 'category.name',
            'productVariant.id', 'productVariant.name',
            'selectedModifiers.id',
            'modifier.id', 'modifier.name',
            'selectedProductObservations.id',
            'productObservation.id', 'productObservation.name',
            'selectedPizzaFlavors.id',
            'pizzaFlavor.id', 'pizzaFlavor.name',
            'selectedPizzaIngredients.id', 'selectedPizzaIngredients.half',
            'pizzaIngredient.id', 'pizzaIngredient.name'
        ])
        .getOne();

    if (!order) {
        console.error('Orden no encontrada');
        return;
    }

    const itemsForPizzaScreen = [];
    const itemsForBurgerScreen = [];
    const itemsForBarScreen = [];

    // Verificar si la orden contiene ítems de 'Pizzas' o 'Entradas'
    const containsPizzaOrEntradas = order.orderItems.some(item => {
        const subcategory = item.product.subcategory.name;
        return subcategory === 'Pizzas' || subcategory === 'Entradas';
    });
    for (const item of order.orderItems) {
        const category = item.product.subcategory.category.name;
        const subcategory = item.product.subcategory.name;

        // Separar ítems de bebidas a la pantalla de bar
        if (category === 'Bebida') {
            itemsForBarScreen.push(item);
        } else {
            // Si la orden contiene 'Pizzas' o 'Entradas', los ítems de comida van a la pantalla de pizza
            if (containsPizzaOrEntradas) {
                itemsForPizzaScreen.push(item);
            } else if (category === 'Comida' && (subcategory === 'Hamburguesas' || subcategory === 'Ensaladas')) {
                // Los ítems de hamburguesas y ensaladas van a la pantalla de hamburguesas si no hay 'Pizzas' o 'Entradas'
                itemsForBurgerScreen.push(item);
            }
        }
    }

    // Emitir eventos a las pantallas correspondientes
    if (itemsForPizzaScreen.length > 0) {
        this.server.to('pizzaScreen').emit('orderUpdated', { order, items: itemsForPizzaScreen });
    }
    if (!containsPizzaOrEntradas && itemsForBurgerScreen.length > 0) {
        this.server.to('burgerScreen').emit('orderUpdated', { order, items: itemsForBurgerScreen });
    }
    if (itemsForBarScreen.length > 0) {
        this.server.to('barScreen').emit('orderUpdated', { order, items: itemsForBarScreen });
    }
}
  
}
