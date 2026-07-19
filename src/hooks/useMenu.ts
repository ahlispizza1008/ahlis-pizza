import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Category, MenuItem, MenuSize } from '../types';

export function useMenu() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [menuSizes, setMenuSizes] = useState<MenuSize[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMenuData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch categories
      const { data: catData, error: catError } = await supabase
        .from('categories')
        .select('*');

      if (catError) throw catError;

      // Fetch menu items
      const { data: itemData, error: itemError } = await supabase
        .from('menu_items')
        .select('*');

      if (itemError) throw itemError;

      // Fetch menu sizes
      const { data: sizeData, error: sizeError } = await supabase
        .from('menu_sizes')
        .select('*');

      if (sizeError) throw sizeError;

      setCategories(catData || []);
      setMenuItems(itemData || []);
      setMenuSizes(sizeData || []);

    } catch (err: any) {
      console.error('Failed to load menu data:', err);
      setError('Unable to load menu. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuData();
  }, []);

  return {
    categories,
    menuItems,
    menuSizes,
    loading,
    error,
    refetch: fetchMenuData
  };
}