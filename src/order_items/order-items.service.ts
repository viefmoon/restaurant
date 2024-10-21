import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { OrderItem, OrderItemStatus } from './order-item.entity';
import { SelectedModifier } from 'src/selected_modifiers/selected-modifier.entity';
import { Modifier } from 'src/modifiers/modifier.entity';
import { CreateOrderItemDto } from './dto/create-order-item.dto';
import { Order } from 'src/orders/order.entity';
import { Product } from 'src/products/product.entity';
import { ProductVariant } from 'src/product_variants/product-variant.entity';
import { PizzaFlavor } from 'src/pizza_flavors/pizza-flavor.entity';
import { PizzaIngredient } from 'src/pizza_ingredients/pizza-ingredient.entity';
import { SelectedPizzaFlavor } from 'src/selected_pizza_flavors/selected-pizza-flavor.entity';
import { SelectedPizzaIngredient } from 'src/selected_pizza_ingredients/selected-pizza-ingredient.entity';
import { AppGateway } from '../app.gateway';
import { UpdateOrderItemDto } from './dto/update-order-item.dto';

@Injectable()
export class OrderItemsService {
  constructor(
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(SelectedModifier)
    private readonly selectedModifierRepository: Repository<SelectedModifier>,
    @InjectRepository(Modifier)
    private readonly modifierRepository: Repository<Modifier>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductVariant)
    private readonly productVariantRepository: Repository<ProductVariant>,
    @InjectRepository(PizzaFlavor)
    private readonly pizzaFlavorRepository: Repository<PizzaFlavor>,
    @InjectRepository(PizzaIngredient)
    private readonly pizzaIngredientRepository: Repository<PizzaIngredient>,
    @InjectRepository(SelectedPizzaFlavor)
    private readonly selectedPizzaFlavorRepository: Repository<SelectedPizzaFlavor>,
    @InjectRepository(SelectedPizzaIngredient)
    private readonly selectedPizzaIngredientRepository: Repository<SelectedPizzaIngredient>,
    private appGateway: AppGateway, // Inject AppGateway
  ) {}

  async create(
    createOrderItemDto: CreateOrderItemDto,
    transactionalEntityManager?: EntityManager,
  ): Promise<OrderItem> {
    const entityManager = transactionalEntityManager
      ? transactionalEntityManager
      : this.orderItemRepository.manager;

    const order = await entityManager.findOne(Order, {
      where: { id: createOrderItemDto.order.id },
    });
    const product = await entityManager.findOne(Product, {
      where: { id: createOrderItemDto.product.id },
      relations: ['subcategory'],
    });
    const productVariant = createOrderItemDto.productVariant
      ? await entityManager.findOne(ProductVariant, {
          where: { id: createOrderItemDto.productVariant.id },
        })
      : null;

    // Determinar si el item puede ser preparado con anticipación
    let canBePreparedInAdvance = false;
    if (product.subcategory.name === 'Entradas') {
      canBePreparedInAdvance = true;
    } else if (
      productVariant &&
      ['Pizza Mediana C/R', 'Pizza Chica C/R', 'Pizza Grande C/R'].includes(
        productVariant.name,
      )
    ) {
      canBePreparedInAdvance = true;
    }

    const orderItem = entityManager.create(OrderItem, {
      order: order,
      product: product,
      productVariant: productVariant,
      comments: createOrderItemDto.comments,
      price: createOrderItemDto.price,
      canBePreparedInAdvance: canBePreparedInAdvance,
    });

    const savedOrderItem = await entityManager.save(orderItem);

    // Procesar selectedModifiers
    if (createOrderItemDto.selectedModifiers?.length) {
      for (const modifierDto of createOrderItemDto.selectedModifiers) {
        const modifier = await entityManager.findOne(Modifier, {
          where: { id: modifierDto.modifier.id.toString() },
        });
        if (modifier) {
          const selectedModifier = entityManager.create(SelectedModifier, {
            orderItem: savedOrderItem,
            modifier: modifier,
          });
          await entityManager.save(selectedModifier);
        }
      }
    }

    // Procesar selectedPizzaFlavors
    if (createOrderItemDto.selectedPizzaFlavors?.length) {
      for (const flavorDto of createOrderItemDto.selectedPizzaFlavors) {
        const pizzaFlavor = await entityManager.findOne(PizzaFlavor, {
          where: { id: flavorDto.pizzaFlavor.id },
        });
        if (pizzaFlavor) {
          const selectedPizzaFlavor = entityManager.create(
            SelectedPizzaFlavor,
            {
              orderItem: savedOrderItem,
              pizzaFlavor: pizzaFlavor,
            },
          );
          await entityManager.save(selectedPizzaFlavor);
        }
      }
    }

    // Procesar selectedPizzaIngredients
    if (createOrderItemDto.selectedPizzaIngredients?.length) {
      for (const ingredientDto of createOrderItemDto.selectedPizzaIngredients) {
        const pizzaIngredient = await entityManager.findOne(PizzaIngredient, {
          where: { id: ingredientDto.pizzaIngredient.id },
        });
        if (pizzaIngredient) {
          const selectedPizzaIngredient = entityManager.create(
            SelectedPizzaIngredient,
            {
              orderItem: savedOrderItem,
              pizzaIngredient: pizzaIngredient,
              half: ingredientDto.half,
            },
          );
          await entityManager.save(selectedPizzaIngredient);
        }
      }
    }
    return entityManager.findOne(OrderItem, {
      where: { id: savedOrderItem.id },
      relations: [
        'order',
        'selectedModifiers',
        'selectedPizzaFlavors',
        'selectedPizzaIngredients',
        'product',
        'product.subcategory',
        'product.subcategory.category',
        'product.productVariants',
        'product.modifierTypes',
        'product.pizzaFlavors',
        'product.pizzaIngredients',
      ],
    });
  }

  async update(
    orderItemId: number,
    updateOrderItemDto: UpdateOrderItemDto,
    transactionalEntityManager?: EntityManager,
  ): Promise<OrderItem> {
    const entityManager = transactionalEntityManager
      ? transactionalEntityManager
      : this.orderItemRepository.manager;

    const orderItem = await entityManager.findOne(OrderItem, {
      where: { id: orderItemId },
      relations: [
        'selectedModifiers',
        'selectedPizzaFlavors',
        'selectedPizzaIngredients',
        'product',
        'product.subcategory',
      ],
    });

    if (orderItem.status === OrderItemStatus.prepared) {
      throw new Error(
        'No se permiten actualizaciones a un OrderItem con estado "prepared"',
      );
    }

    const productVariant = updateOrderItemDto.productVariant
      ? await entityManager.findOne(ProductVariant, {
          where: { id: updateOrderItemDto.productVariant.id },
        })
      : orderItem.productVariant;

    // Determinar si el item puede ser preparado con anticipación
    let canBePreparedInAdvance = false;
    if (orderItem.product.subcategory.name === 'Entradas') {
      canBePreparedInAdvance = true;
    } else if (
      productVariant &&
      ['Pizza Mediana C/R', 'Pizza Chica C/R', 'Pizza Grande C/R'].includes(
        productVariant.name,
      )
    ) {
      canBePreparedInAdvance = true;
    }

    orderItem.productVariant = productVariant;
    orderItem.comments = updateOrderItemDto.comments ?? orderItem.comments;
    orderItem.price = updateOrderItemDto.price ?? orderItem.price;
    orderItem.canBePreparedInAdvance = canBePreparedInAdvance;

    await entityManager.save(orderItem);

    // Actualizar selectedModifiers
    await entityManager.delete(SelectedModifier, {
      orderItem: { id: orderItemId },
    });
    if (updateOrderItemDto.selectedModifiers?.length) {
      for (const modifierDto of updateOrderItemDto.selectedModifiers) {
        const modifier = await entityManager.findOne(Modifier, {
          where: { id: modifierDto.modifier.id },
        });
        if (modifier) {
          const selectedModifier = entityManager.create(SelectedModifier, {
            orderItem: orderItem,
            modifier: modifier,
          });
          await entityManager.save(selectedModifier);
        }
      }
    }

    // Actualizar selectedPizzaFlavors
    await entityManager.delete(SelectedPizzaFlavor, {
      orderItem: { id: orderItemId },
    });
    if (updateOrderItemDto.selectedPizzaFlavors?.length) {
      for (const flavorDto of updateOrderItemDto.selectedPizzaFlavors) {
        const pizzaFlavor = await entityManager.findOne(PizzaFlavor, {
          where: { id: flavorDto.pizzaFlavor.id },
        });
        if (pizzaFlavor) {
          const selectedPizzaFlavor = entityManager.create(
            SelectedPizzaFlavor,
            {
              orderItem: orderItem,
              pizzaFlavor: pizzaFlavor,
            },
          );
          await entityManager.save(selectedPizzaFlavor);
        }
      }
    }

    // Actualizar selectedPizzaIngredients
    await entityManager.delete(SelectedPizzaIngredient, {
      orderItem: { id: orderItemId },
    });
    if (updateOrderItemDto.selectedPizzaIngredients?.length) {
      for (const ingredientDto of updateOrderItemDto.selectedPizzaIngredients) {
        const pizzaIngredient = await entityManager.findOne(PizzaIngredient, {
          where: { id: ingredientDto.pizzaIngredient.id },
        });
        if (pizzaIngredient) {
          const selectedPizzaIngredient = entityManager.create(
            SelectedPizzaIngredient,
            {
              orderItem: orderItem,
              pizzaIngredient: pizzaIngredient,
              half: ingredientDto.half,
            },
          );
          await entityManager.save(selectedPizzaIngredient);
        }
      }
    }

    return entityManager.findOne(OrderItem, {
      where: { id: orderItemId },
      relations: [
        'selectedModifiers',
        'selectedModifiers.modifier',
        'selectedPizzaFlavors',
        'selectedPizzaFlavors.pizzaFlavor',
        'selectedPizzaIngredients',
        'selectedPizzaIngredients.pizzaIngredient',
        'product',
        'product.subcategory',
        'product.subcategory.category',
        'product.productVariants',
        'product.modifierTypes',
        'product.pizzaFlavors',
        'product.pizzaIngredients',
      ],
    });
  }
}
