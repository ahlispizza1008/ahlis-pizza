import { Category, MenuItem, MenuSize } from '../types';

export const FALLBACK_CATEGORIES: Category[] = [
  {
    id: '06f1ac8d-bef9-409e-867a-6641745ac24c',
    name: 'Simply Veg Pizza',
    description: 'Fresh and classic vegetable pizzas with our signature cheese blend.'
  },
  {
    id: '1a65ce80-362d-4820-89fb-b8e4b4e1a093',
    name: 'Veg Treat Pizza',
    description: 'Premium gourmet combinations loaded with fresh farm toppings.'
  },
  {
    id: 'c72a18ec-cba1-4a29-862a-7b5fc4319fdf',
    name: 'Cheese Loaded Pizza',
    description: 'Indulgent, extra cheesy pizzas for cheese lovers.'
  },
  {
    id: '4fff68bb-f869-4a9b-89fa-63b995fd4876',
    name: 'Gourmet Burgers',
    description: 'Crispy, satisfying vegetarian burgers.'
  },
  {
    id: 'e8892b56-7283-470b-89e0-c9e817779541',
    name: 'Artisanal Pasta',
    description: 'Delicious hot pastas tossed in freshly-prepared sauces.'
  }
];

export const FALLBACK_MENU_ITEMS: MenuItem[] = [
  // Simply Veg
  {
    id: '1f47eb6f-570a-4bd4-9b83-26701709cfe1',
    category_id: '06f1ac8d-bef9-409e-867a-6641745ac24c',
    name: 'Sweet Corn Pizza',
    description: 'Classic single topping pizza with golden sweet corn and molten mozzarella.',
    image_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80',
    is_available: true
  },
  {
    id: '36e9256c-2de3-4054-b4d5-dc3e5ed6ea36',
    category_id: '06f1ac8d-bef9-409e-867a-6641745ac24c',
    name: 'Country Feast',
    description: 'Crisp capsicum, fresh tomatoes, and crunchy sweet corn on our fresh pan base.',
    image_url: 'https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=600&auto=format&fit=crop&q=80',
    is_available: true
  },
  // Veg Treat
  {
    id: '7351e981-1fa1-412f-a325-556b46be5f50',
    category_id: '1a65ce80-362d-4820-89fb-b8e4b4e1a093',
    name: 'Exotica Gourmet',
    description: 'Gourmet experience with red paprika, baby corn, green olives, jalapenos, and loaded cheese.',
    image_url: 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=600&auto=format&fit=crop&q=80',
    is_available: true
  },
  {
    id: 'c42979e4-464b-485a-a0c8-e410da9fea02',
    category_id: '1a65ce80-362d-4820-89fb-b8e4b4e1a093',
    name: 'Tandoori Paneer Pizza',
    description: 'Spiced tandoori paneer chunks, crisp capsicum, and fresh red onions with spicy herb drizzle.',
    image_url: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=600&auto=format&fit=crop&q=80',
    is_available: true
  },
  // Cheese Loaded
  {
    id: 'bd322e4f-4da8-402b-9f4d-9c8d903acc48',
    category_id: 'c72a18ec-cba1-4a29-862a-7b5fc4319fdf',
    name: 'Cheese Volcano Pizza',
    description: 'Double cheese burst pan crust overflowing with hot, creamy molten cheese blend.',
    image_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80',
    is_available: true
  },
  // Burgers
  {
    id: '24574f3d-7689-47a2-8928-6a06688157d5',
    category_id: '4fff68bb-f869-4a9b-89fa-63b995fd4876',
    name: 'Classic Veggie Burger',
    description: 'Handcrafted seasoned potato and herb patty with fresh lettuce, tomatoes, and house mayo.',
    image_url: 'https://images.unsplash.com/photo-1508737027454-e6454ef45afd?w=600&auto=format&fit=crop&q=80',
    is_available: true
  },
  {
    id: '1b39b0a2-6c44-46f8-8fcf-92c80707c5b4',
    category_id: '4fff68bb-f869-4a9b-89fa-63b995fd4876',
    name: 'Crunchy Paneer Burger',
    description: 'Crisp battered paneer slab dressed with tandoori sauce, onions, and shredded cabbage.',
    image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
    is_available: true
  },
  // Pasta
  {
    id: '3d8e5245-6297-486f-a530-b3759462362a',
    category_id: 'e8892b56-7283-470b-89e0-c9e817779541',
    name: 'Red Sauce Pasta',
    description: 'Penne pasta cooked in our custom tang red sauce loaded with premium Italian herbs.',
    image_url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80',
    is_available: true
  }
];

export const FALLBACK_MENU_SIZES: MenuSize[] = [
  // Sweet Corn Pizza Sizes
  {
    id: 'size-sc-reg',
    menu_item_id: '1f47eb6f-570a-4bd4-9b83-26701709cfe1',
    size: 'Regular',
    size_name: 'Regular',
    price: 99
  },
  {
    id: 'size-sc-med',
    menu_item_id: '1f47eb6f-570a-4bd4-9b83-26701709cfe1',
    size: 'Medium',
    size_name: 'Medium',
    price: 199
  },
  // Country Feast Sizes
  {
    id: 'size-cf-reg',
    menu_item_id: '36e9256c-2de3-4054-b4d5-dc3e5ed6ea36',
    size: 'Regular',
    size_name: 'Regular',
    price: 149
  },
  {
    id: 'size-cf-med',
    menu_item_id: '36e9256c-2de3-4054-b4d5-dc3e5ed6ea36',
    size: 'Medium',
    size_name: 'Medium',
    price: 279
  },
  // Exotica Gourmet
  {
    id: 'size-ex-med',
    menu_item_id: '7351e981-1fa1-412f-a325-556b46be5f50',
    size: 'Medium',
    size_name: 'Medium',
    price: 320
  },
  {
    id: 'size-ex-lrg',
    menu_item_id: '7351e981-1fa1-412f-a325-556b46be5f50',
    size: 'Large',
    size_name: 'Large',
    price: 470
  },
  // Tandoori Paneer Pizza
  {
    id: 'size-tp-med',
    menu_item_id: 'c42979e4-464b-485a-a0c8-e410da9fea02',
    size: 'Medium',
    size_name: 'Medium',
    price: 320
  },
  {
    id: 'size-tp-lrg',
    menu_item_id: 'c42979e4-464b-485a-a0c8-e410da9fea02',
    size: 'Large',
    size_name: 'Large',
    price: 470
  },
  // Cheese Volcano Pizza
  {
    id: 'size-cv-med',
    menu_item_id: 'bd322e4f-4da8-402b-9f4d-9c8d903acc48',
    size: 'Medium',
    size_name: 'Medium',
    price: 299
  },
  // Classic Veggie Burger
  {
    id: 'size-vb-reg',
    menu_item_id: '24574f3d-7689-47a2-8928-6a06688157d5',
    size: 'Regular',
    size_name: 'Regular',
    price: 79
  },
  // Crunchy Paneer Burger
  {
    id: 'size-cpb-reg',
    menu_item_id: '1b39b0a2-6c44-46f8-8fcf-92c80707c5b4',
    size: 'Regular',
    size_name: 'Regular',
    price: 129
  },
  // Red Sauce Pasta
  {
    id: 'size-rsp-reg',
    menu_item_id: '3d8e5245-6297-486f-a530-b3759462362a',
    size: 'Regular',
    size_name: 'Regular',
    price: 110
  }
];
