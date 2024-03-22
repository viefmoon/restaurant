import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

  async create(createOrderItemDto: CreateOrderItemDto): Promise<OrderItem> {
    const order = await this.orderRepository.findOne({
      where: { id: createOrderItemDto.order.id },
    });
    const product = await this.productRepository.findOne({
      where: { id: createOrderItemDto.product.id },
    });
    const productVariant = createOrderItemDto.productVariant
      ? await this.productVariantRepository.findOne({
          where: { id: createOrderItemDto.productVariant.id },
        })
      : null;

    const orderItem = this.orderItemRepository.create({
      order: order,
      product: product,
      productVariant: productVariant,
      comments: createOrderItemDto.comments,
      price: createOrderItemDto.price,
    });

    const savedOrderItem = await this.orderItemRepository.save(orderItem);

    // Procesar selectedModifiers
    if (createOrderItemDto.selectedModifiers?.length) {
      for (const modifierDto of createOrderItemDto.selectedModifiers) {
        const modifier = await this.modifierRepository.findOne({
          where: { id: modifierDto.modifier.id },
        });
        if (modifier) {
          const selectedModifier = this.selectedModifierRepository.create({
            orderItem: savedOrderItem,
            modifier: modifier,
          });
          await this.selectedModifierRepository.save(selectedModifier);
        }
      }
    }

    // Procesar selectedProductObservations
    if (createOrderItemDto.selectedProductObservations?.length) {
      for (const observationDto of createOrderItemDto.selectedProductObservations) {
        const productObservation =
          await this.productObservationRepository.findOne({
            where: { id: observationDto.productObservation.id },
          });
        if (productObservation) {
          const selectedProductObservation =
            this.selectedProductObservationRepository.create({
              orderItem: savedOrderItem,
              productObservation: productObservation,
            });
          await this.selectedProductObservationRepository.save(
            selectedProductObservation,
          );
        }
      }
    }

    // Procesar selectedPizzaFlavors
    if (createOrderItemDto.selectedPizzaFlavors?.length) {
      for (const flavorDto of createOrderItemDto.selectedPizzaFlavors) {
        const pizzaFlavor = await this.pizzaFlavorRepository.findOne({
          where: { id: flavorDto.pizzaFlavor.id },
        });
        if (pizzaFlavor) {
          const selectedPizzaFlavor = this.selectedPizzaFlavorRepository.create(
            {
              orderItem: savedOrderItem,
              pizzaFlavor: pizzaFlavor,
            },
          );
          await this.selectedPizzaFlavorRepository.save(selectedPizzaFlavor);
        }
      }
    }

    // Procesar selectedPizzaIngredients
    if (createOrderItemDto.selectedPizzaIngredients?.length) {
      for (const ingredientDto of createOrderItemDto.selectedPizzaIngredients) {
        const pizzaIngredient = await this.pizzaIngredientRepository.findOne({
          where: { id: ingredientDto.pizzaIngredient.id },
        });
        if (pizzaIngredient) {
          const selectedPizzaIngredient =
            this.selectedPizzaIngredientRepository.create({
              orderItem: savedOrderItem,
              pizzaIngredient: pizzaIngredient,
            });
          await this.selectedPizzaIngredientRepository.save(
            selectedPizzaIngredient,
          );
        }
      }
    }

    return this.orderItemRepository.findOne({
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
  ): Promise<OrderItem> {
    const orderItem = await this.orderItemRepository.findOne({
      where: { id: orderItemId },
      relations: [
        'selectedModifiers',
        'selectedProductObservations',
        'selectedPizzaFlavors',
        'selectedPizzaIngredients',
      ],
    });

    if (!orderItem) {
      throw new Error('OrderItem not found');
    }

    orderItem.productVariant =
      updateOrderItemDto.productVariant ?? orderItem.productVariant;
    orderItem.comments = updateOrderItemDto.comments ?? orderItem.comments;
    orderItem.price = updateOrderItemDto.price ?? orderItem.price;

    // Actualizar selectedModifiers
    await this.selectedModifierRepository.delete({
      orderItem: { id: orderItemId },
    });
    if (updateOrderItemDto.selectedModifiers?.length) {
      for (const modifierDto of updateOrderItemDto.selectedModifiers) {
        const modifier = await this.modifierRepository.findOne({
          where: { id: modifierDto.modifier.id },
        });
        if (modifier) {
          const selectedModifier = this.selectedModifierRepository.create({
            orderItem: orderItem,
            modifier: modifier,
          });
          await this.selectedModifierRepository.save(selectedModifier);
        }
      }
    }

    // Actualizar selectedProductObservations
    await this.selectedProductObservationRepository.delete({
      orderItem: { id: orderItemId },
    });
    if (updateOrderItemDto.selectedProductObservations?.length) {
      for (const observationDto of updateOrderItemDto.selectedProductObservations) {
        const productObservation =
          await this.productObservationRepository.findOne({
            where: { id: observationDto.productObservation.id },
          });
        if (productObservation) {
          const selectedProductObservation =
            this.selectedProductObservationRepository.create({
              orderItem: orderItem,
              productObservation: productObservation,
            });
          await this.selectedProductObservationRepository.save(
            selectedProductObservation,
          );
        }
      }
    }

    // Actualizar selectedPizzaFlavors
    await this.selectedPizzaFlavorRepository.delete({
      orderItem: { id: orderItemId },
    });
    if (updateOrderItemDto.selectedPizzaFlavors?.length) {
      for (const flavorDto of updateOrderItemDto.selectedPizzaFlavors) {
        const pizzaFlavor = await this.pizzaFlavorRepository.findOne({
          where: { id: flavorDto.pizzaFlavor.id },
        });
        if (pizzaFlavor) {
          const selectedPizzaFlavor = this.selectedPizzaFlavorRepository.create(
            {
              orderItem: orderItem,
              pizzaFlavor: pizzaFlavor,
            },
          );
          await this.selectedPizzaFlavorRepository.save(selectedPizzaFlavor);
        }
      }
    }

    // Actualizar selectedPizzaIngredients
    await this.selectedPizzaIngredientRepository.delete({
      orderItem: { id: orderItemId },
    });
    if (updateOrderItemDto.selectedPizzaIngredients?.length) {
      for (const ingredientDto of updateOrderItemDto.selectedPizzaIngredients) {
        const pizzaIngredient = await this.pizzaIngredientRepository.findOne({
          where: { id: ingredientDto.pizzaIngredient.id },
        });
        if (pizzaIngredient) {
          const selectedPizzaIngredient =
            this.selectedPizzaIngredientRepository.create({
              orderItem: orderItem,
              pizzaIngredient: pizzaIngredient,
              half: ingredientDto.half,
            });
          await this.selectedPizzaIngredientRepository.save(
            selectedPizzaIngredient,
          );
        }
      }
    }

    await this.orderItemRepository.save(orderItem);

    return this.orderItemRepository.findOne({
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
