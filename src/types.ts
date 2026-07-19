export interface Category {
  id: string; // UUID
  name: string;
  description?: string;
  image_url?: string;
  created_at?: string;
}

export interface MenuItem {
  id: string; // UUID
  category_id: string; // UUID
  name: string;
  description?: string;
  price?: number;
  image_url?: string;
  is_available?: boolean;
  created_at?: string;
}

export interface MenuSize {
  id: string; // UUID
  menu_item_id: string; // UUID
  size: string; // e.g., "Small", "Medium", "Large", "Regular"
  size_name?: string;
  price: number;
  created_at?: string;
}

export interface CartItem {
  id: string; // Unique combined key or random ID for cart item
  menuItem: MenuItem;
  selectedSize: MenuSize | null;
  quantity: number;
}

