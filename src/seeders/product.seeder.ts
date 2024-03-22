import { Category } from '../categories/category.entity';
import { Subcategory } from '../subcategories/subcategory.entity';
import { DataSource } from 'typeorm';
import { Product } from '../products/product.entity';
import { ProductVariant } from '../product_variants/product-variant.entity';
import { ModifierType } from '../modifier_types/modifier-type.entity';
import { Modifier } from '../modifiers/modifier.entity';
import { ProductObservationType } from 'src/product_observation_types/product-observation-type.entity';
import { ProductObservation } from 'src/product_observations/product-observation.entity';
import { PizzaFlavor } from '../pizza_flavors/pizza-flavor.entity';
import { PizzaIngredient } from '../pizza_ingredients/pizza-ingredient.entity';

export const seedProducts = async (dataSource: DataSource) => {
  const categoryRepository = dataSource.getRepository(Category);
  const subcategoryRepository = dataSource.getRepository(Subcategory);
  const productRepository = dataSource.getRepository(Product);
  const productVariantRepository = dataSource.getRepository(ProductVariant);
  const modifierTypeRepository = dataSource.getRepository(ModifierType);
  const modifierRepository = dataSource.getRepository(Modifier);
  const productObservationTypeRepository = dataSource.getRepository(
    ProductObservationType,
  );
  const productObservationRepository =
    dataSource.getRepository(ProductObservation);
  const pizzaFlavorRepository = dataSource.getRepository(PizzaFlavor);
  const pizzaIngredientRepository = dataSource.getRepository(PizzaIngredient);

  const categories = [
    {
      name: 'Comida',
      subcategories: ['Entradas', 'Pizzas', 'Hamburguesas', 'Ensaladas'],
    },
    {
      name: 'Bebida',
      subcategories: [
        'Frappes y Malteadas',
        'Coctelería',
        'Bebidas',
        'Café Caliente',
        'Jarras',
      ],
    },
  ];

  const products = [
    {
      subcategoryName: 'Bebidas',
      items: [
        { name: 'Agua Fresca', price: 35 },
        { name: 'Limonada', price: 35 },
        {
          name: 'Refresco',
          variants: [
            { name: 'Squirt', price: 30 },
            { name: 'Mirinda', price: 30 },
            { name: 'Manzanita', price: 30 },
            { name: '7UP', price: 30 },
            { name: 'Coca', price: 30 },
            { name: 'Agua Mineral', price: 30 },
            { name: 'Sangría', price: 30 },
          ],
        },
        {
          name: 'Cerveza',
          variants: [
            { name: 'Corona clara', price: 30 },
            { name: 'Corona oscura', price: 30 },
            { name: 'XX Lager', price: 30 },
            { name: 'XX', price: 30 },
            { name: 'Indio', price: 30 },
          ],
        },
        { name: 'Sangría Preparada', price: 35 },
        { name: 'Michelada', price: 80 },
        { name: 'Hielo aparte', price: 0 },
        { name: 'Sal y limon', price: 0 },
        {
          name: 'Té',
          variants: [
            { name: 'Té Manzanilla', price: 30 },
            { name: 'Té Limon', price: 30 },
            { name: 'Té Verde', price: 30 },
          ],
        },
      ],
    },
    {
      subcategoryName: 'Café Caliente',
      items: [
        { name: 'Americano', price: 45 },
        { name: 'Capuchino', price: 45 },
        { name: 'Chocolate', price: 50 },
        { name: 'Latte Capuchino', price: 50 },
        { name: 'Latte Vainilla', price: 50 },
        { name: 'Mocachino', price: 50 },
      ],
    },
    {
      subcategoryName: 'Coctelería',
      items: [
        { name: 'Carajillo', price: 90 },
        { name: 'Clericot', price: 80 },
        { name: 'Conga', price: 75 },
        { name: 'Copa Vino', price: 90 },
        { name: 'Destornillador', price: 75 },
        { name: 'Gin Maracuyá', price: 90 },
        { name: 'Gin Pepino', price: 90 },
        { name: 'Margarita', price: 85 },
        { name: 'Mojito', price: 100 },
        { name: 'Palo Santo', price: 80 },
        { name: 'Paloma', price: 80 },
        { name: 'Piña Colada', price: 75 },
        { name: 'Piñada', price: 70 },
        { name: 'Ruso Blanco', price: 85 },
        { name: 'Tinto de Verano', price: 90 },
        { name: 'Vampiro', price: 80 },
      ],
    },
    {
      subcategoryName: 'Frappes y Malteadas',
      items: [
        {
          name: 'Frappe',
          variants: [
            { name: 'Frappe Capuchino', price: 70 },
            { name: 'Frappe Coco', price: 70 },
            { name: 'Frappe Caramelo', price: 70 },
            { name: 'Frappe Cajeta', price: 70 },
            { name: 'Frappe Mocachino', price: 70 },
            { name: 'Frappe Galleta', price: 70 },
            { name: 'Frappe Bombón', price: 70 },
            { name: 'Frappe Rompopo', price: 85 },
            { name: 'Frappe Mazapán', price: 85 },
            { name: 'Frappe Magnum', price: 85 },
          ],
        },
        {
          name: 'Malteada',
          variants: [
            { name: 'Malteada Galleta', price: 80 },
            { name: 'Malteada Vainilla', price: 80 },
            { name: 'Malteada Capuchino', price: 80 },
          ],
        },
      ],
    },

    {
      subcategoryName: 'Jarras',
      items: [
        { name: 'Jarra de Agua Fresca', price: 80 },
        { name: 'Jarra de Limonada', price: 80 },
        { name: 'Jarra de Michelada', price: 190 },
        { name: 'Jarra de Clericot', price: 250 },
        { name: 'Jarra de Sangría Preparada', price: 80 },
        { name: 'Jarra de Tinto de Verano', price: 250 },
        { name: 'Hielo aparte', price: 0 },
      ],
    },
    {
      subcategoryName: 'Hamburguesas',
      items: [
        {
          name: 'Hamburguesa',
          variants: [
            { name: 'H. Tradicional', price: 85 },
            { name: 'H. Especial', price: 95 },
            { name: 'H. Hawaiana', price: 95 },
            { name: 'H. Pollo', price: 100 },
            { name: 'H. BBQ', price: 100 },
            { name: 'H. Leñazo', price: 110 },
            { name: 'H. Cubana', price: 100 },
          ],
          modifiers: [
            {
              typeName: 'Papas',
              acceptsMultiple: false,
              options: [
                { name: 'C/Papas', price: 10 },
                { name: 'C/Gajo', price: 15 },
              ],
            },
            {
              typeName: 'Extras',
              acceptsMultiple: true,
              options: [
                { name: 'Papas con queso', price: 5 },
                { name: 'Doble Carne', price: 10 },
              ],
            },
          ],
          observations: [
            {
              typeName: 'Sin ingrediente',
              acceptsMultiple: true,
              options: [
                'Sin cebolla',
                'Sin jitomate',
                'Sin lechuga',
                'Sin cebolla',
                'Sin mostaza',
                'Sin catsup',
                'Sin mayonesa',
                'Sin queso',
              ],
            },
          ],
        },
      ],
    },
    {
      subcategoryName: 'Entradas',
      items: [
        {
          name: 'Alitas',
          variants: [
            { name: 'BBQ', price: 135 },
            { name: 'Pícosas', price: 135 },
            { name: 'Fritas', price: 135 },
            { name: 'Mixtas', price: 135 },
            { name: '1/2 BBQ', price: 70 },
            { name: '1/2 Picositas', price: 70 },
            { name: '1/2 Fritas', price: 70 },
          ],
        },
        {
          name: 'Papas',
          variants: [
            { name: 'P. Francesa', price: 90 },
            { name: 'P. Gajo', price: 100 },
            { name: 'P. Mixtas', price: 100 },
            { name: '1/2 Francesa', price: 55 },
            { name: '1/2 Gajo', price: 60 },
          ],
          observations: [
            {
              typeName: 'Queso',
              acceptsMultiple: false,
              options: ['Con queso', 'Sin queso'],
            },
          ],
        },
        { name: 'Dedos de queso', price: 90 },
      ],
    },
    {
      subcategoryName: 'Ensaladas',
      items: [
        {
          name: 'Ensalada de pollo',
          variants: [
            { name: 'Ens. chica pollo', price: 90 },
            { name: 'Ens. grande pollo', price: 120 },
          ],
        },
        {
          name: 'Ensalada de jamon',
          variants: [
            { name: 'Ens. chica jamon', price: 80 },
            { name: 'Ens. grande jamon', price: 100 },
          ],
        },
      ],
    },
    {
      subcategoryName: 'Pizzas',
      items: [
        {
          name: 'Pizza',
          variants: [
            { name: 'Grande', price: 240 },
            { name: 'Mediana', price: 190 },
            { name: 'Chica', price: 140 },
            { name: 'Grande C/Relleno', price: 260 },
            { name: 'Mediana C/Relleno', price: 210 },
            { name: 'Chica C/Relleno', price: 160 },
          ],
          pizzaFlavors: [
            { name: 'Especial', price: 0 },
            { name: 'Carnes Frias', price: 0 },
            { name: 'Carranza', price: 0 },
            { name: 'Zapata', price: 0 },
            { name: 'Villa', price: 0 },
            { name: 'Margarita', price: 0 },
            { name: 'Adelita', price: 0 },
            { name: 'Hawaiana', price: 0 },
            { name: 'Mexicana', price: 0 },
            { name: 'Rivera', price: 0 },
            { name: 'Kahlo', price: 0 },
            { name: 'Lupita', price: 0 },
            { name: 'Pepperoni', price: 0 },
            { name: 'La Leña', price: 20 },
            { name: 'La Maria', price: 20 },
            { name: 'Malinche', price: 20 },
            { name: 'Philadelphia', price: 20 },
          ],
          pizzaIngredients: [
            { name: 'Jamon', price: 0 },
            { name: 'Salchicha', price: 0 },
            { name: 'Pepperoni', price: 0 },
            { name: 'Piña', price: 0 },
            { name: 'Champiñon', price: 0 },
            { name: 'Chorizo', price: 0 },
            { name: 'Salami', price: 0 },
            { name: 'Tocino', price: 0 },
            { name: 'Jitomate', price: 0 },
            { name: 'Chile Morron', price: 0 },
            { name: 'Queso de cabra', price: 20 },
            { name: 'Pierna', price: 20 },
          ],
          modifiers: [
            {
              typeName: 'Añadir en mitad 1',
              acceptsMultiple: true,
              options: [
                { name: 'Jamon', price: 5 },
                { name: 'Salchicha', price: 5 },
                { name: 'Pepperoni', price: 5 },
                { name: 'Piña', price: 5 },
                { name: 'Champiñon', price: 5 },
                { name: 'Chorizo', price: 5 },
                { name: 'Salami', price: 5 },
                { name: 'Tocino', price: 5 },
                { name: 'Jitomate', price: 5 },
                { name: 'Chile Morron', price: 5 },
                { name: 'Chile Jalapeño', price: 5 },
              ],
            },
            {
              typeName: 'Quitar en mitad 1',
              acceptsMultiple: true,
              options: [
                { name: 'Sin Jamon', price: 0 },
                { name: 'Sin Salchicha', price: 0 },
                { name: 'Sin Pepperoni', price: 0 },
                { name: 'Sin Piña', price: 0 },
                { name: 'Sin Champiñon', price: 0 },
                { name: 'Sin Chorizo', price: 0 },
                { name: 'Sin Salami', price: 0 },
                { name: 'Sin Tocino', price: 0 },
                { name: 'Sin Jitomate', price: 0 },
                { name: 'Sin Chile Morron', price: 0 },
                { name: 'Sin Chile Jalapeño', price: 0 },
              ],
            },
            {
              typeName: 'Añadir en mitad 2',
              acceptsMultiple: true,
              options: [
                { name: 'Con Jamon', price: 5 },
                { name: 'Con Salchicha', price: 5 },
                { name: 'Con Pepperoni', price: 5 },
                { name: 'Con Piña', price: 5 },
                { name: 'Con Champiñon', price: 5 },
                { name: 'Con Jamon', price: 5 },
                { name: 'Con Salchicha', price: 5 },
                { name: 'Con Pepperoni', price: 5 },
                { name: 'Con Piña', price: 5 },
                { name: 'Con Chile Morron', price: 5 },
                { name: 'Con Chile Jalapeño', price: 5 },
              ],
            },
            {
              typeName: 'Quitar en mitad 2',
              acceptsMultiple: true,
              options: [
                { name: 'Sin Jamon', price: 0 },
                { name: 'Sin Salchicha', price: 0 },
                { name: 'Sin Pepperoni', price: 0 },
                { name: 'Sin Piña', price: 0 },
                { name: 'Sin Champiñon', price: 0 },
                { name: 'Sin Chorizo', price: 0 },
                { name: 'Sin Salami', price: 0 },
                { name: 'Sin Tocino', price: 0 },
                { name: 'Sin Jitomate', price: 0 },
                { name: 'Sin Chile Morron', price: 0 },
                { name: 'Sin Chile Jalapeño', price: 0 },
              ],
            },
            {
              typeName: 'Añadir',
              acceptsMultiple: true,
              options: [
                { name: 'Con Jamon', price: 10 },
                { name: 'Con Salchicha', price: 10 },
                { name: 'Con Pepperoni', price: 10 },
                { name: 'Con Piña', price: 10 },
                { name: 'Con Champiñon', price: 10 },
                { name: 'Con Chorizo', price: 10 },
                { name: 'Con Salami', price: 10 },
                { name: 'Con Tocino', price: 10 },
                { name: 'Con Jitomate', price: 10 },
                { name: 'Con Chile Morron', price: 10 },
                { name: 'Con Chile Jalapeño', price: 10 },
              ],
            },
            {
              typeName: 'Quitar',
              acceptsMultiple: true,
              options: [
                { name: 'Sin Jamon', price: 0 },
                { name: 'Sin Salchicha', price: 0 },
                { name: 'Sin Pepperoni', price: 0 },
                { name: 'Sin Piña', price: 0 },
                { name: 'Sin Champiñon', price: 0 },
                { name: 'Sin Chorizo', price: 0 },
                { name: 'Sin Salami', price: 0 },
                { name: 'Sin Tocino', price: 0 },
                { name: 'Sin Jitomate', price: 0 },
                { name: 'Sin Chile Morron', price: 0 },
                { name: 'Sin Chile Jalapeño', price: 0 },
              ],
            },
          ],
        },
      ],
    },
  ];

  for (const categoryData of categories) {
    let category = await categoryRepository.findOneBy({
      name: categoryData.name,
    });
    if (!category) {
      category = new Category();
      category.name = categoryData.name;
      category.subcategories = categoryData.subcategories.map(
        (subcategoryName) => {
          const subcategory = new Subcategory();
          subcategory.name = subcategoryName;
          subcategory.category = category; // Set the category property of each subcategory
          return subcategory;
        },
      );
      await categoryRepository.save(category);
      for (const subcategory of category.subcategories) {
        await subcategoryRepository.save(subcategory);
      }
    }
  }

  for (const productData of products) {
    const subcategory = await subcategoryRepository.findOneBy({
      name: productData.subcategoryName,
    });
    if (subcategory) {
      for (const item of productData.items) {
        // Buscar el producto por nombre y subcategoría para verificar si ya existe
        let product = await productRepository.findOne({
          where: {
            name: item.name,
            subcategory: subcategory,
          },
          relations: ['subcategory'],
        });

        if (!product) {
          product = new Product();
          product.name = item.name;
          product.subcategory = subcategory;

          if ('price' in item) {
            product.price = (item as { name: string; price: number }).price;
          } else {
            product.price = null;
          }

          product.imageUrl = `assets/images/${item.name.replaceAll(' ', '').toLowerCase()}.jpg`;

          await productRepository.save(product);
        }

        // Creación de variantes
        if (item.variants) {
          for (const variant of item.variants) {
            // Verificar si la variante ya existe para el producto
            let productVariant = await productVariantRepository.findOne({
              where: {
                name: variant.name,
                product: { id: product.id },
              },
              relations: ['product'],
            });

            if (!productVariant) {
              productVariant = new ProductVariant();
              productVariant.name = variant.name;
              productVariant.price = variant.price;
              productVariant.product = product;
              await productVariantRepository.save(productVariant);
            }
          }
        }

        // Creación de tipos de modificadores y modificadores
        if ('modifiers' in item) {
          for (const modifierTypeData of item.modifiers) {
            // Verificar si el tipo de modificador ya existe para el producto
            let modifierType = await modifierTypeRepository.findOne({
              where: {
                name: modifierTypeData.typeName,
                product: { id: product.id },
              },
              relations: ['product'],
            });

            if (!modifierType) {
              modifierType = new ModifierType();
              modifierType.name = modifierTypeData.typeName;
              modifierType.product = product;
              modifierType.acceptsMultiple = modifierTypeData.acceptsMultiple; // Usar el valor definido en el seeder
              await modifierTypeRepository.save(modifierType);
            }

            for (const modifierData of modifierTypeData.options) {
              // Verificar si el modificador ya existe para el tipo de modificador
              let modifier = await modifierRepository.findOne({
                where: {
                  name: modifierData.name,
                  modifierType: { id: modifierType.id },
                },
                relations: ['modifierType'],
              });

              if (!modifier) {
                modifier = new Modifier();
                modifier.name = modifierData.name;
                modifier.price = modifierData.price;
                modifier.modifierType = modifierType;
                await modifierRepository.save(modifier);
              }
            }
          }
        }

        if ('observations' in item) {
          for (const observationTypeData of item.observations) {
            // Verificar si el tipo de observación ya existe para el producto
            let observationType =
              await productObservationTypeRepository.findOne({
                where: {
                  name: observationTypeData.typeName,
                  product: { id: product.id },
                },
                relations: ['product'],
              });

            if (!observationType) {
              observationType = new ProductObservationType();
              observationType.name = observationTypeData.typeName;
              observationType.product = product;
              observationType.acceptsMultiple =
                observationTypeData.acceptsMultiple; // Usar el valor definido en el seeder
              await productObservationTypeRepository.save(observationType);
            }

            for (const observationName of observationTypeData.options) {
              // Verificar si la observación ya existe para el tipo de observación
              let observation = await productObservationRepository.findOne({
                where: {
                  name: observationName,
                  productObservationType: { id: observationType.id },
                },
                relations: ['productObservationType'],
              });

              if (!observation) {
                observation = new ProductObservation();
                observation.name = observationName;
                observation.productObservationType = observationType;
                await productObservationRepository.save(observation);
              }
            }
          }
        }

        // Creación de sabores de pizza
        if ('pizzaFlavors' in item) {
          for (const pizzaFlavorData of item.pizzaFlavors) {
            // Verificar si el sabor de pizza ya existe para el producto
            let pizzaFlavor = await pizzaFlavorRepository.findOne({
              where: {
                name: pizzaFlavorData.name,
                product: { id: product.id },
              },
              relations: ['product'],
            });

            if (!pizzaFlavor) {
              pizzaFlavor = new PizzaFlavor();
              pizzaFlavor.name = pizzaFlavorData.name;
              pizzaFlavor.price = pizzaFlavorData.price;
              pizzaFlavor.product = product;
              await pizzaFlavorRepository.save(pizzaFlavor);
            }
          }
        }

        // Creación de ingredientes de pizza
        if ('pizzaIngredients' in item) {
          for (const pizzaIngredientData of item.pizzaIngredients) {
            // Verificar si el ingrediente de pizza ya existe para el producto
            let pizzaIngredient = await pizzaIngredientRepository.findOne({
              where: {
                name: pizzaIngredientData.name,
                product: { id: product.id },
              },
              relations: ['product'],
            });

            if (!pizzaIngredient) {
              pizzaIngredient = new PizzaIngredient();
              pizzaIngredient.name = pizzaIngredientData.name;
              pizzaIngredient.price = pizzaIngredientData.price;
              pizzaIngredient.product = product;
              await pizzaIngredientRepository.save(pizzaIngredient);
            }
          }
        }
      }
    }
  }
};
