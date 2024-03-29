import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { OrderItem, OrderItemStatus } from './order-item.entity';
import { SelectedModifier } from 'src/selected_modifiers/selected-modifier.entity';
import { SelectedProductObservation } from 'src/selected_product_observations/selected-product-observation.entity';
import { Modifier } from 'src/modifiers/modifier.entity';
import { ProductObservation } from 'src/product_observations/product-observation.entity';
import { CreateOrderItemDto } from './dto/create-order-item.dto';
import { Order } from 'src/orders/order.entity';
import { Product } from 'src/products/product.entity';
import { ProductVariant } from 'src/product_variants/product-variant.entity';
import { PizzaFlavor } from 'src/pizza_flavors/pizza-flavor.entity';
import { PizzaIngredient } from 'src/pizza_ingredients/pizza-ingredient.entity';
import { SelectedPizzaFlavor } from 'src/selected_pizza_flavors/selected-pizza-flavor.entity';
import { SelectedPizzaIngredient } from 'src/selected_pizza_ingredients/selected-pizza-ingredient.entity';
import { AppGateway } from '../app.gateway'; // Import AppGateway
import { UpdateOrderItemDto } from './dto/update-order-item.dto';

@Injectable()
export class OrderItemsService {
  constructor(
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(SelectedModifier)
    private readonly selectedModifierRepository: Repository<SelectedModifier>,
    @InjectRepository(SelectedProductObservation)
    private readonly selectedProductObservationRepository: Repository<SelectedProductObservation>,
    @InjectRepository(Modifier)
    private readonly modifierRepository: Repository<Modifier>,
    @InjectRepository(ProductObservation)
    private readonly productObservationRepository: Repository<ProductObservation>,
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

  async create(createOrderItemDto: CreateOrderItemDto, transactionalEntityManager?: EntityManager): Promise<OrderItem> {
    const entityManager = transactionalEntityManager ? transactionalEntityManager : this.orderItemRepository.manager;

    const order = await entityManager.findOne(Order, {
      where: { id: createOrderItemDto.order.id },
    });
    const product = await entityManager.findOne(Product, {
      where: { id: createOrderItemDto.product.id },
    });
    const productVariant = createOrderItemDto.productVariant
      ? await entityManager.findOne(ProductVariant, {
          where: { id: createOrderItemDto.productVariant.id },
        })
      : null;

    const orderItem = entityManager.create(OrderItem, {
      order: order,
      product: product,
      productVariant: productVariant,
      comments: createOrderItemDto.comments,
      price: createOrderItemDto.price,
    });

    const savedOrderItem = await entityManager.save(orderItem);

    // Procesar selectedModifiers
    if (createOrderItemDto.selectedModifiers?.length) {
      for (const modifierDto of createOrderItemDto.selectedModifiers) {
        const modifier = await entityManager.findOne(Modifier, {
          where: { id: modifierDto.modifier.id },
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

    // Procesar selectedProductObservations
    if (createOrderItemDto.selectedProductObservations?.length) {
      for (const observationDto of createOrderItemDto.selectedProductObservations) {
        const productObservation =
          await entityManager.findOne(ProductObservation, {
            where: { id: observationDto.productObservation.id },
          });
        if (productObservation) {
          const selectedProductObservation =
            entityManager.create(SelectedProductObservation, {
              orderItem: savedOrderItem,
              productObservation: productObservation,
            });
          await entityManager.save(selectedProductObservation);
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
          const selectedPizzaFlavor = entityManager.create(SelectedPizzaFlavor, {
            orderItem: savedOrderItem,
            pizzaFlavor: pizzaFlavor,
          });
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
          const selectedPizzaIngredient =
            entityManager.create(SelectedPizzaIngredient, {
              orderItem: savedOrderItem,
              pizzaIngredient: pizzaIngredient,
            });
          await entityManager.save(selectedPizzaIngredient);
        }
      }
    }

    return entityManager.findOne(OrderItem, {
      where: { id: savedOrderItem.id },
      relations: [
        'order',
        'selectedModifiers',
        'selectedProductObservations',
        'selectedPizzaFlavors',
        'selectedPizzaIngredients',
        'product',
        'product.subcategory',
        'product.subcategory.category',
        'product.productVariants',
        'product.modifierTypes',
        'product.productObservationTypes',
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
    const entityManager = transactionalEntityManager ? transactionalEntityManager : this.orderItemRepository.manager;

    const orderItem = await entityManager.findOne(OrderItem, {
      where: { id: orderItemId },
      relations: [
        'selectedModifiers',
        'selectedProductObservations',
        'selectedPizzaFlavors',
        'selectedPizzaIngredients',
      ],
    });

    if (orderItem.status === OrderItemStatus.prepared) {
      throw new Error('No se permiten actualizaciones a un OrderItem con estado "prepared"');
    }

    orderItem.productVariant =
      updateOrderItemDto.productVariant ?? orderItem.productVariant;
    orderItem.comments = updateOrderItemDto.comments ?? orderItem.comments;
    orderItem.price = updateOrderItemDto.price ?? orderItem.price;

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

    // Actualizar selectedProductObservations
    await entityManager.delete(SelectedProductObservation, {
      orderItem: { id: orderItemId },
    });
    if (updateOrderItemDto.selectedProductObservations?.length) {
      for (const observationDto of updateOrderItemDto.selectedProductObservations) {
        const productObservation =
          await entityManager.findOne(ProductObservation, {
            where: { id: observationDto.productObservation.id },
          });
        if (productObservation) {
          const selectedProductObservation =
            entityManager.create(SelectedProductObservation, {
              orderItem: orderItem,
              productObservation: productObservation,
            });
          await entityManager.save(selectedProductObservation);
        }
      }
    }
    // Actualizar selectedPizzaFlavors
    await entityManager.delete(SelectedPizzaFlavor, {
      orderItem: { id: orderItemId },
    });
    if (updateOrderItemDto.selectedPizzaFlavors?.length) {
      console.log('updateOrderItemDto.selectedPizzaFlavors', updateOrderItemDto.selectedPizzaFlavors);
      for (const flavorDto of updateOrderItemDto.selectedPizzaFlavors) {
        const pizzaFlavor = await entityManager.findOne(PizzaFlavor, {
          where: { id: flavorDto.pizzaFlavor.id },
        });
        if (pizzaFlavor) {
          const selectedPizzaFlavor = entityManager.create(SelectedPizzaFlavor, {
            orderItem: orderItem,
            pizzaFlavor: pizzaFlavor,
          });
          const savedSelectedPizzaFlavor = await entityManager.save(selectedPizzaFlavor);
          console.log('selectedPizzaFlavor guardado:', savedSelectedPizzaFlavor);
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
          const selectedPizzaIngredient =
            entityManager.create(SelectedPizzaIngredient, {
              orderItem: orderItem,
              pizzaIngredient: pizzaIngredient,
              half: ingredientDto.half,
            });
          await entityManager.save(selectedPizzaIngredient);
        }
      }
    }

    return entityManager.findOne(OrderItem, {
      where: { id: orderItemId },
      relations: [
        'selectedModifiers',
        'selectedModifiers.modifier',
        'selectedProductObservations',
        'selectedProductObservations.productObservation',
        'selectedPizzaFlavors',
        'selectedPizzaFlavors.pizzaFlavor',
        'selectedPizzaIngredients',
        'selectedPizzaIngredients.pizzaIngredient',
        'product',
        'product.subcategory',
        'product.subcategory.category',
        'product.productVariants',
        'product.modifierTypes',
        'product.productObservationTypes',
        'product.pizzaFlavors',
        'product.pizzaIngredients',
      ],
    });
  }
}
