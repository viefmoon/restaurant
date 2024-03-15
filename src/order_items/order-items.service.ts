import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderItem } from './order-item.entity';
import { SelectedModifier } from 'src/selected_modifiers/selected-modifier.entity';
import { SelectedProductObservation } from 'src/selected_product_observations/selected-product-observation.entity';
import { Modifier } from 'src/modifiers/modifier.entity';
import { ProductObservation } from 'src/product_observations/product-observation.entity';
import { CreateOrderItemDto } from './dto/create-order-item.dto';
import { Order } from 'src/orders/order.entity';
import { Product } from 'src/products/product.entity';
import { ProductVariant } from 'src/product_variants/product-variant.entity';
import { UpdateOrderItemStatusDto } from './dto/update-order-item-status.dto';
import { PizzaFlavor } from 'src/pizza_flavors/pizza-flavor.entity';
import { PizzaIngredient } from 'src/pizza_ingredients/pizza-ingredient.entity';
import { SelectedPizzaFlavor } from 'src/selected_pizza_flavors/selected-pizza-flavor.entity';
import { SelectedPizzaIngredient } from 'src/selected_pizza_ingredients/selected-pizza-ingredient.entity';
import { AppGateway } from '../app.gateway'; // Import AppGateway

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
        const order = await this.orderRepository.findOne({ where: { id: createOrderItemDto.orderId } });
        const product = await this.productRepository.findOne({ where: { id: createOrderItemDto.product.id } });
        const productVariant = createOrderItemDto.productVariant ? await this.productVariantRepository.findOne({ where: { id: createOrderItemDto.productVariant.id } }) : null;

        const orderItem = this.orderItemRepository.create({
            comments: createOrderItemDto.comments,
            order: order,
            product: product,
            productVariant: productVariant,
            price: createOrderItemDto.price,
        });

        const savedOrderItem = await this.orderItemRepository.save(orderItem); 

        // Procesar selectedModifiers
        if (createOrderItemDto.selectedModifiers?.length) {
            for (const modifierDto of createOrderItemDto.selectedModifiers) {
                const modifier = await this.modifierRepository.findOne({ where: { id: modifierDto.modifier.id } });
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
                const productObservation = await this.productObservationRepository.findOne({ where: { id: observationDto.productObservation.id } });
                if (productObservation) {
                    const selectedProductObservation = this.selectedProductObservationRepository.create({
                        orderItem: savedOrderItem,
                        productObservation: productObservation,
                    });
                    await this.selectedProductObservationRepository.save(selectedProductObservation);
                }
            }
        }

        // Procesar selectedPizzaFlavors
        if (createOrderItemDto.selectedPizzaFlavors?.length) {
            for (const flavorDto of createOrderItemDto.selectedPizzaFlavors) {
                const pizzaFlavor = await this.pizzaFlavorRepository.findOne({ where: { id: flavorDto.pizzaFlavor.id } });
                if (pizzaFlavor) {
                    const selectedPizzaFlavor = this.selectedPizzaFlavorRepository.create({
                        orderItem: savedOrderItem,
                        pizzaFlavor: pizzaFlavor,
                    });
                    await this.selectedPizzaFlavorRepository.save(selectedPizzaFlavor);
                }
            }
        }

        // Procesar selectedPizzaIngredients
        if (createOrderItemDto.selectedPizzaIngredients?.length) {
            for (const ingredientDto of createOrderItemDto.selectedPizzaIngredients) {
                const pizzaIngredient = await this.pizzaIngredientRepository.findOne({ where: { id: ingredientDto.pizzaIngredient.id } });
                if (pizzaIngredient) {
                    const selectedPizzaIngredient = this.selectedPizzaIngredientRepository.create({
                        orderItem: savedOrderItem,
                        pizzaIngredient: pizzaIngredient,
                    });
                    await this.selectedPizzaIngredientRepository.save(selectedPizzaIngredient);
                }
            }
        }

        return this.orderItemRepository.findOne({ where: { id: savedOrderItem.id }, relations: ['selectedModifiers', 'selectedProductObservations', 'selectedPizzaFlavors', 'selectedPizzaIngredients', 'product', 'product.productVariants','product.modifierTypes', 'product.productObservationTypes', 'product.pizzaFlavors', 'product.pizzaIngredients'] });
    }

    async updateOrderItemStatus(id: number, updateOrderItemStatusDto: UpdateOrderItemStatusDto): Promise<OrderItem> {
        const orderItem = await this.orderItemRepository.findOne({
            where: { id: id },
            relations: ['order', 'order.orderItems', 'product', 'product.subcategory', 'product.subcategory.category'],
        });
    
        if (!orderItem) {
            throw new Error('Order item not found');
        }
    
        orderItem.status = updateOrderItemStatusDto.status;
        await this.orderItemRepository.save(orderItem);
    
        // Aquí, determina a qué pantalla emitir el evento basado en la lógica de tu negocio
        const screenType = this.determineScreenType(orderItem); // Asume que tienes esta función implementada
        // Emitir el evento de actualización de OrderItem a la pantalla relevante
        //this.appGateway.emitOrderItemUpdateMinimal(screenType, orderItem.id, orderItem.status);
    
        return orderItem;
    }

    determineScreenType(orderItem: OrderItem): string {
        const category = orderItem.product.subcategory.category.name;
      
        if (category === 'Bebidas') {
          return 'barScreen';
        } else {
          const containsPizzaOrEntradas = orderItem.order.orderItems.some(item => {
            const subcategory = item.product.subcategory.name;
            return subcategory === 'Pizzas' || subcategory === 'Entradas';
          });
      
          if (containsPizzaOrEntradas) {
            return 'pizzaScreen';
          } else if (category === 'Comida') {
            return 'burgerScreen';
          }
        }
      
        return 'generalScreen';
      }
}
