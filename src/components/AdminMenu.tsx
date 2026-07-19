import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Category, MenuItem, MenuSize } from '../types';
import { 
  Pizza, 
  Plus, 
  Trash2, 
  Edit2, 
  ToggleLeft, 
  ToggleRight, 
  RefreshCw, 
  Search, 
  AlertCircle, 
  CheckCircle2, 
  X, 
  Image, 
  DollarSign, 
  ChevronRight,
  Filter,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FALLBACK_CATEGORIES, FALLBACK_MENU_ITEMS, FALLBACK_MENU_SIZES } from '../hooks/fallbackData';


export const AdminMenu: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [menuSizes, setMenuSizes] = useState<MenuSize[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  
  // Form Fields
  const [itemName, setItemName] = useState('');
  const [itemCategoryId, setItemCategoryId] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [itemImageUrl, setItemImageUrl] = useState('');
  const [itemIsAvailable, setItemIsAvailable] = useState(true);
  
  // Sizes & Prices state for the item form
  const [formSizes, setFormSizes] = useState<{ size: string; price: string }[]>([
    { size: 'Medium 12"', price: '' }
  ]);

  const fetchMenuData = async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Fetch categories
      const { data: catData, error: catError } = await supabase
        .from('categories')
        .select('*');
      if (catError) throw catError;
      setCategories(catData || []);

      // 2. Fetch menu items
      const { data: itemData, error: itemError } = await supabase
        .from('menu_items')
        .select('*');
      if (itemError) throw itemError;
      setMenuItems(itemData || []);

      // 3. Fetch menu sizes
      const { data: sizeData, error: sizeError } = await supabase
        .from('menu_sizes')
        .select('*');
      if (sizeError) throw sizeError;
      setMenuSizes(sizeData || []);

    } catch (err: any) {
      console.warn('Error fetching admin menu data, falling back to local fallback data:', err.message || err);
      setCategories(FALLBACK_CATEGORIES);
      setMenuItems(FALLBACK_MENU_ITEMS);
      setMenuSizes(FALLBACK_MENU_SIZES);
      setError(null); // Clear error because we loaded complete local fallback data gracefully
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuData();
  }, []);

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setItemName('');
    setItemCategoryId(categories[0]?.id || '');
    setItemDescription('');
    setItemImageUrl('');
    setItemIsAvailable(true);
    setFormSizes([{ size: 'Medium 12"', price: '' }]);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: MenuItem) => {
    setEditingItem(item);
    setItemName(item.name);
    setItemCategoryId(item.category_id);
    setItemDescription(item.description || '');
    setItemImageUrl(item.image_url || '');
    setItemIsAvailable(item.is_available !== false);
    
    // Filter sizes for this item
    const relatedSizes = menuSizes
      .filter(s => s.menu_item_id === item.id)
      .map(s => ({
        size: s.size || s.size_name || '',
        price: s.price.toString()
      }));

    setFormSizes(relatedSizes.length > 0 ? relatedSizes : [{ size: 'Medium 12"', price: '' }]);
    setIsModalOpen(true);
  };

  const handleToggleAvailable = async (item: MenuItem) => {
    const updatedStatus = !(item.is_available !== false);
    
    // Optimistic Update
    setMenuItems(prev => prev.map(i => i.id === item.id ? { ...i, is_available: updatedStatus } : i));

    try {
      const { error: updateError } = await supabase
        .from('menu_items')
        .update({ is_available: updatedStatus })
        .eq('id', item.id);

      if (updateError) throw updateError;
      showSuccess(`"${item.name}" availability updated!`);
    } catch (err: any) {
      console.error('Error toggling available status:', err);
      // Revert on error
      setMenuItems(prev => prev.map(i => i.id === item.id ? { ...i, is_available: !updatedStatus } : i));
      alert(`Failed to update availability: ${err.message}`);
    }
  };

  const handleDeleteItem = async (item: MenuItem) => {
    if (!window.confirm(`Are you sure you want to delete "${item.name}"?`)) return;

    try {
      setLoading(true);
      
      // 1. Delete associated sizes first
      const { error: sizesDeleteError } = await supabase
        .from('menu_sizes')
        .delete()
        .eq('menu_item_id', item.id);
      
      if (sizesDeleteError) throw sizesDeleteError;

      // 2. Delete menu item
      const { error: itemDeleteError } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', item.id);

      if (itemDeleteError) throw itemDeleteError;

      showSuccess(`"${item.name}" deleted successfully!`);
      fetchMenuData();
    } catch (err: any) {
      console.error('Error deleting menu item:', err);
      alert(`Failed to delete item: ${err.message}`);
      setLoading(false);
    }
  };

  const handleAddSizeRow = () => {
    setFormSizes([...formSizes, { size: '', price: '' }]);
  };

  const handleRemoveSizeRow = (index: number) => {
    if (formSizes.length <= 1) return;
    setFormSizes(formSizes.filter((_, i) => i !== index));
  };

  const handleSizeChange = (index: number, field: 'size' | 'price', value: string) => {
    const newSizes = [...formSizes];
    newSizes[index][field] = value;
    setFormSizes(newSizes);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim()) return alert('Please enter an item name.');
    if (!itemCategoryId) return alert('Please select a category.');
    
    // Validate sizes and prices
    const validSizes = formSizes.filter(s => s.size.trim() && s.price.trim());
    if (validSizes.length === 0) {
      return alert('Please specify at least one valid size and price.');
    }

    try {
      setLoading(true);
      setError(null);

      if (editingItem) {
        // --- EDIT MODE ---
        // 1. Update MenuItem
        const { error: updateError } = await supabase
          .from('menu_items')
          .update({
            name: itemName,
            category_id: itemCategoryId,
            description: itemDescription,
            image_url: itemImageUrl || null,
            is_available: itemIsAvailable
          })
          .eq('id', editingItem.id);

        if (updateError) throw updateError;

        // 2. Refresh Sizes: delete and re-insert
        const { error: sizesDeleteError } = await supabase
          .from('menu_sizes')
          .delete()
          .eq('menu_item_id', editingItem.id);

        if (sizesDeleteError) throw sizesDeleteError;

        const sizesToInsert = validSizes.map(s => ({
          menu_item_id: editingItem.id,
          size: s.size,
          size_name: s.size,
          price: parseFloat(s.price)
        }));

        const { error: sizesInsertError } = await supabase
          .from('menu_sizes')
          .insert(sizesToInsert);

        if (sizesInsertError) throw sizesInsertError;

        showSuccess(`"${itemName}" updated successfully!`);
      } else {
        // --- ADD MODE ---
        // 1. Insert MenuItem
        const { data: newItem, error: insertError } = await supabase
          .from('menu_items')
          .insert({
            name: itemName,
            category_id: itemCategoryId,
            description: itemDescription,
            image_url: itemImageUrl || null,
            is_available: itemIsAvailable
          })
          .select()
          .single();

        if (insertError) throw insertError;
        if (!newItem) throw new Error('No record returned from menu item creation.');

        // 2. Insert sizes
        const sizesToInsert = validSizes.map(s => ({
          menu_item_id: newItem.id,
          size: s.size,
          size_name: s.size,
          price: parseFloat(s.price)
        }));

        const { error: sizesInsertError } = await supabase
          .from('menu_sizes')
          .insert(sizesToInsert);

        if (sizesInsertError) throw sizesInsertError;

        showSuccess(`"${itemName}" created successfully!`);
      }

      setIsModalOpen(false);
      fetchMenuData();
    } catch (err: any) {
      console.error('Error saving menu item:', err);
      alert(`Save failed: ${err.message}`);
      setLoading(false);
    }
  };

  const showSuccess = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 3000);
  };

  // Filter & Search Logic
  const filteredItems = menuItems.filter(item => {
    const matchesCategory = selectedCategoryFilter === 'all' || item.category_id === selectedCategoryFilter;
    
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      item.name.toLowerCase().includes(searchLower) ||
      (item.description && item.description.toLowerCase().includes(searchLower));

    return matchesCategory && matchesSearch;
  });

  const getCategoryName = (catId: string) => {
    const cat = categories.find(c => c.id === catId);
    return cat ? cat.name : 'Uncategorized';
  };

  const getDisplayPriceRange = (itemId: string) => {
    const relatedSizes = menuSizes.filter(s => s.menu_item_id === itemId);
    if (relatedSizes.length === 0) return '₹-';
    
    const prices = relatedSizes.map(s => s.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    if (minPrice === maxPrice) {
      return `₹${minPrice}`;
    }
    return `₹${minPrice} - ₹${maxPrice}`;
  };

  return (
    <div className="space-y-6">

      {/* Page Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-black text-gray-950 font-sans">Menu Management</h1>
          <p className="text-sm text-stone-500 font-medium">Add signature pizzas, edit sizing rates, and control current stock.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => fetchMenuData()}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 hover:border-stone-300 font-bold text-xs tracking-wider uppercase rounded-xl transition-all shadow-xs cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#e63946] hover:bg-[#d62839] text-white font-bold text-xs tracking-wider uppercase rounded-xl transition-all shadow-md shadow-red-500/10 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add New Item
          </button>
        </div>
      </div>

      {/* Toast Notification Banner */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-800 text-xs font-semibold flex items-center gap-2.5 shadow-xs"
          >
            <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 flex-shrink-0" />
            <span>{success}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter and Search Controls */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-stone-100 shadow-xs flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            placeholder="Search products by title, ingredients, details..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 focus:border-red-400 rounded-xl text-xs font-semibold text-stone-800 placeholder-stone-400 outline-none transition-all"
          />
        </div>

        {/* Categories selector */}
        <div className="flex items-center gap-2 shrink-0">
          <Filter className="w-4 h-4 text-stone-400" />
          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="px-3.5 py-2.5 bg-stone-50 border border-stone-200 hover:border-stone-300 rounded-xl text-xs font-bold text-stone-700 outline-none transition-all cursor-pointer"
          >
            <option value="all">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <RefreshCw className="w-10 h-10 text-[#e63946] animate-spin" />
          <p className="text-sm font-semibold text-stone-500">Querying product archives...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-50 border border-red-100 rounded-3xl text-red-600 text-sm font-semibold flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p>Error retrieving menu items</p>
            <p className="text-xs font-normal text-red-500">{error}</p>
          </div>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white rounded-3xl border border-stone-100 p-16 text-center shadow-xs">
          <Pizza className="w-12 h-12 text-stone-300 mx-auto mb-4" />
          <h3 className="font-bold text-stone-800">No items found</h3>
          <p className="text-xs text-stone-400 mt-1 max-w-sm mx-auto">
            Try adjusting your search query or filters. You can also click the "Add New Item" button to create one.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-stone-100 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-medium border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-100 text-stone-500 uppercase tracking-wider font-mono text-[10px]">
                  <th className="py-4 px-5">Food Item</th>
                  <th className="py-4 px-5">Category</th>
                  <th className="py-4 px-5">Sizing Prices</th>
                  <th className="py-4 px-5 text-center">In Stock Status</th>
                  <th className="py-4 px-5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredItems.map((item) => {
                  const isAvailable = item.is_available !== false;
                  return (
                    <tr key={item.id} className="hover:bg-stone-50/40 transition-colors">
                      {/* Image + Title */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          {item.image_url ? (
                            <img
                              src={item.image_url}
                              alt={item.name}
                              className="w-12 h-12 object-cover rounded-xl border border-stone-100 shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-red-50 text-[#e63946] border border-red-100 rounded-xl flex items-center justify-center shrink-0">
                              <Pizza className="w-5 h-5 stroke-[2]" />
                            </div>
                          )}
                          <div className="max-w-xs sm:max-w-md">
                            <div className="font-bold text-stone-900 text-sm leading-tight">{item.name}</div>
                            {item.description && (
                              <p className="text-[10px] text-stone-400 line-clamp-1 mt-0.5" title={item.description}>
                                {item.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-5 font-semibold text-stone-600">
                        {getCategoryName(item.category_id)}
                      </td>

                      {/* Prices */}
                      <td className="py-3.5 px-5 font-extrabold text-stone-900 font-sans text-[13px]">
                        {getDisplayPriceRange(item.id)}
                      </td>

                      {/* Available status */}
                      <td className="py-3.5 px-5 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleAvailable(item)}
                          className="inline-flex items-center gap-1 cursor-pointer select-none outline-none focus:outline-none"
                        >
                          {isAvailable ? (
                            <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-100 font-extrabold text-[10px] uppercase">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              Active
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 bg-stone-100 text-stone-400 px-2 py-0.5 rounded-full border border-stone-200 font-extrabold text-[10px] uppercase">
                              <span className="w-1.5 h-1.5 rounded-full bg-stone-300" />
                              Sold Out
                            </div>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-5 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenEditModal(item)}
                            className="p-1.5 hover:bg-stone-50 border border-stone-100 hover:border-stone-200 text-stone-500 hover:text-[#1d3557] rounded-lg transition-all cursor-pointer shadow-xs active:scale-95"
                            title="Edit details"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item)}
                            className="p-1.5 hover:bg-red-50 border border-stone-100 hover:border-red-100 text-stone-400 hover:text-[#e63946] rounded-lg transition-all cursor-pointer shadow-xs active:scale-95"
                            title="Delete item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD/EDIT MODAL DIALOG */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black"
            />

            {/* Modal Body wrapper */}
            <div className="flex min-h-screen items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ type: 'spring', damping: 25, stiffness: 210 }}
                className="relative w-full max-w-2xl bg-white rounded-3xl shadow-xl border border-stone-100 overflow-hidden flex flex-col"
              >
                {/* Header */}
                <div className="bg-stone-50 px-6 py-4 border-b border-stone-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-[#e63946] text-white rounded-lg">
                      <Pizza className="w-4 h-4" />
                    </div>
                    <h3 className="font-serif text-base font-extrabold text-stone-900">
                      {editingItem ? 'Edit Food Menu Item' : 'Add New Menu Item'}
                    </h3>
                  </div>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="p-1.5 hover:bg-stone-100 rounded-xl text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Form fields */}
                <form onSubmit={handleSaveItem} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                  
                  {/* Row 1: Name + Category */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold font-mono uppercase tracking-wider text-stone-400 mb-1.5">Food Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Double Cheese Margherita"
                        value={itemName}
                        onChange={(e) => setItemName(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 focus:border-red-400 rounded-xl text-xs font-semibold text-stone-800 placeholder-stone-400 outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold font-mono uppercase tracking-wider text-stone-400 mb-1.5">Category *</label>
                      <select
                        required
                        value={itemCategoryId}
                        onChange={(e) => setItemCategoryId(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 focus:border-red-400 rounded-xl text-xs font-bold text-stone-700 outline-none transition-all cursor-pointer"
                      >
                        <option value="" disabled>Select Category</option>
                        {categories.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-[10px] font-bold font-mono uppercase tracking-wider text-stone-400 mb-1.5">Description / Ingredients</label>
                    <textarea
                      placeholder="e.g. Loaded with extra stringy mozzarella, San Marzano cherry tomatoes, sweet basil leaves, and locally sourced extra virgin olive oil."
                      value={itemDescription}
                      onChange={(e) => setItemDescription(e.target.value)}
                      rows={3}
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 focus:border-red-400 rounded-xl text-xs font-semibold text-stone-800 placeholder-stone-400 outline-none transition-all resize-none"
                    />
                  </div>

                  {/* Image URL & Toggle */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold font-mono uppercase tracking-wider text-stone-400 mb-1.5">Image URL</label>
                      <input
                        type="url"
                        placeholder="e.g. https://images.unsplash.com/..."
                        value={itemImageUrl}
                        onChange={(e) => setItemImageUrl(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 focus:border-red-400 rounded-xl text-xs font-semibold text-stone-800 placeholder-stone-400 outline-none transition-all"
                      />
                    </div>

                    <div className="flex flex-col justify-end">
                      <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-200/60 h-10.5">
                        <span className="text-xs font-bold text-stone-700">Available immediately in stock</span>
                        <button
                          type="button"
                          onClick={() => setItemIsAvailable(!itemIsAvailable)}
                          className="text-[#e63946] focus:outline-none cursor-pointer"
                        >
                          {itemIsAvailable ? (
                            <ToggleRight className="w-8 h-8" />
                          ) : (
                            <ToggleLeft className="w-8 h-8 text-stone-300" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* SIZES AND PRICES */}
                  <div className="border-t border-stone-100 pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-bold text-xs text-stone-800">Sizing Variations & Rates</h4>
                        <p className="text-[10px] text-stone-400 mt-0.5">Specify at least one size name and price in rupees (₹).</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddSizeRow}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-[#e63946]/5 hover:bg-[#e63946] text-[#e63946] hover:text-white font-bold text-[10px] tracking-wider uppercase rounded-lg transition-all border border-[#e63946]/10 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Variation
                      </button>
                    </div>

                    <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                      {formSizes.map((row, index) => (
                        <div key={index} className="flex gap-2.5 items-center">
                          {/* Sizing description label */}
                          <div className="flex-1">
                            <input
                              type="text"
                              required
                              placeholder='e.g. Medium 12" or Regular'
                              value={row.size}
                              onChange={(e) => handleSizeChange(index, 'size', e.target.value)}
                              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 focus:border-red-400 rounded-xl text-xs font-semibold text-stone-800 placeholder-stone-400 outline-none transition-all"
                            />
                          </div>

                          {/* Price in INR */}
                          <div className="w-32 relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
                            <input
                              type="number"
                              required
                              min="0"
                              step="0.01"
                              placeholder="Price"
                              value={row.price}
                              onChange={(e) => handleSizeChange(index, 'price', e.target.value)}
                              className="w-full pl-8 pr-3 py-2.5 bg-stone-50 border border-stone-200 focus:border-red-400 rounded-xl text-xs font-semibold text-stone-800 placeholder-stone-400 outline-none transition-all"
                            />
                          </div>

                          {/* Delete row */}
                          <button
                            type="button"
                            disabled={formSizes.length <= 1}
                            onClick={() => handleRemoveSizeRow(index)}
                            className="p-2 bg-stone-50 border border-stone-100 hover:border-red-100 hover:bg-red-50 text-stone-400 hover:text-[#e63946] rounded-xl transition-all cursor-pointer disabled:opacity-40"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="border-t border-stone-100 pt-5 flex items-center justify-end gap-3.5">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2.5 bg-stone-50 hover:bg-stone-100 text-stone-600 font-bold text-xs tracking-wider uppercase rounded-xl transition-colors cursor-pointer border border-stone-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs tracking-wider uppercase rounded-xl transition-colors cursor-pointer shadow-md shadow-red-600/10"
                    >
                      {loading ? 'Processing...' : editingItem ? 'Save Updates' : 'Publish Menu Item'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
