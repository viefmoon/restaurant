import { Category } from '../categories/category.entity';
import { Subcategory } from '../subcategories/subcategory.entity';
import { DataSource } from 'typeorm';
import { Product } from '../products/product.entity';
import { ProductVariant } from '../product_variants/product-variant.entity';
import { ModifierType } from '../modifier_types/modifier-type.entity';
import { Modifier } from '../modifiers/modifier.entity';
import { PizzaFlavor } from '../pizza_flavors/pizza-flavor.entity';
import { PizzaIngredient } from '../pizza_ingredients/pizza-ingredient.entity';

export const seedProducts = async (dataSource: DataSource) => {
  const categoryRepository = dataSource.getRepository(Category);
  const subcategoryRepository = dataSource.getRepository(Subcategory);
  const productRepository = dataSource.getRepository(Product);
  const productVariantRepository = dataSource.getRepository(ProductVariant);
  const modifierTypeRepository = dataSource.getRepository(ModifierType);
  const modifierRepository = dataSource.getRepository(Modifier);
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
        'Refrescos',
      ],
    },
  ];

  const products = [
    {
      subcategoryName: 'Bebidas',
      items: [
        {
          id: 'AH',
          name: 'Agua fresca de horchata',
          shortName: 'Horchata',
          price: 35,
        },
        { id: 'LIM', name: 'Limonada', shortName: 'Limonada', price: 35 },
        {
          id: 'LIMM',
          name: 'Limonada Mineral',
          shortName: 'Lim. Mineral',
          price: 35,
        },
        {
          id: 'SANP',
          name: 'Sangria Preparada',
          shortName: 'Sang. Preparada',
          price: 35,
        },
        {
          id: 'BAC',
          name: 'Botella agua chica',
          shortName: 'Botella A/CH',
          price: 15,
        },
        {
          id: 'BAG',
          name: 'Botella agua grande',
          shortName: 'Botella A/GDE',
          price: 25,
        },
        {
          id: 'CR',
          name: 'Cerveza',
          shortName: 'Cerveza',
          productVariants: [
            {
              id: 'CRV1',
              name: 'Corona clara',
              shortName: 'Corona clara',
              price: 30,
            },
            {
              id: 'CRV2',
              name: 'Corona oscura',
              shortName: 'Corona oscura',
              price: 30,
            },
            { id: 'CRV3', name: 'XX', shortName: 'XX', price: 30 },
            { id: 'CRV4', name: 'Indio', shortName: 'Indio', price: 30 },
            { id: 'CRV5', name: 'Modelo', shortName: 'Modelo', price: 30 },
            { id: 'CRV6', name: 'Heineken', shortName: 'Heineken', price: 30 },
          ],
        },
        {
          id: 'MC',
          name: 'Michelada',
          shortName: 'Michelada',
          productVariants: [
            {
              id: 'MCV1',
              name: 'Michelada clara',
              shortName: 'Michelada clara',
              price: 80,
            },
            {
              id: 'MCV2',
              name: 'Michelada oscura',
              shortName: 'Michelada oscura',
              price: 80,
            },
          ],
        },
        {
          id: 'TE',
          name: 'Te',
          shortName: 'Te',
          productVariants: [
            {
              id: 'TEV1',
              name: 'Te Manzanilla',
              shortName: 'Te Manzanilla',
              price: 30,
            },
            { id: 'TEV2', name: 'Te Limon', shortName: 'Te Limon', price: 30 },
            { id: 'TEV3', name: 'Te Verde', shortName: 'Te Verde', price: 30 },
          ],
        },
        {
          id: 'BHA',
          name: 'Hielo aparte',
          shortName: 'Hielo aparte',
          price: 0,
        },
        {
          id: 'BSL',
          name: 'Sal y limon',
          shortName: 'Sal y limon',
          price: 0,
        },
      ],
    },
    {
      subcategoryName: 'Refrescos',
      items: [
        { id: 'CC', name: 'Coca Cola', shortName: 'Coca', price: 30 },
        { id: 'SAN', name: 'Sangria', shortName: 'Sangria', price: 30 },
        { id: 'SQU', name: 'Squirt', shortName: 'Squirt', price: 30 },
        { id: 'MIR', name: 'Mirinda', shortName: 'Mirinda', price: 30 },
        { id: 'MAN', name: 'Manzanita', shortName: 'Manzanita', price: 30 },
        { id: '7UP', name: '7up', shortName: '7up', price: 30 },
        {
          id: 'AGM',
          name: 'Agua Mineral',
          shortName: 'Agua Mineral',
          price: 30,
        },
      ],
    },
    {
      subcategoryName: 'Jarras',
      items: [
        {
          id: 'JAQU',
          name: 'Jarra Agua Fresca Horchata',
          shortName: 'Jarra Horchata',
          price: 80,
        },
        {
          id: 'JLIM',
          name: 'Jarra Limonada',
          shortName: 'Jarra Limonada',
          price: 80,
        },
        {
          id: 'JMIC',
          name: 'Jarra Michelada',
          shortName: 'Jarra Michelada',
          price: 190,
        },
        {
          id: 'JCLE',
          name: 'Jarra Clericot',
          shortName: 'Jarra Clericot',
          price: 250,
        },
        {
          id: 'JSAN',
          name: 'Jarra Sangria',
          shortName: 'Jarra Sangria',
          price: 80,
        },
        {
          id: 'JTVI',
          name: 'Jarra Tinto de Verano',
          shortName: 'Jarra Tinto de Verano',
          price: 250,
        },
        {
          id: 'JHA',
          name: 'Hielo aparte',
          shortName: 'Hielo aparte',
          price: 0,
        },
      ],
    },
    {
      subcategoryName: 'Cafe Caliente',
      items: [
        {
          id: 'CA',
          name: 'Cafe Americano',
          shortName: 'Cafe Americano',
          price: 45,
        },
        { id: 'CP', name: 'Capuchino', shortName: 'Capuchino', price: 45 },
        { id: 'CH', name: 'Chocolate', shortName: 'Chocolate', price: 50 },
        {
          id: 'LC',
          name: 'Latte Capuchino',
          shortName: 'Latte Capuchino',
          price: 50,
        },
        {
          id: 'LV',
          name: 'Latte Vainilla',
          shortName: 'Latte Vainilla',
          price: 50,
        },
        { id: 'MCC', name: 'Mocaccino', shortName: 'Mocaccino', price: 50 },
      ],
    },
    {
      subcategoryName: 'Frappes y Postres',
      items: [
        {
          id: 'F',
          name: 'Frappe',
          shortName: 'Frappe',
          productVariants: [
            {
              id: 'FV1',
              name: 'Frappe Capuchino',
              shortName: 'Frappe Capuchino',
              price: 70,
            },
            {
              id: 'FV2',
              name: 'Frappe Coco',
              shortName: 'Frappe Coco',
              price: 70,
            },
            {
              id: 'FV3',
              name: 'Frappe Caramelo',
              shortName: 'Frappe Caramelo',
              price: 70,
            },
            {
              id: 'FV4',
              name: 'Frappe Cajeta',
              shortName: 'Frappe Cajeta',
              price: 70,
            },
            {
              id: 'FV5',
              name: 'Frappe Mocaccino',
              shortName: 'Frappe Mocaccino',
              price: 70,
            },
            {
              id: 'FV6',
              name: 'Frappe Galleta',
              shortName: 'Frappe Galleta',
              price: 70,
            },
            {
              id: 'FV7',
              name: 'Frappe Bombon',
              shortName: 'Frappe Bombon',
              price: 70,
            },
            {
              id: 'FV8',
              name: 'Frappe Rompope',
              shortName: 'Frappe Rompope',
              price: 85,
            },
            {
              id: 'FV9',
              name: 'Frappe Mazapan',
              shortName: 'Frappe Mazapan',
              price: 85,
            },
            {
              id: 'FV10',
              name: 'Frappe Magnum',
              shortName: 'Frappe Magnum',
              price: 85,
            },
          ],
        },
        {
          id: 'PS',
          name: 'Postre',
          shortName: 'Postre',
          price: 75,
          modifierTypes: [
            {
              id: 'PS1',
              name: 'Sabor',
              required: false,
              acceptsMultiple: false,
              modifiers: [
                {
                  id: 'PS1-1',
                  name: '3 chocolates',
                  shortName: '3 chocolates',
                  price: 0,
                },
                {
                  id: 'PS1-2',
                  name: 'Mocaccino',
                  shortName: 'Mocaccino',
                  price: 0,
                },
                {
                  id: 'PS1-3',
                  name: 'Tiramisu',
                  shortName: 'Tiramisu',
                  price: 0,
                },
                {
                  id: 'PS1-4',
                  name: 'Flan rompope',
                  shortName: 'Flan rompope',
                  price: 0,
                },
                {
                  id: 'PS1-5',
                  name: 'Chesecake',
                  shortName: 'Chesecake',
                  price: 0,
                },
              ],
            },
          ],
        },
      ],
    },
    {
      subcategoryName: 'Cocteleria',
      items: [
        { id: 'CARAJ', name: 'Carajillo', shortName: 'Carajillo', price: 90 },
        { id: 'CLERI', name: 'Clericot', shortName: 'Clericot', price: 80 },
        { id: 'CG', name: 'Conga', shortName: 'Conga', price: 75 },
        { id: 'CV', name: 'Copa Vino', shortName: 'Copa Vino', price: 90 },
        {
          id: 'DEST',
          name: 'Destornillador',
          shortName: 'Destornillador',
          price: 75,
        },
        {
          id: 'GMAR',
          name: 'Gin Maracuya',
          shortName: 'Gin Maracuya',
          price: 90,
        },
        { id: 'GPEP', name: 'Gin Pepino', shortName: 'Gin Pepino', price: 90 },
        { id: 'MAR', name: 'Margarita', shortName: 'Margarita', price: 85 },
        { id: 'MOJ', name: 'Mojito', shortName: 'Mojito', price: 100 },
        { id: 'PAL', name: 'Paloma', shortName: 'Paloma', price: 80 },
        { id: 'PSAN', name: 'Palo Santo', shortName: 'Palo Santo', price: 80 },
        {
          id: 'PCOL',
          name: 'Pina Colada',
          shortName: 'Pina Colada',
          price: 75,
        },
        { id: 'PINA', name: 'Pinada', shortName: 'Pinada', price: 70 },
        { id: 'RBL', name: 'Ruso Blanco', shortName: 'Ruso Blanco', price: 85 },
        {
          id: 'SV',
          name: 'Sangria con Vino',
          shortName: 'Sangria con Vino',
          price: 80,
        },
        { id: 'TEQ', name: 'Tequila', shortName: 'Tequila', price: 90 },
        {
          id: 'TV',
          name: 'Tinto de Verano',
          shortName: 'Tinto de Verano',
          price: 90,
        },
        { id: 'VAMP', name: 'Vampiro', shortName: 'Vampiro', price: 80 },
      ],
    },
    {
      subcategoryName: 'Hamburguesas',
      items: [
        {
          id: 'H',
          name: 'Hamburguesa',
          shortName: 'Hamburguesa',
          productVariants: [
            {
              id: 'HV1',
              name: 'Hamburguesa Tradicional',
              shortName: 'H. Tradicional',
              price: 85,
              ingredients:
                'Carne de res, tocino, queso amarillo, queso asadero, cebolla, jitomate, lechuga, chile jalapeño, catsup, aderezo, crema, mostaza',
            },
            {
              id: 'HV2',
              name: 'Hamburguesa Especial',
              shortName: 'H. Especial',
              price: 95,
              ingredients:
                'Carne de res, tocino, pierna, queso amarillo, queso blanco, cebolla, jitomate, lechuga, chile jalapeño, catsup, aderezo, crema, mostaza',
            },
            {
              id: 'HV3',
              name: 'Hamburguesa Hawaiana',
              shortName: 'H. Hawaiana',
              price: 95,
              ingredients:
                'Carne de res, tocino, piña, jamon, queso amarillo, queso blanco, cebolla, jitomate, lechuga, chile jalapeño, catsup, aderezo, crema, mostaza',
            },
            {
              id: 'HV4',
              name: 'Hamburguesa Pollo',
              shortName: 'H. Pollo',
              price: 100,
              ingredients:
                'Pollo a la plancha, tocino, queso amarillo, queso blanco, cebolla, jitomate, lechuga, chile jalapeño, catsup, aderezo, crema, mostaza',
            },
            {
              id: 'HV5',
              name: 'Hamburguesa BBQ',
              shortName: 'H. BBQ',
              price: 100,
              ingredients:
                'Carne de res, salsa bbq, tocino, queso amarillo, queso blanco, cebolla guisada, jitomate, lechuga, chile jalapeño, catsup, aderezo, crema, mostaza',
            },
            {
              id: 'HV6',
              name: 'Hamburguesa Leñazo',
              shortName: 'H. Leñazo',
              price: 110,
              ingredients:
                'Doble carne de sirlon, tocino, queso amarillo, queso blanco, cebolla guisada, jitomate, lechuga, chile jalapeño, catsup, aderezo, crema, mostaza',
            },
            {
              id: 'HV7',
              name: 'Hamburguesa Cubana',
              shortName: 'H. Cubana',
              price: 100,
              ingredients:
                'Carne de res, tocino, pierna, salchicha, jamon, queso amarillo, queso blanco, cebolla, jitomate, lechuga, chile jalapeño, catsup, aderezo, crema, mostaza',
            },
          ],
          modifierTypes: [
            {
              id: 'HM1',
              name: 'Hamburguesa con papas',
              required: false,
              acceptsMultiple: false,
              modifiers: [
                {
                  id: 'HM1-1',
                  name: 'Con papas francesa',
                  shortName: 'C/Francesa',
                  price: 10,
                },
                {
                  id: 'HM1-2',
                  name: 'Con papas gajo',
                  shortName: 'C/Gajo',
                  price: 15,
                },
                {
                  id: 'HM1-3',
                  name: 'Con papas mixtas',
                  shortName: 'C/Mixtas',
                  price: 15,
                },
                {
                  id: 'HM1-4',
                  name: 'Con papas francesa gratinadas',
                  shortName: 'C/Francesa Gratinadas',
                  price: 15,
                },
                {
                  id: 'HM1-5',
                  name: 'Con papas gajo gratinadas',
                  shortName: 'C/Gajo Gratinadas',
                  price: 20,
                },
                {
                  id: 'HM1-6',
                  name: 'Con papas mixtas gratinadas',
                  shortName: 'C/Papas Mixtas Gratinadas',
                  price: 20,
                },
              ],
            },
            {
              id: 'HM2',
              name: 'Hamburguesa extras',
              required: false,
              acceptsMultiple: true,
              modifiers: [
                {
                  id: 'HM2-1',
                  name: 'Doble carne',
                  shortName: 'Doble carne',
                  price: 15,
                },
                {
                  id: 'HM2-2',
                  name: 'Doble pollo',
                  shortName: 'Doble pollo',
                  price: 20,
                },
                {
                  id: 'HM2-3',
                  name: 'Piña',
                  shortName: 'Piña',
                  price: 5,
                },
                {
                  id: 'HM2-4',
                  name: 'Pollo en lugar de carne de res',
                  shortName: 'Res -> Pollo',
                  price: 15,
                },
                {
                  id: 'HM2-5',
                  name: 'Partida',
                  shortName: 'Partida',
                  price: 0,
                },
              ],
            },
            {
              id: 'HM3',
              name: 'Quitar ingredientes Hamburguesa',
              required: false,
              acceptsMultiple: true,
              modifiers: [
                {
                  id: 'HM3-1',
                  name: 'Sin verduras',
                  shortName: 'S/verduras',
                  price: 0,
                },
                {
                  id: 'HM3-2',
                  name: 'Sin tocino',
                  shortName: 'S/tocino',
                  price: 0,
                },
                {
                  id: 'HM3-3',
                  name: 'Sin queso amarillo',
                  shortName: 'S/queso amarillo',
                  price: 0,
                },
                {
                  id: 'HM3-4',
                  name: 'Sin queso blanco',
                  shortName: 'S/queso blanco',
                  price: 0,
                },
                {
                  id: 'HM3-5',
                  name: 'Sin cebolla',
                  shortName: 'S/cebolla',
                  price: 0,
                },
                {
                  id: 'HM3-6',
                  name: 'Sin jitomate',
                  shortName: 'S/jitomate',
                  price: 0,
                },
                {
                  id: 'HM3-7',
                  name: 'Sin lechuga',
                  shortName: 'S/lechuga',
                  price: 0,
                },
                {
                  id: 'HM3-8',
                  name: 'Sin chile jalapeño',
                  shortName: 'S/chile jalapeño',
                  price: 0,
                },
                {
                  id: 'HM3-9',
                  name: 'Sin catsup',
                  shortName: 'S/catsup',
                  price: 0,
                },
                {
                  id: 'HM3-10',
                  name: 'Sin aderezo',
                  shortName: 'S/aderezo',
                  price: 0,
                },
                {
                  id: 'HM3-11',
                  name: 'Sin crema',
                  shortName: 'S/crema',
                  price: 0,
                },
                {
                  id: 'HM3-12',
                  name: 'Sin mostaza',
                  shortName: 'S/mostaza',
                  price: 0,
                },
                {
                  id: 'HM3-13',
                  name: 'Sin pierna',
                  shortName: 'S/pierna',
                  price: 0,
                },
                {
                  id: 'HM3-14',
                  name: 'Sin aderezos',
                  shortName: 'S/aderezos',
                  price: 0,
                },
              ],
            },
          ],
        },
        {
          id: 'DQ',
          name: 'Dedos de queso',
          shortName: 'Dedos queso',
          price: 90,
        },
      ],
    },
    {
      subcategoryName: 'Entradas',
      items: [
        {
          id: 'A',
          name: 'Alitas',
          shortName: 'Alitas',
          productVariants: [
            {
              id: 'AV1',
              name: 'Orden de Alitas BBQ',
              shortName: 'A. BBQ',
              price: 135,
            },
            {
              id: 'AV2',
              name: 'Orden de Alitas Picosas',
              shortName: 'A. Picosas',
              price: 135,
            },
            {
              id: 'AV3',
              name: 'Orden de Alitas Fritas',
              shortName: 'A. Fritas',
              price: 135,
            },
            {
              id: 'AV4',
              name: 'Orden de Alitas Mango Habanero',
              shortName: 'A. Mango Habanero',
              price: 140,
            },
            {
              id: 'AV5',
              name: 'Orden de Alitas Mixtas',
              shortName: 'A. Mixtas',
              price: 135,
            },
            {
              id: 'AV6',
              name: 'Media Orden de Alitas BBQ',
              shortName: '1/2 A. BBQ',
              price: 70,
            },
            {
              id: 'AV7',
              name: 'Media Orden de Alitas Picosas',
              shortName: '1/2 A. Picosas',
              price: 70,
            },
            {
              id: 'AV8',
              name: 'Media Orden de Alitas Fritas',
              shortName: '1/2 A. Fritas',
              price: 70,
            },
            {
              id: 'AV9',
              name: 'Media Orden de Alitas Mango Habanero',
              shortName: '1/2 A. Mango Habanero',
              price: 75,
            },
          ],
          modifierTypes: [
            {
              id: 'AM1',
              name: 'Modificadores Alitas',
              required: false,
              acceptsMultiple: true,
              modifiers: [
                {
                  id: 'AM1-1',
                  name: 'Extra salsa',
                  shortName: 'Extra salsa',
                  price: 10,
                },
                {
                  id: 'AM1-2',
                  name: 'Con aderezo ranch',
                  shortName: 'Aderezo ranch',
                  price: 10,
                },
                {
                  id: 'AM1-3',
                  name: 'Extra chile de aceite',
                  shortName: 'Extra chile aceite',
                  price: 10,
                },
                {
                  id: 'AM1-4',
                  name: 'Extra doradas',
                  shortName: 'Extra doradas',
                  price: 0,
                },
              ],
            },
          ],
        },
        {
          id: 'P',
          name: 'Orden de Papas',
          shortName: 'Papas',
          productVariants: [
            {
              id: 'PV1',
              name: 'Orden de Papas a la Francesa',
              shortName: 'P. Francesa',
              price: 90,
            },
            {
              id: 'PV2',
              name: 'Orden de Papas Gajo',
              shortName: 'P. Gajo',
              price: 105,
            },
            {
              id: 'PV3',
              name: 'Orden de Papas Mixtas francesa y gajo',
              shortName: 'Papas Mixtas',
              price: 105,
            },
            {
              id: 'PV4',
              name: 'Media Orden de Papas a la Francesa',
              shortName: '1/2 Francesa',
              price: 50,
            },
            {
              id: 'PV5',
              name: 'Media Orden de Papas Gajo',
              shortName: '1/2 Gajo',
              price: 65,
            },
          ],
          modifierTypes: [
            {
              id: 'PM1',
              name: 'Papas queso',
              required: true,
              acceptsMultiple: true,
              modifiers: [
                {
                  id: 'PM1-1',
                  name: 'Sin queso',
                  shortName: 'Sin queso',
                  price: 0,
                },
                {
                  id: 'PM1-2',
                  name: 'Con queso',
                  shortName: 'Con queso',
                  price: 0,
                },
                {
                  id: 'PM1-3',
                  name: 'Extra queso',
                  shortName: 'Extra queso',
                  price: 10,
                },
              ],
            },
            {
              id: 'PM2',
              name: 'Papas observaciones',
              required: false,
              acceptsMultiple: true,
              modifiers: [
                {
                  id: 'PM2-1',
                  name: 'Extra aderezo',
                  shortName: 'Extra aderezo',
                  price: 0,
                },
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
          id: 'EN',
          name: 'Ensalada',
          shortName: 'Ensalada',
          productVariants: [
            {
              id: 'EV1',
              name: 'Ensalada de Pollo Chica',
              shortName: 'Ens. Pollo Ch',
              price: 90,
              ingredients:
                'Pollo a la plancha, Chile morron, Elote, Lechuga, Jitomate, Zanahoria, Queso parmesano, Aderezo, Betabel crujiente',
            },
            {
              id: 'EV2',
              name: 'Ensalada de Pollo Grande',
              shortName: 'Ens. Pollo Gde',
              price: 120,
              ingredients:
                'Pollo a la plancha, Chile morron, Elote, Lechuga, Jitomate, Zanahoria, Queso parmesano, Aderezo, Betabel crujiente',
            },
            {
              id: 'EV3',
              name: 'Ensalada de Jamon Chica',
              shortName: 'Ens. Jamon Ch',
              price: 80,
              ingredients:
                'Jamon, Lechuga, Chile morron, Elote, Jitomate, Zanahoria, Queso parmesano, Aderezo, Betabel crujiente',
            },
            {
              id: 'EV4',
              name: 'Ensalada de Jamon Grande',
              shortName: 'Ens. Jamon Gde',
              price: 100,
              ingredients:
                'Jamon, Lechuga, Chile morron, Elote, Jitomate, Zanahoria, Queso parmesano, Aderezo, Betabel crujiente',
            },
            {
              id: 'EV5',
              name: 'Ensalada Vegetal Chica',
              shortName: 'Ens. Vegetal Ch',
              price: 70,
              ingredients:
                'Lechuga, Chile morron, Elote, Jitomate, Zanahoria, Queso parmesano, Aderezo, Betabel crujiente',
            },
            {
              id: 'EV6',
              name: 'Ensalada Vegetal Grande',
              shortName: 'Ens. Vegetal Gde',
              price: 90,
              ingredients:
                'Lechuga, Chile morron, Elote, Jitomate, Zanahoria, Queso parmesano, Aderezo, Betabel crujiente',
            },
          ],
          modifierTypes: [
            {
              id: 'EM1',
              name: 'Extras Ensaladas',
              required: false,
              acceptsMultiple: true,
              modifiers: [
                {
                  id: 'EM1-1',
                  name: 'Con vinagreta',
                  shortName: 'Vinagreta',
                  price: 0,
                },
                {
                  id: 'EM1-2',
                  name: 'Extra pollo',
                  shortName: 'Extra pollo',
                  price: 15,
                },
              ],
            },
            {
              id: 'EM2',
              name: 'Quitar ingredientes Ensalada',
              required: false,
              acceptsMultiple: true,
              modifiers: [
                {
                  id: 'EM2-1',
                  name: 'Sin pollo',
                  shortName: 'Sin pollo',
                  price: 0,
                },
                {
                  id: 'EM2-2',
                  name: 'Sin chile morrón',
                  shortName: 'Sin morrón',
                  price: 0,
                },
                {
                  id: 'EM2-3',
                  name: 'Sin elote',
                  shortName: 'Sin elote',
                  price: 0,
                },
                {
                  id: 'EM2-4',
                  name: 'Sin lechuga',
                  shortName: 'Sin lechuga',
                  price: 0,
                },
                {
                  id: 'EM2-5',
                  name: 'Sin jitomate',
                  shortName: 'Sin jitomate',
                  price: 0,
                },
                {
                  id: 'EM2-6',
                  name: 'Sin zanahoria',
                  shortName: 'Sin zanahoria',
                  price: 0,
                },
                {
                  id: 'EM2-7',
                  name: 'Sin queso parmesano',
                  shortName: 'Sin parmesano',
                  price: 0,
                },
                {
                  id: 'EM2-8',
                  name: 'Sin aderezo',
                  shortName: 'Sin aderezo',
                  price: 0,
                },
                {
                  id: 'EM2-9',
                  name: 'Sin betabel crujiente',
                  shortName: 'Sin betabel crujiente',
                  price: 0,
                },
                {
                  id: 'EM2-10',
                  name: 'Sin jamón',
                  shortName: 'Sin jamón',
                  price: 0,
                },
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
          id: 'PZ',
          name: 'Pizza',
          shortName: 'Pizza',
          productVariants: [
            {
              id: 'PZ-V-1',
              name: 'Pizza Grande',
              shortName: 'Pizza GDE',
              price: 240,
            },
            {
              id: 'PZ-V-2',
              name: 'Pizza Mediana',
              shortName: 'Pizza MED.',
              price: 190,
            },
            {
              id: 'PZ-V-3',
              name: 'Pizza Chica',
              shortName: 'Pizza CH.',
              price: 140,
            },
            {
              id: 'PZ-V-4',
              name: 'Pizza Grande Con Orilla Rellena de Queso',
              shortName: 'Pizza GDE C/R.',
              price: 270,
            },
            {
              id: 'PZ-V-5',
              name: 'Pizza Mediana Con Orilla Rellena de Queso',
              shortName: 'Pizza MED. C/R.',
              price: 220,
            },
            {
              id: 'PZ-V-6',
              name: 'Pizza Chica Con Orilla Rellena de Queso',
              shortName: 'Pizza CH. C/R.',
              price: 160,
            },
          ],
          pizzaFlavors: [
            { id: 'PZ-F-1', name: 'Especial', price: 0 },
            { id: 'PZ-F-2', name: 'Carnes Frias', price: 0 },
            { id: 'PZ-F-3', name: 'Carranza', price: 0 },
            { id: 'PZ-F-4', name: 'Zapata', price: 0 },
            { id: 'PZ-F-5', name: 'Villa', price: 0 },
            { id: 'PZ-F-6', name: 'Margarita', price: 0 },
            { id: 'PZ-F-7', name: 'Adelita', price: 0 },
            { id: 'PZ-F-8', name: 'Hawaiana', price: 0 },
            { id: 'PZ-F-9', name: 'Mexicana', price: 0 },
            { id: 'PZ-F-10', name: 'Rivera', price: 0 },
            { id: 'PZ-F-11', name: 'Kahlo', price: 0 },
            { id: 'PZ-F-12', name: 'Lupita', price: 0 },
            { id: 'PZ-F-13', name: 'Pepperoni', price: 0 },
            { id: 'PZ-F-14', name: '3 Quesos', price: 0 },
            { id: 'PZ-F-15', name: 'La Lena', price: 20 },
            { id: 'PZ-F-16', name: 'La Maria', price: 20 },
            { id: 'PZ-F-17', name: 'Malinche', price: 20 },
            { id: 'PZ-F-18', name: 'Philadelphia', price: 20 },
          ],
          pizzaIngredients: [
            {
              id: 'PZ-I-1',
              name: 'Especial',
              ingredientValue: 4,
              ingredients: 'Pepperoni, Salchicha, Jamon, Salami, Chile morron',
            },
            {
              id: 'PZ-I-2',
              name: 'Carnes Frias',
              ingredientValue: 4,
              ingredients: 'Pepperoni, Salchicha, Jamon, Salami',
            },
            {
              id: 'PZ-I-3',
              name: 'Carranza',
              ingredientValue: 4,
              ingredients: 'Chorizo, Jamon, Chile jalapeño, Jitomate',
            },
            {
              id: 'PZ-I-4',
              name: 'Zapata',
              ingredientValue: 4,
              ingredients: 'Salami, Jamon, Champiñon',
            },
            {
              id: 'PZ-I-5',
              name: 'Villa',
              ingredientValue: 4,
              ingredients: 'Chorizo, Tocino, Piña, Chile jalapeño',
            },
            {
              id: 'PZ-I-6',
              name: 'Margarita',
              ingredientValue: 4,
              ingredients: '3 Quesos, Jitomate, Albahaca',
            },
            {
              id: 'PZ-I-7',
              name: 'Adelita',
              ingredientValue: 4,
              ingredients: 'Jamon, Piña, Arandano',
            },
            {
              id: 'PZ-I-8',
              name: 'Hawaiana',
              ingredientValue: 4,
              ingredients: 'Jamon, Piña',
            },
            {
              id: 'PZ-I-9',
              name: 'Mexicana',
              ingredientValue: 4,
              ingredients: 'Chorizo, Cebolla, Chile jalapeño, Jitomate',
            },
            {
              id: 'PZ-I-10',
              name: 'Rivera',
              ingredientValue: 4,
              ingredients: 'Elote, Champiñon, Chile morron',
            },
            {
              id: 'PZ-I-11',
              name: 'Kahlo',
              ingredientValue: 4,
              ingredients: 'Calabaza, Elote, Champiñon, Jitomate, Chile morron',
            },
            {
              id: 'PZ-I-12',
              name: 'Lupita',
              ingredientValue: 4,
              ingredients: 'Carne molida, Tocino, Cebolla, Chile morron',
            },
            {
              id: 'PZ-I-13',
              name: 'Pepperoni',
              ingredientValue: 4,
              ingredients: 'Pepperoni',
            },
            {
              id: 'PZ-I-14',
              name: 'La Leña',
              ingredientValue: 6,
              ingredients: 'Tocino, Pierna, Chorizo, Carne molida',
            },
            {
              id: 'PZ-I-15',
              name: 'La Maria',
              ingredientValue: 6,
              ingredients: 'Pollo BBQ, Piña, Chile jalapeño',
            },
            {
              id: 'PZ-I-16',
              name: 'Malinche',
              ingredientValue: 6,
              ingredients:
                '3 Quesos, Queso de cabra, Champiñon, Jamon, Chile seco, Albahaca',
            },
            {
              id: 'PZ-I-17',
              name: 'Philadelphia',
              ingredientValue: 6,
              ingredients:
                'Queso philadelphia, Chile jalapeño, Jamon, Albahaca',
            },
            {
              id: 'PZ-I-18',
              name: '3 Quesos',
              ingredientValue: 2,
            },
            {
              id: 'PZ-I-19',
              name: 'Albahaca',
              ingredientValue: 1,
            },
            {
              id: 'PZ-I-20',
              name: 'Arandano',
              ingredientValue: 1,
            },
            {
              id: 'PZ-I-21',
              name: 'Calabaza',
              ingredientValue: 1,
            },
            {
              id: 'PZ-I-22',
              name: 'Cebolla',
              ingredientValue: 1,
            },
            {
              id: 'PZ-I-23',
              name: 'Champiñon',
              ingredientValue: 1,
            },
            {
              id: 'PZ-I-24',
              name: 'Chile Seco',
              ingredientValue: 1,
            },
            {
              id: 'PZ-I-25',
              name: 'Chorizo',
              ingredientValue: 1,
            },
            { id: 'PZ-I-26', name: 'Elote', ingredientValue: 1 },
            {
              id: 'PZ-I-27',
              name: 'Chile Jalapeño',
              ingredientValue: 1,
            },
            { id: 'PZ-I-28', name: 'Jamon', ingredientValue: 1 },
            {
              id: 'PZ-I-29',
              name: 'Jitomate',
              ingredientValue: 1,
            },
            {
              id: 'PZ-I-30',
              name: 'Molida',
              ingredientValue: 1,
            },
            {
              id: 'PZ-I-31',
              name: 'Chile Morron',
              ingredientValue: 1,
            },
            {
              id: 'PZ-I-32',
              name: 'Pierna',
              ingredientValue: 2,
            },
            { id: 'PZ-I-33', name: 'Piña', ingredientValue: 1 },
            {
              id: 'PZ-I-34',
              name: 'Pollo BBQ',
              ingredientValue: 2,
            },
            {
              id: 'PZ-I-35',
              name: 'Queso de cabra',
              ingredientValue: 2,
            },
            {
              id: 'PZ-I-36',
              name: 'Salami',
              ingredientValue: 1,
            },
            {
              id: 'PZ-I-37',
              name: 'Salchicha',
              ingredientValue: 1,
            },
            {
              id: 'PZ-I-38',
              name: 'Tocino',
              ingredientValue: 1,
            },
            {
              id: 'PZ-I-39',
              name: 'Queso',
              ingredientValue: 0,
            },
            {
              id: 'PZ-I-40',
              name: 'Salsa de tomate',
              ingredientValue: 0,
            },
          ],
          modifierTypes: [
            {
              id: 'PZ-M1',
              name: 'Observaciones de Pizza',
              required: false,
              acceptsMultiple: true,
              modifiers: [
                {
                  id: 'PZ-M1-1',
                  name: 'Con catsup',
                  shortName: 'Con catsup',
                  price: 0,
                },
                {
                  id: 'PZ-M1-2',
                  name: 'Extra aderezo',
                  shortName: 'Extra aderezo',
                  price: 0,
                },
                {
                  id: 'PZ-M1-3',
                  name: 'Extra chile de aceite',
                  shortName: 'Extra chile aceite',
                  price: 0,
                },
                {
                  id: 'PZ-M1-4',
                  name: 'Extra dorada',
                  shortName: 'Extra dorada',
                  price: 0,
                },
                {
                  id: 'PZ-M1-4',
                  name: 'Menos dorada',
                  shortName: 'Menos dorada',
                  price: 0,
                },
                {
                  id: 'PZ-M1-5',
                  name: 'Sin salsa',
                  shortName: 'Sin salsa',
                  price: 0,
                },
              ],
            },
          ],
        },
        {
          id: 'CHCH',
          name: 'Chile chillon',
          shortName: 'Chile chillon',
          price: 35,
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
        let product = await productRepository.findOne({
          where: {
            id: item.id,
            subcategory: subcategory,
          },
          relations: ['subcategory'],
        });

        if (!product) {
          product = new Product();
          product.id = item.id;
          product.name = item.name;
          product.shortName = item.shortName;
          product.subcategory = subcategory;
          product.price = 'price' in item ? item.price : null;
          product.imageUrl = `assets/images/${item.name.replaceAll(' ', '').toLowerCase()}.jpg`;
          product.ingredients = (item as any).ingredients || null;

          await productRepository.save(product);
        }

        // Creación de variantes
        if (item.productVariants) {
          for (const variant of item.productVariants) {
            let productVariant = await productVariantRepository.findOne({
              where: {
                id: variant.id,
                product: { id: product.id },
              },
              relations: ['product'],
            });

            if (!productVariant) {
              productVariant = new ProductVariant();
              productVariant.id = variant.id;
              productVariant.name = variant.name;
              productVariant.shortName = variant.shortName;
              productVariant.price = variant.price;
              productVariant.product = product;
              productVariant.ingredients = (variant as any).ingredients || null;
              await productVariantRepository.save(productVariant);
            }
          }
        }

        // Creación de tipos de modificadores y modificadores
        if ('modifierTypes' in item) {
          for (const modifierTypeData of item.modifierTypes) {
            let modifierType = await modifierTypeRepository.findOne({
              where: {
                id: modifierTypeData.id,
                product: { id: product.id },
              },
              relations: ['product'],
            });

            if (!modifierType) {
              modifierType = new ModifierType();
              modifierType.id = modifierTypeData.id;
              modifierType.name = modifierTypeData.name;
              modifierType.product = product;
              modifierType.acceptsMultiple = modifierTypeData.acceptsMultiple;
              modifierType.required = modifierTypeData.required;
              await modifierTypeRepository.save(modifierType);
            }

            for (const modifierData of modifierTypeData.modifiers) {
              let modifier = await modifierRepository.findOne({
                where: {
                  id: modifierData.id,
                  modifierType: { id: modifierType.id },
                },
                relations: ['modifierType'],
              });

              if (!modifier) {
                modifier = new Modifier();
                modifier.id = modifierData.id;
                modifier.name = modifierData.name;
                modifier.shortName = modifierData.shortName;
                modifier.price = modifierData.price;
                modifier.modifierType = modifierType;
                await modifierRepository.save(modifier);
              }
            }
          }
        }

        // Creación de sabores de pizza
        if ('pizzaFlavors' in item) {
          for (const pizzaFlavorData of item.pizzaFlavors) {
            let pizzaFlavor = await pizzaFlavorRepository.findOne({
              where: {
                id: pizzaFlavorData.id,
                product: { id: product.id },
              },
              relations: ['product'],
            });

            if (!pizzaFlavor) {
              pizzaFlavor = new PizzaFlavor();
              pizzaFlavor.id = pizzaFlavorData.id;
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
            let pizzaIngredient = await pizzaIngredientRepository.findOne({
              where: {
                id: pizzaIngredientData.id,
                product: { id: product.id },
              },
              relations: ['product'],
            });

            if (!pizzaIngredient) {
              pizzaIngredient = new PizzaIngredient();
              pizzaIngredient.id = pizzaIngredientData.id;
              pizzaIngredient.name = pizzaIngredientData.name;
              pizzaIngredient.ingredientValue =
                pizzaIngredientData.ingredientValue;
              pizzaIngredient.product = product;
              pizzaIngredient.ingredients =
                (pizzaIngredientData as any).ingredients || null;
              await pizzaIngredientRepository.save(pizzaIngredient);
            }
          }
        }
      }
    }
  }
};
