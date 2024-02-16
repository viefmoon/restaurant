import { Category } from '../categories/category.entity';
import { Subcategory } from '../subcategories/subcategory.entity';
import { DataSource } from 'typeorm';
import { Product } from '../products/product.entity';
import { ProductVariant } from '../product_variants/product-variant.entity';
import { ModifierType } from '../modifier_types/modifier-type.entity';
import { Modifier } from '../modifiers/modifier.entity';
import { ProductObservationType } from 'src/product_observation_types/product-observation-type.entity';
import { ProductObservation } from 'src/product_observations/product-observation.entity';

export const seedProducts = async (dataSource: DataSource) => {
  const categoryRepository = dataSource.getRepository(Category);
  const subcategoryRepository = dataSource.getRepository(Subcategory);
  const productRepository = dataSource.getRepository(Product);
  const productVariantRepository = dataSource.getRepository(ProductVariant);
  const modifierTypeRepository = dataSource.getRepository(ModifierType);
  const modifierRepository = dataSource.getRepository(Modifier);
  const productObservationTypeRepository = dataSource.getRepository(ProductObservationType);
  const productObservationRepository = dataSource.getRepository(ProductObservation);

  const categories = [
    {
      name: 'Comida',
      subcategories: ['Entradas', 'Pizzas', 'Hamburguesas', 'Ensaladas'],
    },
    {
      name: 'Bebida',
      subcategories: ['Frappes', 'Coctelería', 'Bebidas sin Alcohol', 'Café Caliente', 'Jarras'],
    },
  ];

  const products = [
    {
      subcategoryName: 'Bebidas sin Alcohol',
      items: [
        { name: 'Agua Fresca', price: 35 },
        { name: 'Limonada', price: 35 },
        { name: 'Refresco', variants: [
          { name: 'Squirt', price: 30 },
          { name: 'Mirinda', price: 30 },
          { name: 'Manzanita', price: 30 },
          { name: '7UP', price: 30 },
          { name: 'Coca', price: 30 },
          { name: 'Agua Mineral', price: 30 },
          { name: 'Sangría', price: 30 },
        ]},
        { name: 'Sangría Preparada', price: 35 },
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
        { name: 'Mocachino', price: 52 },
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
        { name: 'Michelada', price: 80 },
      ],
    },
    {
      subcategoryName: 'Frappes',
      items: [
        { name: 'Frappe', variants: [
          { name: 'Capuchino', price: 70 },
          { name: 'Coco', price: 70 },
          { name: 'Caramelo', price: 70 },
          { name: 'Cajeta', price: 70 },
          { name: 'Mocachino', price: 70 },
          { name: 'Galleta', price: 70 },
          { name: 'Bombón', price: 70 },
          { name: 'Rompopo', price: 85 },
          { name: 'Mazapán', price: 85 },
          { name: 'Magnum', price: 85 },
        ]},
        { name: 'Malteada', variants: [
          { name: 'Galleta', price: 80 },
          { name: 'Vainilla', price: 80 },
          { name: 'Capuchino', price: 80 },
        ]},
      ],
    },
    
    {
      subcategoryName: 'Jarras',
      items: [
        { name: 'Jarra', variants: [
          { name: 'Agua Fresca', price: 80 },
          { name: 'Limonada', price: 80 },
          { name: 'Michelada', price: 190 },
          { name: 'Clericot', price: 250 },
          { name: 'Sangría Preparada', price: 80 },
          { name: 'Tinto de Verano', price: 250 },
        ]},
      ],
    },
    {
      subcategoryName: 'Hamburguesas',
      items: [
        {
          name: 'Hamburguesa',
          variants: [
            { name: 'Tradicional', price: 85 },
            { name: 'Especial', price: 95 },
            // Más variantes aquí
          ],
          modifiers: [
            {
              typeName: 'Papas',
              options: [
                { name: 'C/Papas', price: 10 },
                { name: 'C/Gajo', price: 15 },
              ],
            },
            {
              typeName: 'Extras',
              options: [
                { name: 'Con Tocino', price: 5 },
                { name: 'Doble Carne', price: 10 },
              ],
            },
          ],
          observations: [ // Añadir observaciones aquí
            {
              typeName: 'Sin Ingrediente',
              options: ['Sin Cebolla', 'Sin Chile', 'Sin Jitomate'],
            },
          ],
        },
      ],
    },
    {
      subcategoryName: 'Entradas',
      items: [
        { name: 'Alitas', variants: [
        { name: 'BBQ', price: 135 },
        { name: 'Pícosas', price: 135 },
        { name: 'Fritas', price: 135 },
        { name: 'Mixtas', price: 135 },
        { name: '1/2 BBQ', price: 70 },
        { name: '1/2 Picositas', price: 70 },
        { name: '1/2 Fritas', price: 70 },
      ]},
      { name: 'Papas', variants: [
        { name: 'Francesa', price: 90 },
        { name: 'Gajo', price: 100 },
        { name: 'Mixtas', price: 100 },
        { name: '1/2 Francesa', price: 55 },
        { name: '1/2 Gajo', price: 60 },
      ]},
    ],
  },
];

  for (const categoryData of categories) {
    let category = await categoryRepository.findOneBy({ name: categoryData.name });
    if (!category) {
      category = new Category();
      category.name = categoryData.name;
      category.subcategories = categoryData.subcategories.map(subcategoryName => {
        const subcategory = new Subcategory();
        subcategory.name = subcategoryName;
        subcategory.category = category; // Set the category property of each subcategory
        return subcategory;
      });
      await categoryRepository.save(category);
      for (const subcategory of category.subcategories) {
        await subcategoryRepository.save(subcategory);
      }
    }
  }

  for (const productData of products) {
    const subcategory = await subcategoryRepository.findOneBy({ name: productData.subcategoryName });
    if (subcategory) {
      for (const item of productData.items) {
        // Buscar el producto por nombre y subcategoría para verificar si ya existe
        let product = await productRepository.findOne({
          where: {
            name: item.name,
            subcategory: subcategory
          },
          relations: ["subcategory"],
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
  
          await productRepository.save(product);
        }
  
        // Creación de variantes
        if (item.variants) {
          for (const variant of item.variants) {
            // Verificar si la variante ya existe para el producto
            let productVariant = await productVariantRepository.findOne({
              where: {
                name: variant.name,
                product: { id: product.id }
              },
              relations: ["product"],
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
                product: { id: product.id }
              },
              relations: ["product"],
            });
  
            if (!modifierType) {
              modifierType = new ModifierType();
              modifierType.name = modifierTypeData.typeName;
              modifierType.product = product;
              await modifierTypeRepository.save(modifierType);
            }
  
            for (const modifierData of modifierTypeData.options) {
              // Verificar si el modificador ya existe para el tipo de modificador
              let modifier = await modifierRepository.findOne({
                where: {
                  name: modifierData.name,
                  modifierType: { id: modifierType.id }
                },
                relations: ["modifierType"],
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
            let observationType = await productObservationTypeRepository.findOne({
              where: {
                name: observationTypeData.typeName,
                product: { id: product.id }
              },
              relations: ["product"],
            });
  
            if (!observationType) {
              observationType = new ProductObservationType();
              observationType.name = observationTypeData.typeName;
              observationType.product = product;
              await productObservationTypeRepository.save(observationType);
            }
  
            for (const observationName of observationTypeData.options) {
              // Verificar si la observación ya existe para el tipo de observación
              let observation = await productObservationRepository.findOne({
                where: {
                  name: observationName,
                  productObservationType: { id: observationType.id }
                },
                relations: ["productObservationType"],
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
      }
    }
  }
}