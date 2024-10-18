import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, EntityManager, DataSource } from 'typeorm';
import {
  Order,
  OrderPreparationStatus,
  OrderStatus,
  OrderType,
} from './order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderItemsService } from 'src/order_items/order-items.service';
import { Table, TableStatus } from 'src/tables/table.entity';
import { AppGateway } from '../app.gateway';
import { OrderItem, OrderItemStatus } from 'src/order_items/order-item.entity';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Product } from 'src/products/product.entity';
import { OrderUpdate } from 'src/order_updates/order-update.entity';
import { OrderItemUpdate } from 'src/order_item_updates/order-item-update.entity';
import { OrderAdjustment } from 'src/order_adjustment/order-adjustment.entity';
import { OrderCounter } from 'src/order_counters/order-counter.entity';
import { OrderPrint } from 'src/order_prints/order-print.entity';
import { seedRoles } from 'src/seeders/role.seeder';
import { seedUsers } from 'src/seeders/user.seeder';
import { seedTables } from 'src/seeders/table.seeder';
import { seedProducts } from 'src/seeders/product.seeder';
import { UpdateOrderItemDto } from 'src/order_items/dto/update-order-item.dto';
import { Interval } from '@nestjs/schedule';
import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class OrdersService {
  private syncOrdersUrl = `${process.env.SERVER_URL}/orders/unsynced`;

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
    @InjectRepository(OrderAdjustment)
    private readonly orderAdjustmentRepository: Repository<OrderAdjustment>,
    @InjectRepository(OrderCounter)
    private readonly orderCounterRepository: Repository<OrderCounter>,
    private readonly orderItemService: OrderItemsService,
    private readonly appGateway: AppGateway,
    private readonly dataSource: DataSource,
  ) {}

  async createOrder(createOrderDto: CreateOrderDto): Promise<Order> {
    let savedOrderId: number;
    const completeOrder = await this.orderRepository.manager.transaction(
      async (transactionalEntityManager) => {
        // Paso 1: Consulta los productos por ID
        const productIds = createOrderDto.orderItems.map(
          (item) => item.product.id,
        );
        const productsWithDetails = await transactionalEntityManager.find(
          Product,
          {
            where: { id: In(productIds) },
            relations: ['subcategory', 'subcategory.category'],
          },
        );

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

        // Paso 3: Manejar la creación de la mesa si es necesario
        let tableEntity = createOrderDto.table;
        if (createOrderDto.table && !createOrderDto.table.id) {
          // Crear una nueva mesa si no se proporciona un ID
          tableEntity = transactionalEntityManager.create(Table, {
            number: createOrderDto.table.number,
            temporaryIdentifier: createOrderDto.table.temporaryIdentifier,
            status: TableStatus.OCCUPIED,
            area: createOrderDto.area,
          });
          await transactionalEntityManager.save(tableEntity);
        } else if (createOrderDto.table && createOrderDto.table.id) {
          // Si se proporciona un ID, buscar y actualizar la mesa existente
          tableEntity = await transactionalEntityManager.findOne(Table, {
            where: { id: createOrderDto.table.id },
          });
          if (tableEntity) {
            tableEntity.status = TableStatus.OCCUPIED;
            await transactionalEntityManager.save(tableEntity);
          }
        }

        // Inicializa los estados de preparación
        let barPreparationStatus = OrderPreparationStatus.not_required;
        let burgerPreparationStatus = OrderPreparationStatus.not_required;
        let pizzaPreparationStatus = OrderPreparationStatus.not_required;

        // Verifica si la orden contiene ítems de pizza o entradas
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
              // Si no hay pizzas, se asignan según la subcategoría
              if (
                itemDto.product.subcategory.name === 'Hamburguesas' ||
                itemDto.product.subcategory.name === 'Ensaladas'
              ) {
                burgerPreparationStatus = OrderPreparationStatus.created;
              }
            }
          }
        }

        const order = transactionalEntityManager.create(Order, {
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
          table: tableEntity,
          orderItems: [],
          orderNumber: await this.getNextOrderNumber(new Date()),
        });

        const savedOrder = await transactionalEntityManager.save(order);
        savedOrderId = savedOrder.id;

        for (const itemDto of orderItemsWithDetails) {
          await this.orderItemService.create(
            {
              ...itemDto,
              order: savedOrder,
            },
            transactionalEntityManager,
          );
        }
        if (
          createOrderDto.orderAdjustments &&
          Array.isArray(createOrderDto.orderAdjustments)
        ) {
          for (const adjustmentDto of createOrderDto.orderAdjustments) {
            const orderAdjustment = transactionalEntityManager.create(
              OrderAdjustment,
              {
                ...adjustmentDto,
                order: savedOrder,
              },
            );
            await transactionalEntityManager.save(orderAdjustment);
          }
        }

        return await transactionalEntityManager.findOne(Order, {
          where: { id: savedOrder.id },
          relations: ['orderItems', 'table', 'orderAdjustments'],
        });
      },
    );

    if (savedOrderId) {
      await this.appGateway.emitNewOrderToScreens(savedOrderId);
    } else {
      throw new HttpException(
        'Error al crear la orden',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return completeOrder;
  }

  async updateOrder(
    orderId: number,
    updateOrderDto: UpdateOrderDto,
    updatedBy: string,
  ): Promise<Order> {
    let updatedOrderId: number;

    const updatedOrder = await this.orderRepository.manager.transaction(
      async (transactionalEntityManager) => {
        const order = await transactionalEntityManager.findOne(Order, {
          where: { id: orderId },
          relations: [
            'orderAdjustments',
            'orderItems',
            'orderItems.product',
            'orderItems.product.subcategory',
            'orderItems.product.subcategory.category',
            'table',
            'area',
          ],
        });

        let tableEntity = order.table;
        const previousTable = order.table; // Save previous table for later comparison

        if (updateOrderDto.table) {
          if (!updateOrderDto.table.id) {
            // Create a new table if no ID is provided
            tableEntity = transactionalEntityManager.create(Table, {
              number: updateOrderDto.table.number,
              temporaryIdentifier: updateOrderDto.table.temporaryIdentifier,
              status: TableStatus.OCCUPIED,
              area: updateOrderDto.area,
            });
            await transactionalEntityManager.save(tableEntity);
          } else {
            // If an ID is provided, find and update the existing table
            tableEntity = await transactionalEntityManager.findOne(Table, {
              where: { id: updateOrderDto.table.id },
            });
            if (tableEntity) {
              tableEntity.number =
                updateOrderDto.table.number || tableEntity.number;
              tableEntity.temporaryIdentifier =
                updateOrderDto.table.temporaryIdentifier ||
                tableEntity.temporaryIdentifier;
              tableEntity.status = TableStatus.OCCUPIED;
              // Update the area if necessary
              if (updateOrderDto.area) {
                tableEntity.area = updateOrderDto.area;
              }
              await transactionalEntityManager.save(tableEntity);
            }
          }
        }

        // If the table has changed, set the previous table's status to AVAILABLE
        if (previousTable && previousTable.id !== tableEntity.id) {
          previousTable.status = TableStatus.AVAILABLE;
          await transactionalEntityManager.save(previousTable);
        }

        const lastUpdate = await transactionalEntityManager.findOne(
          OrderUpdate,
          {
            where: { order: { id: orderId } },
            order: { updateNumber: 'DESC' },
          },
        );

        const orderUpdate = new OrderUpdate();
        orderUpdate.order = order;
        orderUpdate.updatedBy = updatedBy;
        orderUpdate.updateNumber = lastUpdate ? lastUpdate.updateNumber + 1 : 1;
        const savedOrderUpdate =
          await transactionalEntityManager.save(orderUpdate);

        const existingItemIds = order.orderItems.map((item) => item.id);

        // Variables to determine if screen states need to be updated
        let updateBarScreen = false;
        let updatePizzaScreen = false;
        let updateBurgerScreen = false;
        let hasNewItems = false;
        const updatedOrNewItems = updateOrderDto.orderItems.map(
          async (itemDto) => {
            if (itemDto.id && existingItemIds.includes(itemDto.id)) {
              const existingItem = await this.findOrderItemById(
                itemDto.id,
                transactionalEntityManager,
              );
              if (this.itemDtoHasSignificantChanges(existingItem, itemDto)) {
                const updatedItem = await this.orderItemService.update(
                  itemDto.id,
                  itemDto,
                  transactionalEntityManager,
                );

                const orderItemUpdate = new OrderItemUpdate();
                orderItemUpdate.orderItem = updatedItem;
                orderItemUpdate.orderUpdate = orderUpdate;
                orderItemUpdate.isNewOrderItem = false;
                await transactionalEntityManager.save(orderItemUpdate);

                if (
                  updatedItem.product.subcategory.category.name === 'Bebida'
                ) {
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
              const newItem = await this.orderItemService.create(
                {
                  ...itemDto,
                  order: order,
                  status: OrderItemStatus.created,
                },
                transactionalEntityManager,
              );

              // Verificar el estado de preparación de la pantalla correspondiente
              if (newItem.product.subcategory.category.name === 'Bebida') {
                if (
                  order.barPreparationStatus ===
                    OrderPreparationStatus.in_preparation ||
                  order.barPreparationStatus === OrderPreparationStatus.prepared
                ) {
                  newItem.status = OrderItemStatus.in_preparation;
                }
                updateBarScreen = true;
              } else if (
                newItem.product.subcategory.category.name === 'Comida'
              ) {
                if (
                  newItem.product.subcategory.name === 'Pizzas' ||
                  newItem.product.subcategory.name === 'Entradas'
                ) {
                  if (
                    order.pizzaPreparationStatus ===
                      OrderPreparationStatus.in_preparation ||
                    order.pizzaPreparationStatus ===
                      OrderPreparationStatus.prepared
                  ) {
                    newItem.status = OrderItemStatus.in_preparation;
                  }
                  updatePizzaScreen = true;
                } else if (
                  newItem.product.subcategory.name === 'Hamburguesas' ||
                  newItem.product.subcategory.name === 'Ensaladas'
                ) {
                  if (
                    order.burgerPreparationStatus ===
                      OrderPreparationStatus.in_preparation ||
                    order.burgerPreparationStatus ===
                      OrderPreparationStatus.prepared
                  ) {
                    newItem.status = OrderItemStatus.in_preparation;
                  }
                  updateBurgerScreen = true;
                }
              }

              // Guardar el newItem con el estado actualizado
              await transactionalEntityManager.save(newItem);

              const orderItemUpdate = new OrderItemUpdate();
              orderItemUpdate.orderItem = newItem;
              orderItemUpdate.orderUpdate = orderUpdate;
              orderItemUpdate.isNewOrderItem = true;
              await transactionalEntityManager.save(orderItemUpdate);

              return newItem;
            }
          },
        );

        await Promise.all(updatedOrNewItems);

        const newItemIds = updateOrderDto.orderItems
          .filter((item) => item.id)
          .map((item) => item.id);

        // Obtener los OrderItems existentes con su estado
        const existingItems = await transactionalEntityManager.find(OrderItem, {
          where: { id: In(existingItemIds) },
          select: ['id', 'status'],
        });

        // Filtrar los OrderItems que se pueden eliminar (estado diferente a "prepared")
        const itemsToDelete = existingItems
          .filter((item) => item.status !== OrderItemStatus.prepared)
          .map((item) => item.id)
          .filter((id) => !newItemIds.includes(id));

        if (itemsToDelete.length > 0) {
          await transactionalEntityManager
            .createQueryBuilder()
            .delete()
            .from('selected_modifiers')
            .where('orderItemId IN (:...ids)', { ids: itemsToDelete })
            .execute();

          await transactionalEntityManager
            .createQueryBuilder()
            .delete()
            .from('selected_pizza_flavors')
            .where('orderItemId IN (:...ids)', { ids: itemsToDelete })
            .execute();

          await transactionalEntityManager
            .createQueryBuilder()
            .delete()
            .from('selected_pizza_ingredients')
            .where('orderItemId IN (:...ids)', { ids: itemsToDelete })
            .execute();

          await transactionalEntityManager
            .createQueryBuilder()
            .delete()
            .from(OrderItemUpdate)
            .where('orderItemId IN (:...ids)', { ids: itemsToDelete })
            .execute();

          await transactionalEntityManager
            .createQueryBuilder()
            .delete()
            .from(OrderItem)
            .where('id IN (:...ids)', { ids: itemsToDelete })
            .execute();
        }

        const existingAdjustmentIds = order.orderAdjustments.map(
          (adjustment) => adjustment.id,
        );

        // Actualiza o crea los orderAdjustments
        for (const adjustmentDto of updateOrderDto.orderAdjustments) {
          if (
            adjustmentDto.id &&
            existingAdjustmentIds.includes(adjustmentDto.id)
          ) {
            // Actualiza el orderAdjustment existente
            await transactionalEntityManager.update(
              OrderAdjustment,
              { id: adjustmentDto.id },
              { name: adjustmentDto.name, amount: adjustmentDto.amount },
            );
          } else {
            // Crea un nuevo orderAdjustment
            const newAdjustment = transactionalEntityManager.create(
              OrderAdjustment,
              {
                ...adjustmentDto,
                order: order,
              },
            );
            await transactionalEntityManager.save(newAdjustment);
          }
        }

        // Elimina los orderAdjustments que ya no están presentes
        const newAdjustmentIds = updateOrderDto.orderAdjustments
          .filter((adjustment) => adjustment.id)
          .map((adjustment) => adjustment.id);
        const adjustmentsToDelete = existingAdjustmentIds.filter(
          (id) => !newAdjustmentIds.includes(id),
        );
        if (adjustmentsToDelete.length > 0) {
          await transactionalEntityManager.delete(
            OrderAdjustment,
            adjustmentsToDelete,
          );
        }

        const updatedOrder = await transactionalEntityManager.findOne(Order, {
          where: { id: orderId },
          relations: [
            'orderAdjustments',
            'orderItems',
            'orderItems.product',
            'orderItems.product.subcategory',
            'orderItems.product.subcategory.category',
          ],
        });

        // Actualiza los campos de la orden
        updatedOrder.orderType = updateOrderDto.orderType;
        updatedOrder.scheduledDeliveryTime =
          updateOrderDto.scheduledDeliveryTime;
        updatedOrder.totalCost = updateOrderDto.totalCost;
        updatedOrder.comments = updateOrderDto.comments;
        updatedOrder.phoneNumber = updateOrderDto.phoneNumber;
        updatedOrder.deliveryAddress = updateOrderDto.deliveryAddress;
        updatedOrder.customerName = updateOrderDto.customerName;
        updatedOrder.area = updateOrderDto.area;
        updatedOrder.table = tableEntity;

        const previousOrderStatus = order.status;
        const previousBarPreparationStatus = order.barPreparationStatus;
        const previousPizzaPreparationStatus = order.pizzaPreparationStatus;
        const previousBurgerPreparationStatus = order.burgerPreparationStatus;

        // Luego, actualiza el estado de la orden solo si el estado anterior era 'prepared', lo pone en preparacio
        if (hasNewItems && previousOrderStatus === OrderStatus.prepared) {
          updatedOrder.status = OrderStatus.in_preparation;
        }

        // Actualiza el estado de las pantallas basándote en los estados anteriores y las banderas de actualización
        if (
          updateBarScreen &&
          previousBarPreparationStatus === OrderPreparationStatus.prepared
        ) {
          updatedOrder.barPreparationStatus =
            OrderPreparationStatus.in_preparation;
        } else if (
          updateBarScreen &&
          previousBarPreparationStatus === OrderPreparationStatus.not_required
        ) {
          updatedOrder.barPreparationStatus = OrderPreparationStatus.created;
        }

        if (
          updatePizzaScreen &&
          previousPizzaPreparationStatus === OrderPreparationStatus.prepared
        ) {
          updatedOrder.pizzaPreparationStatus =
            OrderPreparationStatus.in_preparation;
        } else if (
          updatePizzaScreen &&
          previousPizzaPreparationStatus === OrderPreparationStatus.not_required
        ) {
          updatedOrder.pizzaPreparationStatus = OrderPreparationStatus.created;
        }

        if (
          updateBurgerScreen &&
          previousBurgerPreparationStatus === OrderPreparationStatus.prepared
        ) {
          updatedOrder.burgerPreparationStatus =
            OrderPreparationStatus.in_preparation;
        } else if (
          updateBurgerScreen &&
          previousBurgerPreparationStatus ===
            OrderPreparationStatus.not_required
        ) {
          // Verifica también el estado de pizzaPreparationStatus antes de cambiar burgerPreparationStatus
          if (
            updatedOrder.pizzaPreparationStatus ===
              OrderPreparationStatus.prepared ||
            updatedOrder.pizzaPreparationStatus ===
              OrderPreparationStatus.in_preparation ||
            updatedOrder.pizzaPreparationStatus ===
              OrderPreparationStatus.not_required
          ) {
            updatedOrder.burgerPreparationStatus =
              OrderPreparationStatus.created;
          }
        }

        // Finalmente, guarda los cambios y emite la actualización
        const savedOrder = await transactionalEntityManager.save(updatedOrder);
        updatedOrderId = savedOrder.id;

        return savedOrder;
      },
    );

    // Asegúrate de que la transacción se haya completado antes de emitir el evento
    if (updatedOrderId) {
      this.appGateway.emitOrderUpdated(updatedOrderId);
    }

    return updatedOrder;
  }

  async findOrderItemById(
    id: number,
    transactionalEntityManager?: EntityManager,
  ): Promise<OrderItem> {
    const repository = transactionalEntityManager
      ? transactionalEntityManager.getRepository(OrderItem)
      : this.orderItemRepository;
    return await repository.findOne({
      where: { id: id },
      relations: [
        'productVariant',
        'selectedModifiers',
        'selectedPizzaFlavors',
        'selectedPizzaIngredients',
        'selectedPizzaIngredients.pizzaIngredient',
        'product',
      ],
    });
  }

  private itemDtoHasSignificantChanges(
    existingItem: OrderItem,
    itemDto: UpdateOrderItemDto,
  ): boolean {
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
    const compareArrays = (arr1: any[], arr2: any[]): boolean => {
      if (arr1.length !== arr2.length) return true;
      const ids1 = arr1.map((item) => item.id).sort();
      const ids2 = arr2.map((item) => item.id).sort();
      return !ids1.every((value, index) => value === ids2[index]);
    };

    // Ejemplo de comparación de relaciones (modificadores seleccionados, observaciones, etc.)
    if (
      compareArrays(
        existingItem.selectedModifiers,
        itemDto.selectedModifiers,
      ) ||
      compareArrays(
        existingItem.selectedPizzaFlavors,
        itemDto.selectedPizzaFlavors,
      ) ||
      compareArrays(
        existingItem.selectedPizzaIngredients,
        itemDto.selectedPizzaIngredients,
      )
    ) {
      return true;
    }
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

  async getClosedOrders(): Promise<Order[]> {
    const queryBuilder = this.orderRepository.createQueryBuilder('order');

    queryBuilder
      .where('order.status IN (:...statuses)', {
        statuses: [OrderStatus.finished, OrderStatus.canceled],
      })
      .select([
        'order.id',
        'order.orderNumber',
        'order.creationDate',
        'order.completionDate',
        'order.orderType',
        'order.status',
        'order.amountPaid',
        'order.comments',
        'order.totalCost',
        'order.scheduledDeliveryTime',
        'order.phoneNumber',
        'order.deliveryAddress',
        'order.customerName',
      ])
      .leftJoinAndSelect('order.area', 'area')
      .addSelect(['area.id', 'area.name'])
      .leftJoinAndSelect('order.table', 'table')
      .addSelect(['table.id', 'table.number', 'table.status'])
      .leftJoinAndSelect('order.orderItems', 'orderItem')
      .addSelect([
        'orderItem.id',
        'orderItem.status',
        'orderItem.price',
        'orderItem.comments',
      ])
      .leftJoinAndSelect('orderItem.productVariant', 'productVariant')
      .addSelect([
        'productVariant.id',
        'productVariant.name',
        'productVariant.price',
      ])
      .leftJoinAndSelect('orderItem.product', 'product')
      .addSelect(['product.id'])
      .leftJoinAndSelect('orderItem.selectedModifiers', 'selectedModifier')
      .addSelect(['selectedModifier.id'])
      .leftJoinAndSelect('selectedModifier.modifier', 'selectedModifierDetail')
      .addSelect([
        'selectedModifierDetail.id',
        'selectedModifierDetail.name',
        'selectedModifierDetail.price',
      ])
      .leftJoinAndSelect(
        'orderItem.selectedPizzaFlavors',
        'selectedPizzaFlavor',
      )
      .addSelect(['selectedPizzaFlavor.id'])
      .leftJoinAndSelect(
        'selectedPizzaFlavor.pizzaFlavor',
        'selectedPizzaFlavorDetail',
      )
      .addSelect([
        'selectedPizzaFlavorDetail.id',
        'selectedPizzaFlavorDetail.name',
        'selectedPizzaFlavorDetail.price',
      ])
      .leftJoinAndSelect(
        'orderItem.selectedPizzaIngredients',
        'selectedPizzaIngredient',
      )
      .addSelect(['selectedPizzaIngredient.id, selectedPizzaIngredient.half'])
      .leftJoinAndSelect(
        'selectedPizzaIngredient.pizzaIngredient',
        'selectedPizzaIngredientDetail',
      )
      .addSelect([
        'selectedPizzaIngredientDetail.id',
        'selectedPizzaIngredientDetail.name',
        'selectedPizzaIngredientDetail.price',
      ])
      .leftJoinAndSelect('order.orderAdjustments', 'orderAdjustment')
      .addSelect([
        'orderAdjustment.id',
        'orderAdjustment.name',
        'orderAdjustment.amount',
      ]);

    const orders = await queryBuilder.getMany();

    return orders;
  }

  async getOrderById(orderId: number): Promise<Order> {
    const queryBuilder = this.orderRepository.createQueryBuilder('order');

    queryBuilder
      .where('order.id = :orderId', { orderId })
      .select([
        'order.id',
        'order.orderNumber',
        'order.orderType',
        'order.status',
        'order.amountPaid',
        'order.comments',
        'order.totalCost',
        'order.scheduledDeliveryTime',
        'order.phoneNumber',
        'order.deliveryAddress',
        'order.customerName',
      ])
      .leftJoinAndSelect('order.area', 'area')
      .addSelect(['area.id', 'area.name'])
      .leftJoinAndSelect('order.table', 'table')
      .addSelect([
        'table.id',
        'table.number',
        'table.temporaryIdentifier',
        'table.status',
      ])
      .leftJoinAndSelect('order.orderItems', 'orderItem')
      .addSelect([
        'orderItem.id',
        'orderItem.status',
        'orderItem.price',
        'orderItem.comments',
      ])
      .leftJoinAndSelect('orderItem.productVariant', 'productVariant')
      .addSelect([
        'productVariant.id',
        'productVariant.name',
        'productVariant.price',
      ])
      .leftJoinAndSelect('orderItem.product', 'product')
      .addSelect(['product.id'])
      .leftJoinAndSelect('orderItem.selectedModifiers', 'selectedModifier')
      .addSelect(['selectedModifier.id'])
      .leftJoinAndSelect('selectedModifier.modifier', 'selectedModifierDetail')
      .addSelect([
        'selectedModifierDetail.id',
        'selectedModifierDetail.name',
        'selectedModifierDetail.price',
      ])
      .leftJoinAndSelect(
        'orderItem.selectedPizzaFlavors',
        'selectedPizzaFlavor',
      )
      .addSelect(['selectedPizzaFlavor.id'])
      .leftJoinAndSelect(
        'selectedPizzaFlavor.pizzaFlavor',
        'selectedPizzaFlavorDetail',
      )
      .addSelect([
        'selectedPizzaFlavorDetail.id',
        'selectedPizzaFlavorDetail.name',
        'selectedPizzaFlavorDetail.price',
      ])
      .leftJoinAndSelect(
        'orderItem.selectedPizzaIngredients',
        'selectedPizzaIngredient',
      )
      .addSelect(['selectedPizzaIngredient.id, selectedPizzaIngredient.half'])
      .leftJoinAndSelect(
        'selectedPizzaIngredient.pizzaIngredient',
        'selectedPizzaIngredientDetail',
      )
      .addSelect([
        'selectedPizzaIngredientDetail.id',
        'selectedPizzaIngredientDetail.name',
        'selectedPizzaIngredientDetail.price',
      ])
      .leftJoinAndSelect('order.orderAdjustments', 'orderAdjustment')
      .addSelect([
        'orderAdjustment.id',
        'orderAdjustment.name',
        'orderAdjustment.amount',
      ]);

    const result = await queryBuilder.getOne();

    if (!result) {
      throw new Error('Order not found');
    }
    return result;
  }

  async updateOrderPreparationStatus(newOrder: Order): Promise<Order> {
    let updatedOrderId: number;

    const completeOrder = await this.orderRepository.manager.transaction(
      async (transactionalEntityManager) => {
        const order = await transactionalEntityManager
          .createQueryBuilder(Order, 'order')
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

        // Variables para almacenar los estados de preparación originales
        const originalBarPreparationStatus = order.barPreparationStatus;
        const originalBurgerPreparationStatus = order.burgerPreparationStatus;
        const originalPizzaPreparationStatus = order.pizzaPreparationStatus;

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
        if (
          containsPizzaorEntradasItems &&
          containsBurgerOrSaladItems &&
          String(newOrder.pizzaPreparationStatus) !== 'null'
        ) {
          if (
            order.burgerPreparationStatus ===
              OrderPreparationStatus.not_required &&
            [
              OrderPreparationStatus.in_preparation,
              OrderPreparationStatus.prepared,
            ].includes(newOrder.pizzaPreparationStatus)
          ) {
            order.burgerPreparationStatus = OrderPreparationStatus.created; //habilito la preparacion de bar
            newOrder.burgerPreparationStatus = OrderPreparationStatus.created; //habilito la preparacion de bar
          }
        }

        // Actualiza solo los OrderItems que corresponden a la pantalla actualizada
        await Promise.all(
          order.orderItems.map(async (item) => {
            if (
              item.product.subcategory.category.name === 'Bebida' &&
              String(newOrder.barPreparationStatus) !== 'null'
            ) {
              // Si el estado original era "prepared" y el nuevo estado es "in_preparation", no actualiza el estado del orderItem
              if (
                originalBarPreparationStatus ===
                  OrderPreparationStatus.prepared &&
                newOrder.barPreparationStatus ===
                  OrderPreparationStatus.in_preparation
              ) {
                return item;
              }
              item.status = OrderItemStatus[order.barPreparationStatus];
            } else if (item.product.subcategory.category.name === 'Comida') {
              if (
                ['Pizzas', 'Entradas'].includes(
                  item.product.subcategory.name,
                ) &&
                String(newOrder.pizzaPreparationStatus) !== 'null'
              ) {
                // Si el estado original era "prepared" y el nuevo estado es "in_preparation", no actualiza el estado del orderItem
                if (
                  originalPizzaPreparationStatus ===
                    OrderPreparationStatus.prepared &&
                  newOrder.pizzaPreparationStatus ===
                    OrderPreparationStatus.in_preparation
                ) {
                  return item;
                }
                item.status = OrderItemStatus[order.pizzaPreparationStatus];
              } else if (
                ['Hamburguesas', 'Ensaladas'].includes(
                  item.product.subcategory.name,
                ) &&
                String(newOrder.burgerPreparationStatus) !== 'null'
              ) {
                // Si el estado original era "prepared" y el nuevo estado es "in_preparation", no actualiza el estado del orderItem
                if (
                  originalBurgerPreparationStatus ===
                    OrderPreparationStatus.prepared &&
                  newOrder.burgerPreparationStatus ===
                    OrderPreparationStatus.in_preparation
                ) {
                  return item;
                }
                item.status = OrderItemStatus[order.burgerPreparationStatus];
              }
            }
            await transactionalEntityManager.save(item);
            return item;
          }),
        );

        // Determina el estado general de la orden basado en los estados de preparación
        const preparationStatuses = [
          order.barPreparationStatus,
          order.burgerPreparationStatus,
          order.pizzaPreparationStatus,
        ];

        // Si todos los estados de preparación están en 'created' o 'not_required', entonces la orden está 'created'
        if (
          preparationStatuses.every(
            (status) =>
              status === OrderPreparationStatus.created ||
              status === OrderPreparationStatus.not_required,
          )
        ) {
          order.status = OrderStatus.created;
        } else if (
          // Si al menos uno de los estados de preparación está en 'in_preparation', entonces la orden está 'in_preparation'
          preparationStatuses.includes(OrderPreparationStatus.in_preparation) ||
          (preparationStatuses.includes(OrderPreparationStatus.prepared) &&
            preparationStatuses.includes(OrderPreparationStatus.created))
        ) {
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

        await transactionalEntityManager.save(order);
        updatedOrderId = order.id;
        return await transactionalEntityManager
          .createQueryBuilder(Order, 'order')
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
      },
    );

    // Asegúrate de que la transacción se haya completado antes de emitir el evento
    if (updatedOrderId) {
      this.appGateway.emitOrderStatusUpdated(completeOrder);
    }

    return completeOrder;
  }

  async updateOrderItemStatus(newOrderItem: OrderItem): Promise<OrderItem> {
    let updatedOrderItemId: number;
    let orderId: number;

    const orderItem = await this.orderItemRepository.manager.transaction(
      async (transactionalEntityManager) => {
        const orderItem = await transactionalEntityManager
          .createQueryBuilder(OrderItem, 'orderItem')
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
          .where('orderItem.id = :orderItemId', {
            orderItemId: newOrderItem.id,
          })
          .getOne();

        // Verifica el estado de la Order relacionada
        if (orderItem.order.status === OrderStatus.created) {
          // Si la Order está en estado 'created', no se permiten cambios de estado de OrderItems
          throw new Error(
            'No se permiten cambios de estado de OrderItems cuando la Order está en estado "created"',
          );
        } else if (orderItem.order.status === OrderStatus.in_preparation) {
          // Si la Order está en estado 'in_preparation', solo se permiten cambios de estado a 'prepared' y 'in_preparation'
          if (
            newOrderItem.status !== OrderItemStatus.prepared &&
            newOrderItem.status !== OrderItemStatus.in_preparation
          ) {
            throw new Error(
              'Solo se permiten cambios de estado de OrderItems a "prepared" y "in_preparation" cuando la Order está en estado "in_preparation"',
            );
          }
        } else if (orderItem.order.status === OrderStatus.prepared) {
          // Si la Order está en estado 'prepared', no se permiten cambios de estado de OrderItems
          throw new Error(
            'No se permiten cambios de estado de OrderItems cuando la Order está en estado "prepared"',
          );
        }

        // Actualiza el estado del OrderItem
        orderItem.status = newOrderItem.status;

        await transactionalEntityManager.save(orderItem);
        updatedOrderItemId = orderItem.id;
        orderId = orderItem.order.id;

        return orderItem;
      },
    );

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
      .where('order.id = :orderId', { orderId })
      .getOne();

    // Asegúrate de que la transacción se haya completado antes de emitir el evento
    if (updatedOrderItemId && completeOrder) {
      await this.appGateway.emitOrderItemStatusUpdated(
        completeOrder,
        updatedOrderItemId,
      );
    }

    return orderItem;
  }
  async findOrderItemsWithCounts(
    subcategories?: string[],
    ordersLimit?: number,
  ): Promise<any[]> {
    let recentOrderIds: number[] = [];
    if (ordersLimit) {
      const recentOrders = await this.orderRepository
        .createQueryBuilder('order')
        .where('order.status IN (:...orderStatuses)', {
          orderStatuses: ['created', 'in_preparation'],
        })
        .limit(ordersLimit)
        .getMany();

      recentOrderIds = recentOrders.map((order) => order.id);
    }

    const queryBuilder = this.orderItemRepository
      .createQueryBuilder('orderItem')
      .leftJoinAndSelect('orderItem.order', 'order')
      .leftJoinAndSelect('orderItem.product', 'product')
      .leftJoinAndSelect('product.subcategory', 'subcategory')
      .leftJoinAndSelect('orderItem.productVariant', 'productVariant')
      .where('orderItem.status IN (:...statuses)', {
        statuses: ['created', 'in_preparation'],
      })
      .andWhere('order.status IN (:...orderStatuses)', {
        orderStatuses: ['created', 'in_preparation'],
      });

    if (subcategories && subcategories.length > 0) {
      queryBuilder.andWhere('subcategory.name IN (:...subcategories)', {
        subcategories,
      });
    }

    if (ordersLimit) {
      queryBuilder.andWhere('order.id IN (:...recentOrderIds)', {
        recentOrderIds,
      });
    }

    const orderItems = await queryBuilder.getMany();

    const groupedBySubcategory = orderItems.reduce((acc, item) => {
      const subcategoryName = item.product.subcategory.name;
      if (!acc[subcategoryName]) {
        acc[subcategoryName] = [];
      }
      const productOrVariantName = item.productVariant
        ? item.productVariant.name
        : item.product.name;
      const existingProductOrVariant = acc[subcategoryName].find(
        (p) => p.name === productOrVariantName,
      );
      if (existingProductOrVariant) {
        existingProductOrVariant.count += 1;
      } else {
        acc[subcategoryName].push({ name: productOrVariantName, count: 1 });
      }
      return acc;
    }, {});

    const result = Object.entries(groupedBySubcategory).map(
      ([subcategoryName, products]) => ({
        subcategoryName,
        products,
      }),
    );

    return result;
  }

  async registerPayment(orderId: number, amount: number): Promise<Order> {
    return await this.orderRepository.manager.transaction(
      async (transactionalEntityManager) => {
        const order = await transactionalEntityManager.findOne(Order, {
          where: { id: orderId },
        });
        order.amountPaid = amount;
        await transactionalEntityManager.save(order);
        return order;
      },
    );
  }

  async completeOrder(orderId: number): Promise<Order> {
    const order = await this.orderRepository.manager.transaction(
      async (transactionalEntityManager) => {
        const order = await transactionalEntityManager.findOne(Order, {
          where: { id: orderId },
          relations: ['table'],
        });
        // if (order.status !== OrderStatus.prepared && order.status !== OrderStatus.in_delivery) {
        //   throw new Error('Order is not in a state that can be completed');
        // }
        if (order.table) {
          order.table.status = TableStatus.AVAILABLE; // Cambiar el estado a AVAILABLE
          await transactionalEntityManager.save(order.table);
        }
        // Verificar si el monto pagado es menor que el costo total
        if (order.amountPaid < order.totalCost) {
          order.amountPaid = order.totalCost;
        }
        order.status = OrderStatus.finished;
        order.completionDate = new Date(); // Establece la fecha de finalización al momento actual
        await transactionalEntityManager.save(order);
        return order;
      },
    );

    // Emitir a las pantallas después de actualizar el estado de la orden
    await this.appGateway.emitPendingOrderItemsToScreens();

    return order;
  }

  async recoverOrder(orderId: number): Promise<Order> {
    const order = await this.orderRepository.manager.transaction(
      async (transactionalEntityManager) => {
        const order = await transactionalEntityManager.findOne(Order, {
          where: { id: orderId },
        });

        if (!order) {
          throw new HttpException('Order not found', HttpStatus.NOT_FOUND);
        }

        // Determina el estado general de la orden basado en los estados de preparación
        const preparationStatuses = [
          order.barPreparationStatus,
          order.burgerPreparationStatus,
          order.pizzaPreparationStatus,
        ];

        if (
          preparationStatuses.every(
            (status) =>
              status === OrderPreparationStatus.created ||
              status === OrderPreparationStatus.not_required,
          )
        ) {
          order.status = OrderStatus.created;
        } else if (
          preparationStatuses.includes(OrderPreparationStatus.in_preparation)
        ) {
          order.status = OrderStatus.in_preparation;
        } else if (
          preparationStatuses.every(
            (status) =>
              status === OrderPreparationStatus.prepared ||
              status === OrderPreparationStatus.not_required,
          )
        ) {
          order.status = OrderStatus.prepared;
        }

        await transactionalEntityManager.save(order);
        return order;
      },
    );

    // Emitir a las pantallas después de actualizar el estado de la orden
    await this.appGateway.emitPendingOrderItemsToScreens();

    return order;
  }

  async completeMultipleOrders(orderIds: number[]): Promise<Order[]> {
    const completedOrders = await this.orderRepository.manager.transaction(
      async (transactionalEntityManager) => {
        const orders = await transactionalEntityManager.find(Order, {
          where: {
            id: In(orderIds),
          },
          relations: ['table'],
        });

        const completedOrders: Order[] = [];
        for (const order of orders) {
          if (order.table) {
            order.table.status = TableStatus.AVAILABLE; // Cambiar el estado a AVAILABLE
            await transactionalEntityManager.save(order.table);
          }
          if (order.amountPaid < order.totalCost) {
            order.amountPaid = order.totalCost;
          }

          order.status = OrderStatus.finished;
          order.completionDate = new Date();
          await transactionalEntityManager.save(order);
          completedOrders.push(order);
        }

        return completedOrders;
      },
    );

    // Emitir a las pantallas después de actualizar el estado de las órdenes
    await this.appGateway.emitPendingOrderItemsToScreens();
    return completedOrders;
  }

  async cancelOrder(orderId: number): Promise<Order> {
    const order = await this.orderRepository.manager.transaction(
      async (transactionalEntityManager) => {
        const order = await transactionalEntityManager.findOne(Order, {
          where: { id: orderId },
          relations: ['table'],
        });
        if (order.table) {
          order.table.status = TableStatus.AVAILABLE; // Cambiar el estado a AVAILABLE
          await transactionalEntityManager.save(order.table);
        }
        if (!order) {
          throw new HttpException('Order not found', HttpStatus.NOT_FOUND);
        }
        order.status = OrderStatus.canceled;
        order.completionDate = new Date(); // Establece la fecha de finalización al momento actual
        await transactionalEntityManager.save(order);
        return order;
      },
    );

    // Emitir a las pantallas después de actualizar el estado de la orden
    await this.appGateway.emitPendingOrderItemsToScreens();

    return order;
  }

  async getDeliveryOrders(): Promise<Order[]> {
    const queryBuilder = this.orderRepository.createQueryBuilder('order');

    queryBuilder
      .where('order.orderType IN (:...orderTypes)', {
        orderTypes: [OrderType.delivery, OrderType.pickup],
      })
      .andWhere('order.status IN (:...statuses)', {
        statuses: [
          OrderStatus.created,
          OrderStatus.in_preparation,
          OrderStatus.prepared,
          OrderStatus.in_delivery,
        ],
      })
      .select([
        'order.id',
        'order.orderNumber',
        'order.orderType',
        'order.status',
        'order.amountPaid',
        'order.comments',
        'order.totalCost',
        'order.scheduledDeliveryTime',
        'order.phoneNumber',
        'order.deliveryAddress',
        'order.customerName',
        'order.creationDate',
      ])
      .leftJoinAndSelect('order.orderPrints', 'orderPrint')
      .addSelect([
        'orderPrint.id',
        'orderPrint.printTime',
        'orderPrint.printedBy',
      ])
      .leftJoinAndSelect('order.orderItems', 'orderItem')
      .addSelect([
        'orderItem.id',
        'orderItem.status',
        'orderItem.price',
        'orderItem.comments',
      ])
      .leftJoinAndSelect('orderItem.productVariant', 'productVariant')
      .addSelect([
        'productVariant.id',
        'productVariant.name',
        'productVariant.price',
      ])
      .leftJoinAndSelect('orderItem.product', 'product')
      .addSelect(['product.id', 'product.name', 'product.subcategory'])
      .leftJoinAndSelect('product.subcategory', 'subcategory')
      .addSelect(['subcategory.id', 'subcategory.category'])
      .leftJoinAndSelect('subcategory.category', 'category')
      .addSelect(['category.id', 'category.name'])
      .leftJoinAndSelect('orderItem.selectedModifiers', 'selectedModifier')
      .addSelect(['selectedModifier.id'])
      .leftJoinAndSelect('selectedModifier.modifier', 'selectedModifierDetail')
      .addSelect([
        'selectedModifierDetail.id',
        'selectedModifierDetail.name',
        'selectedModifierDetail.price',
      ])
      .leftJoinAndSelect(
        'orderItem.selectedPizzaFlavors',
        'selectedPizzaFlavor',
      )
      .addSelect(['selectedPizzaFlavor.id'])
      .leftJoinAndSelect(
        'selectedPizzaFlavor.pizzaFlavor',
        'selectedPizzaFlavorDetail',
      )
      .addSelect([
        'selectedPizzaFlavorDetail.id',
        'selectedPizzaFlavorDetail.name',
        'selectedPizzaFlavorDetail.price',
      ])
      .leftJoinAndSelect(
        'orderItem.selectedPizzaIngredients',
        'selectedPizzaIngredient',
      )
      .addSelect(['selectedPizzaIngredient.id, selectedPizzaIngredient.half'])
      .leftJoinAndSelect(
        'selectedPizzaIngredient.pizzaIngredient',
        'selectedPizzaIngredientDetail',
      )
      .addSelect([
        'selectedPizzaIngredientDetail.id',
        'selectedPizzaIngredientDetail.name',
        'selectedPizzaIngredientDetail.price',
      ])
      .leftJoinAndSelect('order.orderAdjustments', 'orderAdjustment')
      .addSelect([
        'orderAdjustment.id',
        'orderAdjustment.name',
        'orderAdjustment.amount',
      ]);

    return await queryBuilder.getMany();
  }

  async markOrdersAsInDelivery(orders: Order[]): Promise<void> {
    await this.orderRepository.manager.transaction(
      async (transactionalEntityManager) => {
        for (const orderData of orders) {
          // Recupera la instancia de la entidad Order antes de modificarla
          const order = await transactionalEntityManager.findOne(Order, {
            where: { id: orderData.id },
          });
          if (order) {
            order.status = OrderStatus.in_delivery;
            await transactionalEntityManager.save(order);
          } else {
            console.error(`Orden no encontrada con ID: ${orderData.id}`);
          }
        }
      },
    );

    // Emitir a las pantallas después de actualizar el estado de las ordenes
    await this.appGateway.emitPendingOrderItemsToScreens();
  }

  private async getNextOrderNumber(date: Date): Promise<number> {
    return await this.orderCounterRepository.manager.transaction(
      async (transactionalEntityManager) => {
        const orderCounter = await transactionalEntityManager.findOne(
          OrderCounter,
          {
            where: { date },
          },
        );

        if (orderCounter) {
          orderCounter.counter++;
          await transactionalEntityManager.save(orderCounter);
          return orderCounter.counter;
        } else {
          const newOrderCounter = transactionalEntityManager.create(
            OrderCounter,
            {
              date,
              counter: 1,
            },
          );
          await transactionalEntityManager.save(newOrderCounter);
          return 1;
        }
      },
    );
  }

  async getDeliveryPreparedOrders(): Promise<
    { id: number; orderType: string; totalCost: number }[]
  > {
    const orders = await this.orderRepository.find({
      where: {
        status: OrderStatus.prepared,
        orderType: OrderType.delivery,
      },
      select: ['id', 'orderType', 'totalCost'],
    });

    return orders.map(({ id, orderType, totalCost }) => ({
      id,
      orderType,
      totalCost,
    }));
  }

  async markOrderAsInDelivery(orderId: number): Promise<Order> {
    return await this.orderRepository.manager.transaction(
      async (transactionalEntityManager) => {
        const order = await transactionalEntityManager.findOne(Order, {
          where: {
            id: orderId,
            status: OrderStatus.prepared,
            orderType: OrderType.delivery,
          },
        });

        if (!order) {
          throw new HttpException(
            'Order not found or not in prepared state or not a delivery order',
            HttpStatus.NOT_FOUND,
          );
        }

        order.status = OrderStatus.in_delivery;
        await transactionalEntityManager.save(order);

        return order;
      },
    );
  }

  async registerPrint(orderId: number, printedBy: string): Promise<OrderPrint> {
    return await this.orderRepository.manager.transaction(
      async (transactionalEntityManager) => {
        const order = await transactionalEntityManager.findOne(Order, {
          where: { id: orderId },
        });
        if (!order) {
          throw new HttpException('Order not found', HttpStatus.NOT_FOUND);
        }

        const orderPrint = new OrderPrint();
        orderPrint.order = order;
        orderPrint.printedBy = printedBy;
        orderPrint.printTime = new Date(); // Captura el momento exacto de la impresión

        await transactionalEntityManager.save(orderPrint);
        return orderPrint;
      },
    );
  }
  async getOrdersWithPrints(): Promise<Order[]> {
    const orders = await this.orderRepository
      .createQueryBuilder('order')
      .innerJoinAndSelect('order.orderPrints', 'orderPrint')
      .leftJoinAndSelect('order.area', 'area')
      .leftJoinAndSelect('order.table', 'table')
      .where('order.status IN (:...statuses)', {
        statuses: [
          OrderStatus.created,
          OrderStatus.in_preparation,
          OrderStatus.prepared,
        ],
      })
      .andWhere('order.orderType = :orderType', { orderType: OrderType.dineIn })
      .orderBy('order.creationDate', 'DESC')
      .getMany();

    return orders;
  }

  async getSalesReport(): Promise<{
    totalSales: number;
    totalAmountPaid: number;
    subcategories: {
      subcategoryName: string;
      totalSales: number;
      products: { name: string; quantity: number; totalSales: number }[];
    }[];
  }> {
    const finishedOrders = await this.orderRepository.find({
      where: {
        status: OrderStatus.finished,
      },
      relations: [
        'orderItems',
        'orderItems.product',
        'orderItems.product.subcategory',
        'orderItems.productVariant',
      ],
    });

    let totalSales = 0;
    let totalAmountPaid = 0;

    const subcategories: {
      subcategoryName: string;
      totalSales: number;
      products: { name: string; quantity: number; totalSales: number }[];
    }[] = [];

    for (const order of finishedOrders) {
      totalAmountPaid += parseFloat(order.amountPaid.toString());

      for (const orderItem of order.orderItems) {
        const productName = orderItem.productVariant
          ? `${orderItem.product.name} - ${orderItem.productVariant.name}`
          : orderItem.product.name;
        const subcategoryName = orderItem.product.subcategory.name;
        const itemPrice = parseFloat(orderItem.price.toString()); // Convertir a número

        const subcategoryIndex = subcategories.findIndex(
          (item) => item.subcategoryName === subcategoryName,
        );
        if (subcategoryIndex === -1) {
          subcategories.push({
            subcategoryName,
            totalSales: itemPrice, // Usar el valor numérico
            products: [
              {
                name: productName,
                quantity: 1,
                totalSales: itemPrice, // Usar el valor numérico
              },
            ],
          });
        } else {
          const productIndex = subcategories[
            subcategoryIndex
          ].products.findIndex((product) => product.name === productName);
          if (productIndex === -1) {
            subcategories[subcategoryIndex].products.push({
              name: productName,
              quantity: 1,
              totalSales: itemPrice, // Usar el valor numérico
            });
            subcategories[subcategoryIndex].totalSales += itemPrice; // Sumar el valor numérico
          } else {
            subcategories[subcategoryIndex].products[productIndex].quantity +=
              1;
            subcategories[subcategoryIndex].products[productIndex].totalSales +=
              itemPrice; // Sumar el valor numérico
            subcategories[subcategoryIndex].totalSales += itemPrice; // Sumar el valor numérico
          }
        }

        totalSales += itemPrice; // Sumar el valor numérico
      }
    }

    return {
      totalSales,
      totalAmountPaid,
      subcategories,
    };
  }

  async revertMultipleOrdersToPrepared(orderIds: number[]): Promise<Order[]> {
    return await this.orderRepository.manager.transaction(
      async (transactionalEntityManager) => {
        const orders = await transactionalEntityManager
          .createQueryBuilder(Order, 'order')
          .where('order.id IN (:...orderIds)', { orderIds })
          .getMany();

        if (orders.length !== orderIds.length) {
          throw new HttpException(
            'Some orders not found or not in delivery state',
            HttpStatus.NOT_FOUND,
          );
        }

        orders.forEach((order) => {
          order.status = OrderStatus.prepared;
        });

        await transactionalEntityManager.save(orders);
        return orders;
      },
    );
  }

  async resetDatabase(): Promise<void> {
    try {
      // Cierra la conexión actual para evitar conflictos durante el reinicio
      await this.dataSource.destroy();

      // Reestablece la base de datos
      await this.dataSource.initialize();
      await this.dataSource.dropDatabase();
      await this.dataSource.synchronize(true); // El 'true' es para correr los seeders si tienes configurado así

      // Ejecuta los seeders directamente
      await seedRoles(this.dataSource);
      await seedUsers(this.dataSource);
      await seedTables(this.dataSource);
      await seedProducts(this.dataSource);

      console.log('Seeders ejecutados correctamente.');

      // Opcional: Reiniciar el servidor, esto depende de tu entorno específico
      // Esto podría implicar llamar a un script externo o usar un módulo de Node.js para reiniciar el proceso
    } catch (error) {
      throw new Error(
        'Error al resetear la base de datos y ejecutar seeders: ' +
          error.message,
      );
    }
  }

  async updateOrderItemPreparationAdvanceStatus(
    orderItemId: number,
    orderId: number,
    isBeingPreparedInAdvance: boolean,
  ): Promise<OrderItem> {
    const orderItem = await this.orderItemRepository.findOne({
      where: { id: orderItemId, order: { id: orderId } },
      relations: ['order'],
    });

    if (!orderItem) {
      throw new Error('Order item not found');
    }

    orderItem.isBeingPreparedInAdvance = isBeingPreparedInAdvance;
    const savedOrderItem = await this.orderItemRepository.save(orderItem);

    // Emitir a la pantalla de pizza después de actualizar el estado de preparación anticipada
    await this.appGateway.emitOrderItemPreparationAdvanceStatusUpdated(
      orderItem.order,
      orderItemId,
      isBeingPreparedInAdvance,
    );

    return savedOrderItem;
  }

  @Interval(30000) // Ejecutar cada 30 segundos
  async syncOrders() {
    try {
      const response = await axios.get(this.syncOrdersUrl);
      const newOrders = response.data;
      console.log('newOrders', JSON.stringify(newOrders));

      for (const newOrder of newOrders) {
        await this.syncOrder(newOrder);
      }
    } catch (error) {
      console.error('Error syncing orders:', error);
    }
  }

  private async syncOrder(newOrder: any) {
    const createOrderDto: CreateOrderDto = {
      orderType: newOrder.orderType,
      comments:
        newOrder.orderType === OrderType.delivery
          ? newOrder.orderDeliveryInfo?.additionalDetails
          : undefined,
      status: undefined, // No se llena según las instrucciones
      createdAt: new Date(newOrder.createdAt),
      deliveryAddress:
        newOrder.orderType === OrderType.delivery
          ? newOrder.orderDeliveryInfo?.streetAddress
          : undefined,
      scheduledDeliveryTime: newOrder.scheduledDeliveryTime
        ? new Date(newOrder.scheduledDeliveryTime)
        : undefined,
      phoneNumber: newOrder.clientId,
      customerName:
        newOrder.orderType === OrderType.pickup
          ? newOrder.orderDeliveryInfo?.pickupName
          : undefined,
      createdBy: 'Whatsapp',
      totalCost: newOrder.totalCost,
      orderAdjustments: [], // No hay ajustes según las instrucciones
      area: undefined, // No se llena según las instrucciones
      table: undefined, // No se llena según las instrucciones
      orderItems: newOrder.orderItems.flatMap((item) => {
        const baseItem = {
          product: { id: item.productId },
          productVariant: item.productVariantId
            ? { id: item.productVariantId }
            : undefined,
          price: item.price,
          comments: item.comments,
          selectedModifiers: item.selectedModifiers.map((modifier) => ({
            modifier: { id: modifier.id },
          })),
          selectedPizzaFlavors: [],
          selectedPizzaIngredients: item.selectedPizzaIngredients.map(
            (ingredient) => ({
              pizzaIngredient: { id: ingredient.pizzaIngredientId },
              half: ingredient.half,
              //action: ingredient.action,
            }),
          ),
        };

        // Crear un array con 'quantity' número de copias del item
        return Array(item.quantity).fill(baseItem);
      }),
    };

    try {
      const createdOrder = await this.createOrder(createOrderDto);
      console.log(`Order synced successfully: ${createdOrder.id}`);
      // Aquí podrías actualizar el estado de sincronización en el servidor remoto si es necesario
    } catch (error) {
      console.error(`Error syncing order: ${newOrder.id}`, error);
    }
  }
}
