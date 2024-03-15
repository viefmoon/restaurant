import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { OrderItem, OrderItemStatus } from './order_items/order-item.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Order, OrderStatus } from './orders/order.entity';
import { Repository } from 'typeorm';

@WebSocketGateway()
export class AppGateway {
    constructor(
        @InjectRepository(Order)
        private orderRepository: Repository<Order>,
        @InjectRepository(OrderItem)
        private orderItemRepository: Repository<OrderItem>,
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

  emitToPizzaScreen(order: Order, items: OrderItem[]) {
    // Ahora se emite el objeto de orden completo junto con los items
    this.server.to('pizzaScreen').emit('orderItems', { order, items });
  }
  
  emitToBurgerScreen(order: Order, items: OrderItem[]) {
    // Similarmente, para la pantalla de hamburguesas
    this.server.to('burgerScreen').emit('orderItems', { order, items });
  }
  
  emitToBarScreen(order: Order, orderItems: OrderItem[]) {
    // Y para la pantalla de bar
    this.server.to('barScreen').emit('orderItems', { order, orderItems });
  }
  
    // emitOrderItemUpdateMinimal(screenType: string, orderItemId: number, newStatus: string) {
    //     this.server.to(screenType).emit('orderItemUpdate', { orderItemId, newStatus });
    // }
  

//   emitOrderCreated(order: Order) {
//     // Suponiendo que Order ya tiene toda la información necesaria, incluidos los items y sus categorías.
//     const itemsForPizzaScreen = [];
//     const itemsForBurgerScreen = [];
//     const itemsForBarScreen = [];

//     for (const item of order.orderItems) {
//         const category = item.product.subcategory.category.name;
//         const subcategory = item.product.subcategory.name;

//         // Lógica para Pizza Chef Screen
//         if (category === 'Comida' && (subcategory === 'Pizzas' || subcategory === 'Entradas')) {
//                        itemsForPizzaScreen.push(item);
//         }

//         // Lógica para Hamburguesas Screen
//         if (category === 'Comida' && (subcategory === 'Hamburguesas' || subcategory === 'Ensaladas')) {
//             itemsForBurgerScreen.push(item);
//         }

//         // Lógica para Bar Screen
//         if (category === 'Bebidas') {
//             itemsForBarScreen.push(item);
//         }
//     }

//     // Emitir eventos a través del WebSocket solo para las pantallas relevantes
//     if (itemsForPizzaScreen.length > 0) {
//         this.emitToPizzaScreen(order.id, itemsForPizzaScreen);
//     }
//     if (itemsForBurgerScreen.length > 0) {
//         this.emitToBurgerScreen(order.id, itemsForBurgerScreen);
//     }
//     if (itemsForBarScreen.length > 0) {
//         this.emitToBarScreen(order.id, itemsForBarScreen);
//     }
//   }

async emitPendingOrderItemsToScreens(): Promise<void> {
    console.log('Emitiendo ítems de orden pendientes a las pantallas...');
    const pendingOrders = await this.orderRepository.find({
        where: [{ status: OrderStatus.created }, { status: OrderStatus.in_preparation }],
        relations: ['area','table','orderItems', 'orderItems.product','orderItems.productVariant','orderItems.selectedModifiers','orderItems.selectedProductObservations', 'orderItems.product.subcategory', 'orderItems.product.subcategory.category']
    });
  
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
            this.emitToPizzaScreen(order, itemsForPizzaScreen);
        }
        if (!containsPizzaOrEntradas && itemsForBurgerScreen.length > 0) {
            this.emitToBurgerScreen(order, itemsForBurgerScreen);
        }
        if (itemsForBarScreen.length > 0) {
            console.log('Emitiendo ítems de orden pendientes a la pantalla de bar...');
            console.log('order', order);
            console.log("itemsForBarScreen", itemsForBarScreen);
            this.emitToBarScreen(order, itemsForBarScreen);
        }
    });
  }
  

// async updateOrderStatus(orderId: number, newStatus: OrderStatus): Promise<void> {
//   // Actualizar el estado de la orden en la base de datos
//   await this.orderRepository.update(orderId, { status: newStatus });

//   // Opcionalmente, puedes recuperar la orden actualizada para trabajar con ella
//   const updatedOrder = await this.orderRepository.findOne({
//       where: { id: orderId },
//       relations: ['orderItems', 'orderItems.product', 'orderItems.product.subcategory', 'orderItems.product.subcategory.category'],
//   });

//   if (!updatedOrder) {
//       console.error('Orden no encontrada');
//       return;
//   }

//   // Aquí puedes decidir a qué pantallas necesitas emitir la actualización
//   // Por ejemplo, si la orden se ha completado, podrías querer informar a todas las pantallas
//   // if (newStatus === OrderStatus.completed) {
//   //     this.server.emit('orderStatusUpdate', { orderId, newStatus });
//   // } else {
//   //     // Si la orden está en otro estado, puedes tener lógica específica
//   //     // Por ejemplo, si la orden está en preparación, podrías querer informar solo a ciertas pantallas
//   //     this.emitPendingOrderItemsToScreens(); // O cualquier otra lógica específica
//   // }
// }
}
