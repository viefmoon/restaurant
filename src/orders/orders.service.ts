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
        order: savedOrder,
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
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: [
        'orderItems',
        'orderItems.product',
        'orderItems.product.subcategory',
        'orderItems.product.subcategory.category',
      ],
    });

    if (!order) {
      throw new HttpException('Order not found', HttpStatus.NOT_FOUND);
    }

    const lastUpdate = await this.orderUpdateRepository.findOne({
      where: { order: { id: orderId } },
      order: { updateNumber: 'DESC' },
    });

    const orderUpdate = new OrderUpdate();
    orderUpdate.order = order;
    orderUpdate.updateNumber = lastUpdate ? lastUpdate.updateNumber + 1 : 1;
    await this.orderUpdateRepository.save(orderUpdate);

    const existingItemIds = order.orderItems.map((item) => item.id);

    // Variables to determine if screen states need to be updated
    let updateBarScreen = false;
    let updatePizzaScreen = false;
    let updateBurgerScreen = false;
    let hasNewItems = false;
    const updatedOrNewItems = updateOrderDto.orderItems.map(async (itemDto) => {
      if (itemDto.id && existingItemIds.includes(itemDto.id)) {
        const existingItem = await this.findOrderItemById(itemDto.id);
        if (this.itemDtoHasSignificantChanges(existingItem, itemDto)) {
          const updatedItem = await this.orderItemService.update(
            itemDto.id,
            itemDto,
          );

          const orderItemUpdate = new OrderItemUpdate();
          orderItemUpdate.orderItem = updatedItem;
          orderItemUpdate.orderUpdate = orderUpdate;
          orderItemUpdate.isNewOrderItem = false;
          await this.orderItemUpdateRepository.save(orderItemUpdate);

          if (updatedItem.product.subcategory.category.name === 'Bebida') {
            updateBarScreen = true;
          } else if (
            updatedItem.product.subcategory.category.name === 'Comida'
          ) {
            if (
              updatedItem.product.subcategory.name === 'Pizzas' ||
              updatedItem.product.subcategory.name === 'Entradas'
            ) {
              updatePizzaScreen = true;
            } else if (
              updatedItem.product.subcategory.name === 'Hamburguesas' ||
              updatedItem.product.subcategory.name === 'Ensaladas'
            ) {
              updateBurgerScreen = true;
            }
          }
          return updatedItem;
        }
      } else {
        hasNewItems = true;
        const newItem = await this.orderItemService.create({
          ...itemDto,
          order: order,
        });

        const orderItemUpdate = new OrderItemUpdate();
        orderItemUpdate.orderItem = newItem;
        orderItemUpdate.orderUpdate = orderUpdate;
        orderItemUpdate.isNewOrderItem = true;

        await this.orderItemUpdateRepository.save(orderItemUpdate);

        // Check if the new item requires updating the screen state
        if (newItem.product.subcategory.category.name === 'Bebida') {
          updateBarScreen = true;
        } else if (newItem.product.subcategory.category.name === 'Comida') {
          if (
            newItem.product.subcategory.name === 'Pizzas' ||
            newItem.product.subcategory.name === 'Entradas'
          ) {
            updatePizzaScreen = true;
          } else if (
            newItem.product.subcategory.name === 'Hamburguesas' ||
            newItem.product.subcategory.name === 'Ensaladas'
          ) {
            updateBurgerScreen = true;
          }
        }

        return newItem;
      }
    });

    await Promise.all(updatedOrNewItems);

    const newItemIds = updateOrderDto.orderItems
      .filter((item) => item.id)
      .map((item) => item.id);
    const itemsToDelete = existingItemIds.filter(
      (id) => !newItemIds.includes(id),
    );
    if (itemsToDelete.length > 0) {
      await this.orderItemRepository.delete(itemsToDelete);
    }

    const updatedOrder = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: [
        'orderItems',
        'orderItems.product',
        'orderItems.product.subcategory',
        'orderItems.product.subcategory.category',
      ],
    });

    // Actualiza los campos de la orden
    updatedOrder.orderType = updateOrderDto.orderType;
    updatedOrder.scheduledDeliveryTime = updateOrderDto.scheduledDeliveryTime;
    updatedOrder.totalCost = updateOrderDto.totalCost;
    updatedOrder.comments = updateOrderDto.comments;
    updatedOrder.phoneNumber = updateOrderDto.phoneNumber;
    updatedOrder.deliveryAddress = updateOrderDto.deliveryAddress;
    updatedOrder.customerName = updateOrderDto.customerName;
    order.area = updateOrderDto.area;
    updatedOrder.table = updateOrderDto.table;

    const previousOrderStatus = order.status;
    const previousBarPreparationStatus = order.barPreparationStatus;
    const previousPizzaPreparationStatus = order.pizzaPreparationStatus;
    const previousBurgerPreparationStatus = order.burgerPreparationStatus;
    
    // Luego, actualiza el estado de la orden solo si el estado anterior era 'prepared'
    if (hasNewItems && previousOrderStatus === OrderStatus.prepared) {
      updatedOrder.status = OrderStatus.in_preparation;
    }
    
    // Actualiza el estado de las pantallas basándote en los estados anteriores y las banderas de actualización
    if (updateBarScreen && previousBarPreparationStatus === OrderPreparationStatus.prepared) {
      updatedOrder.barPreparationStatus = OrderPreparationStatus.in_preparation;
    }
    
    if (updatePizzaScreen && previousPizzaPreparationStatus === OrderPreparationStatus.prepared) {
      updatedOrder.pizzaPreparationStatus = OrderPreparationStatus.in_preparation;
    }
    
    if (updateBurgerScreen && previousBurgerPreparationStatus === OrderPreparationStatus.prepared) {
      updatedOrder.burgerPreparationStatus = OrderPreparationStatus.in_preparation;
    }
    
    // Finalmente, guarda los cambios y emite la actualización
    await this.orderRepository.save(updatedOrder);
    this.appGateway.emitOrderUpdated(updatedOrder.id);
    
    return updatedOrder;
  }


  async findOrderItemById(id: number): Promise<OrderItem> {
    return await this.orderItemRepository.findOne({
      where: { id: id },
      relations: [
        'productVariant',
        'selectedModifiers',
        'selectedProductObservations',
        'selectedPizzaFlavors',
        'selectedPizzaIngredients',
        'product',
      ],
    });
  }

  private itemDtoHasSignificantChanges(
    existingItem: OrderItem,
    itemDto: any,
  ): boolean {
    // Compara campos simples primero
    if (
      existingItem.comments !== itemDto.comments ||
      existingItem.product.id !== itemDto.product.id ||
      (existingItem.productVariant &&
        itemDto.productVariant &&
        existingItem.productVariant.id !== itemDto.productVariant.id)
    ) {
      return true;
    }

    // Compara las relaciones que pueden tener arrays de IDs para simplificar
    // Nota: Esto asume que itemDto y existingItem tienen las propiedades en el mismo formato
    // Puede necesitar ajustes si, por ejemplo, itemDto tiene arrays de objetos en lugar de IDs
    const compareArrays = (arr1: any[], arr2: any[]): boolean => {
      if (arr1.length !== arr2.length) return true;
      const set = new Set([...arr1, ...arr2]);
      return set.size !== arr1.length; // Si el tamaño es diferente, hay elementos únicos
    };

    // Ejemplo de comparación de relaciones (modificadores seleccionados, observaciones, etc.)
    if (
      compareArrays(
        existingItem.selectedModifiers.map((m) => m.id),
        itemDto.selectedModifiers,
      ) ||
      compareArrays(
        existingItem.selectedProductObservations.map((o) => o.id),
        itemDto.selectedProductObservations,
      ) ||
      compareArrays(
        existingItem.selectedPizzaFlavors.map((f) => f.id),
        itemDto.selectedPizzaFlavors,
      ) ||
      compareArrays(
        existingItem.selectedPizzaIngredients.map((i) => i.id),
        itemDto.selectedPizzaIngredients,
      )
    ) {
      return true;
    }

    // Agrega aquí más comparaciones según sea necesario

    return false; // No se encontraron cambios significativos
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
        'product.id',
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

    const containsBurgerOrSaladItems = order.orderItems.some(
      (item) =>
        item.product.subcategory.name === 'Hamburguesas' ||
        item.product.subcategory.name === 'Ensaladas',
    );

    // Solo actualiza barPreparationStatus si newOrder proporciona un valor diferente de 'null'
    if (String(newOrder.barPreparationStatus) !== 'null') {
      order.barPreparationStatus = newOrder.barPreparationStatus;
    }

    // Solo actualiza burgerPreparationStatus si newOrder proporciona un valor diferente de 'null'
    if (String(newOrder.burgerPreparationStatus) !== 'null') {
      order.burgerPreparationStatus = newOrder.burgerPreparationStatus;
    }

    // Solo actualiza pizzaPreparationStatus si newOrder proporciona un valor diferente de 'null'
    if (String(newOrder.pizzaPreparationStatus) !== 'null') {
      order.pizzaPreparationStatus = newOrder.pizzaPreparationStatus;
    }

    // Verifica condiciones adicionales para burgerPreparationStatus
    if (containsPizzaorEntradasItems && containsBurgerOrSaladItems && String(newOrder.pizzaPreparationStatus) !== 'null') {
      if (order.burgerPreparationStatus === OrderPreparationStatus.not_required && 
          [OrderPreparationStatus.in_preparation, OrderPreparationStatus.prepared].includes(newOrder.pizzaPreparationStatus)) {
        order.burgerPreparationStatus = OrderPreparationStatus.created;
      }
    }

    // Actualiza solo los OrderItems que corresponden a la pantalla actualizada
    await Promise.all(
      order.orderItems.map(async (item) => {
        if (
          item.product.subcategory.category.name === 'Bebida' &&
          String(newOrder.barPreparationStatus) !== 'null'
        ) {
          item.status = OrderItemStatus[newOrder.barPreparationStatus];
        } else if (item.product.subcategory.category.name === 'Comida') {
          if (
            containsPizzaorEntradasItems &&
            String(newOrder.pizzaPreparationStatus) !== 'null'
          ) {
            // Si hay pizzas o entradas, todos los ítems de comida van a la pantalla de pizza
            item.status = OrderItemStatus[newOrder.pizzaPreparationStatus];
          } else if (
            String(newOrder.burgerPreparationStatus) !== 'null' &&
            ['Hamburguesas', 'Ensaladas'].includes(
              item.product.subcategory.name,
            )
          ) {
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

  async findOrderItemsWithCounts(subcategories?: string[], ordersLimit?: number): Promise<any[]> {
    let recentOrderIds: number[] = [];
    if (ordersLimit) {
      const recentOrders = await this.orderRepository
        .createQueryBuilder("order")
        .where("order.status IN (:...orderStatuses)", { orderStatuses: ['created', 'in_preparation'] })
        .orderBy("order.creationDate", "DESC")
        .limit(ordersLimit)
        .getMany();
  
      recentOrderIds = recentOrders.map(order => order.id);
    }
  
    const queryBuilder = this.orderItemRepository
      .createQueryBuilder("orderItem")
      .leftJoinAndSelect("orderItem.order", "order")
      .leftJoinAndSelect("orderItem.product", "product")
      .leftJoinAndSelect("product.subcategory", "subcategory")
      .leftJoinAndSelect("orderItem.productVariant", "productVariant")
      .where("orderItem.status IN (:...statuses)", { statuses: ['created', 'in_preparation'] })
      .andWhere("order.status IN (:...orderStatuses)", { orderStatuses: ['created', 'in_preparation'] });
  
    if (subcategories && subcategories.length > 0) {
      queryBuilder.andWhere("subcategory.name IN (:...subcategories)", { subcategories });
    }
  
    if (ordersLimit) {
      queryBuilder.andWhere("order.id IN (:...recentOrderIds)", { recentOrderIds });
    }
  
    const orderItems = await queryBuilder.getMany();
  
    const groupedBySubcategory = orderItems.reduce((acc, item) => {
      const subcategoryName = item.product.subcategory.name;
      if (!acc[subcategoryName]) {
        acc[subcategoryName] = [];
      }
      const productOrVariantName = item.productVariant ? `${item.product.name} - ${item.productVariant.name}` : item.product.name;
      const existingProductOrVariant = acc[subcategoryName].find(p => p.name === productOrVariantName);
      if (existingProductOrVariant) {
        existingProductOrVariant.count += 1;
      } else {
        acc[subcategoryName].push({ name: productOrVariantName, count: 1 });
      }
      return acc;
    }, {});
  
    return Object.entries(groupedBySubcategory).map(([subcategoryName, products]) => ({
      subcategoryName,
      products,
    }));
  }

  async registerPayment(orderId: number, amount: number): Promise<Order> {
    const order = await this.orderRepository.findOne({ where: { id: orderId } });
    if (!order) {
        throw new Error('Order not found');
    }
    order.amountPaid = amount;
    await this.orderRepository.save(order);
    return order;
}

async completeOrder(orderId: number): Promise<Order> {
    const order = await this.orderRepository.findOne({ where: { id: orderId } });
    if (!order) {
        throw new Error('Order not found');
    }
    if (order.status !== OrderStatus.prepared) {
        throw new Error('Order is not in a state that can be completed');
    }
    order.status = OrderStatus.finished;
    await this.orderRepository.save(order);
    return order;
}
  
}
