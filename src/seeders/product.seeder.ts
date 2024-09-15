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
        'Frappes y Postres',
        'Jarras',
        'Cocteleria',
        'Bebidas',
        'Cafe Caliente',
      ],
    },
  ];

  const products = [
    {
      subcategoryName: 'Bebidas',
      items: [
        { name: 'Agua Fresca', price: 35 },
        { name: 'Limonada', price: 35 },
        { name: 'Botella agua chica', price: 15 },
        { name: 'Botella agua grande', price: 25 },
        {
          name: 'Refresco',
          variants: [
            { name: 'Squirt', price: 30 },
            { name: 'Mirinda', price: 30 },
            { name: 'Manzanita', price: 30 },
            { name: '7UP', price: 30 },
            { name: 'Coca', price: 30 },
            { name: 'Agua Mineral', price: 30 },
            { name: 'Sangria', price: 30 },
          ],
        },
        { name: 'Sangria Preparada', price: 35 },
        {
          name: 'Cerveza',
          variants: [
            { name: 'Corona clara', price: 30 },
            { name: 'Corona oscura', price: 30 },
            { name: 'XX', price: 30 },
            { name: 'Indio', price: 30 },
            { name: 'Modelo', price: 30 },
            { name: 'Heineken', price: 30 },
          ],
        },
        {
          name: 'Michelada',
          variants: [
            { name: 'Michelada Corona clara', price: 80 },
            { name: 'Michelada Corona oscura', price: 80 },
            { name: 'Michelada XX', price: 80 },
            { name: 'Michelada Indio', price: 80 },
            { name: 'Michelada Modelo', price: 80 },
            { name: 'Michelada Heineken', price: 80 },
          ],
        },
        {
          name: 'Te',
          variants: [
            { name: 'Te Manzanilla', price: 30 },
            { name: 'Te Limon', price: 30 },
            { name: 'Te Verde', price: 30 },
          ],
        },
        { name: 'Hielo aparte', price: 0 },
        { name: 'Sal y limon', price: 0 },
      ],
    },
    {
      subcategoryName: 'Jarras',
      items: [
        { name: 'Jarra Agua Fresca', price: 80 },
        { name: 'Jarra Limonada', price: 80 },
        { name: 'Jarra Michelada', price: 190 },
        { name: 'Jarra Clericot', price: 250 },
        { name: 'Jarra Sangria', price: 80 },
        { name: 'Jarra Tinto de Verano', price: 250 },
        { name: 'Hielo aparte', price: 0 },
      ],
    },
    {
      subcategoryName: 'Cafe Caliente',
      items: [
        { name: 'Americano', price: 45 },
        { name: 'Capuchino', price: 45 },
        { name: 'Chocolate', price: 50 },
        { name: 'Latte Capuchino', price: 50 },
        { name: 'Latte Vainilla', price: 50 },
        { name: 'Mocaccino', price: 50 },
      ],
    },
    {
      subcategoryName: 'Frappes y Postres',
      items: [
        {
          name: 'Frappe',
          variants: [
            { name: 'Frappe Capuchino', price: 70 },
            { name: 'Frappe Coco', price: 70 },
            { name: 'Frappe Caramelo', price: 70 },
            { name: 'Frappe Cajeta', price: 70 },
            { name: 'Frappe Mocaccino', price: 70 },
            { name: 'Frappe Galleta', price: 70 },
            { name: 'Frappe Bombon', price: 70 },
            { name: 'Frappe Rompope', price: 85 },
            { name: 'Frappe Mazapan', price: 85 },
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
        { name: 'Postre', price: 75 ,                 
        observations: [
          {
            typeName: 'Sabor',
            acceptsMultiple: false,
            options: [
              '3 chocolates',
              'Mocaccino',
              'Tiramisu',
              'Flan rompope',
              'Chesecake',
            ],
          },
        ], },
      ],
    },
    {
      subcategoryName: 'Cocteleria',
      items: [
        { name: 'Carajillo', price: 90 },
        { name: 'Clericot', price: 80 },
        { name: 'Conga', price: 75 },
        { name: 'Copa Vino', price: 90 },
        { name: 'Destornillador', price: 75 },
        { name: 'Gin Maracuya', price: 90 },
        { name: 'Gin Pepino', price: 90 },
        { name: 'Margarita', price: 85 },
        { name: 'Mojito', price: 100 },
        { name: 'Paloma', price: 80 },
        { name: 'Palo Santo', price: 80 },
        { name: 'Pina Colada', price: 75 },
        { name: 'Pinada', price: 70 },
        { name: 'Ruso Blanco', price: 85 },
        { name: 'Sangria con Vino', price: 80 },
        { name: 'Tequila', price: 90 },
        { name: 'Tinto de Verano', price: 90 },
        { name: 'Vampiro', price: 80 },
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
            { name: 'H. Lenazo', price: 110 },
            { name: 'H. Cubana', price: 100 },
          ],
          modifiers: [
            {
              typeName: 'Extras',
              acceptsMultiple: true,
              options: [
                { name: 'Partida', price: 0 },
                { name: 'Queso en la papas', price: 5 },
                { name: 'Doble carne', price: 10 },
                { name: 'Doble pollo', price: 15 },
                { name: 'Extra queso', price: 5 },
                { name: 'Extra tocino', price: 5 },
                { name: 'Res -> Pollo', price: 15 },
                { name: 'Con pierna', price: 10 },
                { name: 'Con pina', price: 5 },
                { name: 'Con jamon', price: 5 },
                { name: 'Con salchicha', price: 5 },
                { name: 'Con ensalada', price: 15 },
              ],
            },
            {
              typeName: 'Papas',
              acceptsMultiple: false,
              options: [
                { name: 'C/Papas', price: 10 },
                { name: 'C/Gajo', price: 15 },
              ],
            },
          ],
          observations: [
            {
              typeName: 'Sin ingrediente',
              acceptsMultiple: true,
              options: [
                'Aderezos aparte',
                'Sin aderezos',
                'Sin aderezo',
                'Sin catsup',
                'Sin cebolla',
                'Sin cebolla',
                'Sin crema',
                'Sin jalapeño',
                'Sin jitomate',
                'Sin lechuga',
                'Sin mostaza',
                'Sin quesos',
                'Sin tocino',
                'Sin queso amarillo',
                'Sin queso blanco',
                'Sin verduras',
              ],
            },
          ],
        },
        { name: 'Dedos de queso', price: 90 },
      ],
    },
    {
      subcategoryName: 'Entradas',
      items: [
        {
          name: 'Alitas',
          variants: [
            { name: 'BBQ', price: 135 },
            { name: 'Picosas', price: 135 },
            { name: 'Fritas', price: 135 },
            { name: 'Mango Habanero', price: 140 },
            { name: 'Alas Mixtas', price: 135 },
            { name: '1/2 BBQ', price: 70 },
            { name: '1/2 Picositas', price: 70 },
            { name: '1/2 Fritas', price: 70 },
            { name: '1/2 Mango Habanero', price: 75 },

          ],
        },
        {
          name: 'Papas',
          variants: [
            { name: 'P. Francesa', price: 90 },
            { name: 'P. Gajo', price: 105 },
            { name: 'Papas. Mixtas', price: 100 },
            { name: '1/2 Francesa', price: 55 },
            { name: '1/2 Gajo', price: 65 },
          ],
          observations: [
            {
              typeName: 'Queso',
              acceptsMultiple: false,
              options: ['Con queso', 'Sin queso'],
            },
          ],
          modifiers: [
            {
              typeName: 'Extras',
              acceptsMultiple: true,
              options: [
                { name: 'Extra Queso', price: 10 },
              ],
            },
          ],
        },
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
          modifiers: [
            {
              typeName: 'Extras',
              acceptsMultiple: true,
              options: [
                { name: 'Con jamon', price: 10 },
                { name: 'Con queso gouda', price: 15 },
                { name: 'Con vinagreta', price: 0 },
                { name: 'Doble pollo', price: 15 },
              ],
            },
          ],
          observations: [
            {
              typeName: 'Sin ingrediente',
              acceptsMultiple: true,
              options: [
                'Sin aderezo',
                'Sin betabel',
                'Sin Elote',
                'Sin gouda',
                'Sin jitomate',
                'Sin morron',
                'Sin parmesano',
                'Sin zanahoria'
              ],
            },
          ],
        },
        {
          name: 'Ensalada jardinera',
          variants: [
            { name: 'Ens. chica jardinera', price: 80 },
            { name: 'Ens. grande jardinera', price: 100 },
          ],
          modifiers: [
            {
              typeName: 'Extras',
              acceptsMultiple: true,
              options: [
                { name: 'Con pollo', price: 15 },
                { name: 'Con queso gouda', price: 15 },
              ],
            },
          ],
          observations: [
            {
              typeName: 'Sin ingrediente',
              acceptsMultiple: true,
              options: [
                'Sin jitomate',
                'Sin cebolla',
              ],
            },
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
            { name: 'Pizza Grande', price: 240 },
            { name: 'Pizza Mediana', price: 190 },
            { name: 'Pizza Chica', price: 140 },
            { name: 'Pizza Grande C/R', price: 270 },
            { name: 'Pizza Mediana C/R', price: 220 },
            { name: 'Pizza Chica C/R', price: 160 },
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
            { name: '3 Quesos', price: 0 },
            { name: 'La Lena', price: 20 },
            { name: 'La Maria', price: 20 },
            { name: 'Malinche', price: 20 },
            { name: 'Philadelphia', price: 20 },
          ],
          pizzaIngredients: [
            { name: 'Especial', ingredientValue: 4 },
            { name: 'Carnes Frias', ingredientValue: 4 },
            { name: 'Carranza', ingredientValue: 4 },
            { name: 'Zapata', ingredientValue: 4 },
            { name: 'Villa', ingredientValue: 4 },
            { name: 'Margarita', ingredientValue: 4 },
            { name: 'Adelita', ingredientValue: 4 },
            { name: 'Hawaiana', ingredientValue: 4 },
            { name: 'Mexicana', ingredientValue: 4 },
            { name: 'Rivera', ingredientValue: 4 },
            { name: 'Kahlo', ingredientValue: 4 },
            { name: 'Lupita', ingredientValue: 4 },
            { name: 'Pepperoni', ingredientValue: 4 },
            { name: 'La Lena', ingredientValue: 6 },
            { name: 'La Maria', ingredientValue: 6 },
            { name: 'Malinche', ingredientValue: 6 },
            { name: 'Philadelphia', ingredientValue: 6 },
            { name: '3 Quesos', ingredientValue: 2 },
            { name: 'Albahaca', ingredientValue: 1 },
            { name: 'Arandano', ingredientValue: 1 },
            { name: 'Calabaza', ingredientValue: 1 },
            { name: 'Cebolla', ingredientValue: 1 },
            { name: 'Champinon', ingredientValue: 1 },
            { name: 'Chile Seco', ingredientValue: 1 },
            { name: 'Chorizo', ingredientValue: 1 },
            { name: 'Elote', ingredientValue: 1 },
            { name: 'Jalapeno', ingredientValue: 1 },
            { name: 'Jamon', ingredientValue: 1 },
            { name: 'Jitomate', ingredientValue: 1 },
            { name: 'Molida', ingredientValue: 1 },
            { name: 'Morron', ingredientValue: 1 },
            { name: 'Pierna', ingredientValue: 2 },
            { name: 'Pina', ingredientValue: 1 },
            { name: 'Pollo BBQ', ingredientValue: 2 },
            { name: 'Queso de cabra', ingredientValue: 2 },
            { name: 'Salami', ingredientValue: 1 },
            { name: 'Salchicha', ingredientValue: 1 },
            { name: 'Tocino', ingredientValue: 1 },
          ],
        },
        { name: 'Chile chillon', price: 35 },
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
              pizzaIngredient.ingredientValue =
                pizzaIngredientData.ingredientValue;
              pizzaIngredient.product = product;
              await pizzaIngredientRepository.save(pizzaIngredient);
            }
          }
        }
      }
    }
  }
};
