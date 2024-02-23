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
import { PizzaFlavor } from 'src/pizza_flavors/pizza-flavor.entity';


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
    ) {}

    async create(createOrderItemDto: CreateOrderItemDto): Promise<OrderItem> {
        // Transformar CreateOrderItemDto a un objeto compatible con OrderItem
        const order = await this.orderRepository.findOne({ where: { id: createOrderItemDto.orderId } });
        const product = await this.productRepository.findOne({ where: { id: createOrderItemDto.productId } });
        const productVariant = createOrderItemDto.productVariantId ? await this.productVariantRepository.findOne({ where: { id: createOrderItemDto.productVariantId } }) : null;
        const pizzaFlavor = createOrderItemDto.pizzaFlavorId ? await this.pizzaFlavorRepository.findOne({ where: { id: createOrderItemDto.pizzaFlavorId } }) : null;

        const orderItem = this.orderItemRepository.create({
            status: createOrderItemDto.status,
            comments: createOrderItemDto.comments,
            order: order,
            product: product,
            productVariant: productVariant,
            pizzaFlavor: pizzaFlavor,
        });

        const savedOrderItem = await this.orderItemRepository.save(orderItem);

        // Procesar selectedModifiers
        if (createOrderItemDto.selectedModifiers?.length) {
            for (const modifierDto of createOrderItemDto.selectedModifiers) {
                const modifier = await this.modifierRepository.findOne({ where: { id: modifierDto.modifierId } });
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
                const productObservation = await this.productObservationRepository.findOne({ where: { id: observationDto.productObservationId } });
                if (productObservation) {
                    const selectedProductObservation = this.selectedProductObservationRepository.create({
                        orderItem: savedOrderItem,
                        productObservation: productObservation,
                    });
                    await this.selectedProductObservationRepository.save(selectedProductObservation);
                }
            }
        }

        return this.orderItemRepository.findOne({ where: { id: savedOrderItem.id }, relations: ['selectedModifiers', 'selectedProductObservations'] });
    }
}

