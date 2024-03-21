import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Order, OrderPreparationStatus, OrderStatus } from './order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderItemsService } from 'src/order_items/order-items.service';
import { Table } from 'src/tables/table.entity';
import { AppGateway } from '../app.gateway';
import { OrderItem, OrderItemStatus } from 'src/order_items/order-item.entity';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Product } from 'src/products/product.entity';
import { OrderUpdate } from 'src/order_updates/order-update.entity';
import { OrderItemUpdate } from 'src/order_item_updates/order-item-update.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Table)
    private readonly tableRepository: Repository<Table>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(OrderUpdate)
    private readonly orderUpdateRepository: Repository<OrderUpdate>,
    @InjectRepository(OrderItemUpdate)
    private readonly orderItemUpdateRepository: Repository<OrderItemUpdate>,
    private readonly orderItemService: OrderItemsService,
    private readonly appGateway: AppGateway,
  ) {}

  async createOrder(createOrderDto: CreateOrderDto): Promise<Order> {
    if (createOrderDto.table) {
      const table = await this.tableRepository.findOne({
        where: { id: createOrderDto.table.id },
      });
      if (!table) {
        throw new Error('Table not found');
      }
    }

    // Paso 1: Consulta los productos por ID
    const productIds = createOrderDto.orderItems.map((item) => item.product.id);
    const productsWithDetails = await this.productRepository.find({
      where: { id: In(productIds) },
      relations: ['subcategory', 'subcategory.category'],
    });

    // Paso 2: Reemplaza los orderItems con la información completa
    const orderItemsWithDetails = createOrderDto.orderItems.map((item) => {
      const productDetail = productsWithDetails.find(
        (product) => product.id === item.product.id,
      );
      return {
        ...item,
        product: productDetail,
      };
    });

    // Inicializa los estados de preparación
    let barPreparationStatus = OrderPreparationStatus.not_required;
    let burgerPreparationStatus = OrderPreparationStatus.not_required;
    let pizzaPreparationStatus = OrderPreparationStatus.not_required;

    // Verifica si la orden contiene ítems de pizza
    const containsPizzaorEntradasItems = orderItemsWithDetails.some(
      (itemDto) =>
        itemDto.product.subcategory.name === 'Pizzas' ||
        itemDto.product.subcategory.name === 'Entradas',
    );
    // Determina los estados de preparación basados en los orderItems
    for (const itemDto of orderItemsWithDetails) {
      if (itemDto.product.subcategory.category.name === 'Bebida') {
        barPreparationStatus = OrderPreparationStatus.created;
      } else if (itemDto.product.subcategory.category.name === 'Comida') {
        if (containsPizzaorEntradasItems) {
          pizzaPreparationStatus = OrderPreparationStatus.created;
        } else {
          // Si no hay pizzas, se asignan segn la subcategoría
          if (
            itemDto.product.subcategory.name === 'Hamburguesas' ||
            itemDto.product.subcategory.name === 'Ensaladas'
          ) {
            burgerPreparationStatus = OrderPreparationStatus.created;
          }
        }
      }
    }

    const order = this.orderRepository.create({
      ...createOrderDto,
      orderType: createOrderDto.orderType,
      status: OrderStatus.created,
      barPreparationStatus: barPreparationStatus,
      burgerPreparationStatus: burgerPreparationStatus,
      pizzaPreparationStatus: pizzaPreparationStatus,
      totalCost: createOrderDto.totalCost,
      comments: createOrderDto.comments,
      scheduledDeliveryTime: createOrderDto.scheduledDeliveryTime,
      phoneNumber: createOrderDto.phoneNumber,
      customerName: createOrderDto.customerName,
      area: createOrderDto.area,
      table: createOrderDto.table,
      orderItems: [],
    });

    const savedOrder = await this.orderRepository.save(order);

    for (const itemDto of orderItemsWithDetails) {
      await this.orderItemService.create({
        ...itemDto,
        orderId: savedOrder.id,
      });
    }

    const completeOrder = await this.orderRepository.findOne({
      where: { id: savedOrder.id },
      relations: ['orderItems', 'table'],
    });
    await this.appGateway.emitNewOrderToScreens(completeOrder.id);
    return completeOrder;
  }

  async updateOrder(
    orderId: number,
    updateOrderDto: UpdateOrderDto,
  ): Promise<Order> {
    console.log(updateOrderDto);
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['orderItems', 'table'],
    });

    if (!order) {
      throw new HttpException('Order not found', HttpStatus.NOT_FOUND);
    }

    // Actualiza los campos de la orden
    order.orderType = updateOrderDto.orderType;
    order.scheduledDeliveryTime = updateOrderDto.scheduledDeliveryTime;
    order.totalCost = updateOrderDto.totalCost;
    order.comments = updateOrderDto.comments;
    order.phoneNumber = updateOrderDto.phoneNumber;
    order.deliveryAddress = updateOrderDto.deliveryAddress;
    order.customerName = updateOrderDto.customerName;
    order.area = updateOrderDto.area;
    order.table = updateOrderDto.table;

    await this.orderRepository.save(order);

    const existingItemIds = order.orderItems.map((item) => item.id);

    // Crea una nueva instancia de OrderUpdate
    const orderUpdate = new OrderUpdate();
    orderUpdate.order = order;
    await this.orderUpdateRepository.save(orderUpdate);

    const updatedOrNewItems = updateOrderDto.orderItems.map(async (itemDto) => {
      if (itemDto.id && existingItemIds.includes(itemDto.id)) {
        // Actualiza el OrderItem existente
        const updatedItem = await this.orderItemService.update(
          itemDto.id,
          itemDto,
        );

        // Crea una nueva instancia de OrderItemUpdate para el OrderItem actualizado
        const orderItemUpdate = new OrderItemUpdate();
        orderItemUpdate.orderItem = updatedItem;
        orderItemUpdate.orderUpdate = orderUpdate;
        orderItemUpdate.isNewOrderItem = false;
        await this.orderItemUpdateRepository.save(orderItemUpdate);

        return updatedItem;
      } else {
        console.log('itemDto', itemDto);
        const newItem = await this.orderItemService.create({
          ...itemDto,
          orderId: order.id,
        });

        // Crea una nueva instancia de OrderItemUpdate para el nuevo OrderItem
        const orderItemUpdate = new OrderItemUpdate();
        orderItemUpdate.orderItem = newItem;
        orderItemUpdate.orderUpdate = orderUpdate;
        orderItemUpdate.isNewOrderItem = true;
        await this.orderItemUpdateRepository.save(orderItemUpdate);

        return newItem;
      }
    });

    await Promise.all(updatedOrNewItems);

    // Opcional: Eliminar los OrderItems que no están en updateOrderDto
    const newItemIds = updateOrderDto.orderItems
      .filter((item) => item.id)
      .map((item) => item.id);
    const itemsToDelete = existingItemIds.filter(
      (id) => !newItemIds.includes(id),
    );
    if (itemsToDelete.length > 0) {
      await this.orderItemRepository.delete(itemsToDelete);
    }

    // Recupera la orden actualizada con sus OrderItems actualizados
    const updatedOrder = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['orderItems', 'table'],
    });

    this.appGateway.emitOrderUpdated(updatedOrder.id);

    return updatedOrder;
  }

  async getOpenOrders(): Promise<Order[]> {
    const orders = await this.orderRepository.find({
      where: {
        status: In([
          OrderStatus.created,
          OrderStatus.in_preparation,
          OrderStatus.prepared,
        ]),
      },
      relations: ['area', 'table'],
    });
    return orders;
  }

  async getOrderById(orderId: number): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: {
        id: orderId,
        status: In([
          OrderStatus.created,
          OrderStatus.in_preparation,
          OrderStatus.prepared,
        ]),
      },
      relations: [
        'orderItems',
        'table',
        'area',
        'orderItems.product',
        'orderItems.product.productVariants',
        'orderItems.product.pizzaFlavors',
        'orderItems.product.pizzaIngredients',
        'orderItems.product.modifierTypes',
        'orderItems.product.modifierTypes.modifiers',
        'orderItems.product.productObservationTypes',
        'orderItems.product.productObservationTypes.productObservations',
        'orderItems.productVariant',
        'orderItems.selectedModifiers',
        'orderItems.selectedModifiers.modifier',
        'orderItems.selectedProductObservations',
        'orderItems.selectedProductObservations.productObservation',
        'orderItems.selectedPizzaFlavors',
        'orderItems.selectedPizzaFlavors.pizzaFlavor',
        'orderItems.selectedPizzaIngredients',
        'orderItems.selectedPizzaIngredients.pizzaIngredient',
      ],
    });
    return order;
  }

  async updateOrderPreparationStatus(newOrder: Order): Promise<Order> {
    const order = await this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.orderItems', 'orderItem')
      .leftJoinAndSelect('orderItem.product', 'product')
      .leftJoinAndSelect('product.subcategory', 'subcategory')
      .leftJoinAndSelect('subcategory.category', 'category')
      .select([
        'order.id',
        'order.status',
        'order.barPreparationStatus',
        'order.burgerPreparationStatus',
        'order.pizzaPreparationStatus',
        'orderItem.id',
        'orderItem.status',
        'subcategory.id',
        'subcategory.name',
        'category.id',
        'category.name',
      ])
      .where('order.id = :orderId', { orderId: newOrder.id })
      .getOne();

    if (!order) {
      throw new Error('Order not found');
    }

    // Determina si la orden contiene ítems de pizza o entradas
    const containsPizzaorEntradasItems = order.orderItems.some(
      (item) =>
        item.product.subcategory.name === 'Pizzas' ||
        item.product.subcategory.name === 'Entradas',
    );

    // Actualiza los estados de preparación de la orden si han cambiado
    order.barPreparationStatus =
      newOrder.barPreparationStatus ?? order.barPreparationStatus;
    order.burgerPreparationStatus =
      newOrder.burgerPreparationStatus ?? order.burgerPreparationStatus;
    order.pizzaPreparationStatus =
      newOrder.pizzaPreparationStatus ?? order.pizzaPreparationStatus;

    // Actualiza solo los OrderItems que corresponden a la pantalla actualizada
    await Promise.all(
      order.orderItems.map(async (item) => {
        if (
          item.product.subcategory.category.name === 'Bebida' &&
          newOrder.barPreparationStatus
        ) {
          item.status = OrderItemStatus[newOrder.barPreparationStatus];
        } else if (item.product.subcategory.category.name === 'Comida') {
          if (containsPizzaorEntradasItems && newOrder.pizzaPreparationStatus) {
            // Si hay pizzas o entradas, todos los ítems de comida van a la pantalla de pizza
            item.status = OrderItemStatus[newOrder.pizzaPreparationStatus];
          } else if (
            !containsPizzaorEntradasItems &&
            newOrder.burgerPreparationStatus &&
            ['Hamburguesas', 'Ensaladas'].includes(
              item.product.subcategory.name,
            )
          ) {
            // Si no hay pizzas o entradas, los ítems de hamburguesas y ensaladas van a la pantalla de burger
            item.status = OrderItemStatus[newOrder.burgerPreparationStatus];
          }
        }
        await this.orderItemRepository.save(item);
      }),
    );

    // Determina el estado general de la orden basado en los estados de preparación
    const preparationStatuses = [
      order.barPreparationStatus,
      order.burgerPreparationStatus,
      order.pizzaPreparationStatus,
    ];

    // Si al menos uno de los estados de preparación está en 'in_preparation', entonces la orden está 'in_preparation'
    if (preparationStatuses.includes(OrderPreparationStatus.in_preparation)) {
      order.status = OrderStatus.in_preparation;
    } else if (
      // Si todos los estados de preparación son 'prepared' o 'not_required', entonces la orden está 'prepared'
      preparationStatuses.every((status) =>
        [
          OrderPreparationStatus.prepared,
          OrderPreparationStatus.not_required,
        ].includes(status),
      )
    ) {
      order.status = OrderStatus.prepared;
    }

    await this.orderRepository.save(order);

    const completeOrder = await this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.orderItems', 'orderItem')
      .leftJoinAndSelect('orderItem.product', 'product')
      .leftJoinAndSelect('product.subcategory', 'subcategory')
      .leftJoinAndSelect('subcategory.category', 'category')
      .select([
        'order.id',
        'order.status',
        'order.barPreparationStatus',
        'order.burgerPreparationStatus',
        'order.pizzaPreparationStatus',
        'order.orderType',
        'orderItem.id',
        'orderItem.status',
        'product.id',
        'product.name',
        'subcategory.id',
        'subcategory.name',
        'category.id',
        'category.name',
      ])
      .where('order.id = :orderId', { orderId: newOrder.id })
      .getOne();

    if (!completeOrder) {
      throw new Error('Order not found after update');
    }

    this.appGateway.emitOrderStatusUpdated(completeOrder);
    return completeOrder;
  }

  async updateOrderItemStatus(newOrderItem: OrderItem): Promise<OrderItem> {
    const orderItem = await this.orderItemRepository
      .createQueryBuilder('orderItem')
      .leftJoinAndSelect('orderItem.order', 'order')
      .leftJoinAndSelect('order.orderItems', 'allOrderItems')
      .leftJoinAndSelect('allOrderItems.product', 'product')
      .leftJoinAndSelect('product.subcategory', 'subcategory')
      .leftJoinAndSelect('subcategory.category', 'category')
      .select([
        'orderItem.id',
        'orderItem.status',
        'order.id',
        'order.status',
        'order.orderType',
        'allOrderItems.id',
        'allOrderItems.status',
        'product.id',
        'product.name',
        'subcategory.id',
        'subcategory.name',
        'category.id',
        'category.name',
      ])
      .where('orderItem.id = :orderItemId', { orderItemId: newOrderItem.id })
      .getOne();

    if (!orderItem) {
      throw new Error('OrderItem not found');
    }

    if (!orderItem.order || orderItem.order.id !== newOrderItem.order.id) {
      throw new Error('OrderItem does not belong to the specified order');
    }

    // Actualiza el estado del OrderItem
    orderItem.status = newOrderItem.status;

    await this.orderItemRepository.save(orderItem);

    // Recupera el objeto Order completo con todas las relaciones necesarias para emitOrderItemStatusUpdated
    const completeOrder = await this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.orderItems', 'orderItem')
      .leftJoinAndSelect('orderItem.product', 'product')
      .leftJoinAndSelect('product.subcategory', 'subcategory')
      .leftJoinAndSelect('subcategory.category', 'category')
      .select([
        'order.id',
        'order.status',
        'order.orderType',
        'orderItem.id',
        'orderItem.status',
        'product.id',
        'product.name',
        'subcategory.id',
        'subcategory.name',
        'category.id',
        'category.name',
      ])
      .where('order.id = :orderId', { orderId: orderItem.order.id })
      .getOne();

    if (!completeOrder) {
      throw new Error('Order not found after update');
    }

    // Llama a emitOrderItemStatusUpdated con el objeto Order completo y el ID del OrderItem actualizado
    await this.appGateway.emitOrderItemStatusUpdated(
      completeOrder,
      orderItem.id,
    );
    return orderItem;
  }
}
