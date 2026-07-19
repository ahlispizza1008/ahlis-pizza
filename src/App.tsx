import React, { useState, useMemo, useEffect } from 'react';
import { useMenu } from './hooks/useMenu';
import { getOrderDisplayId } from './utils/orderUtils';
import { MenuItemCard } from './components/MenuItemCard';
import { Category, MenuItem, MenuSize, CartItem } from './types';
import { supabase } from './supabaseClient';
import { 
  Search, 
  Sparkles, 
  Wifi, 
  AlertCircle, 
  RotateCw, 
  UtensilsCrossed, 
  BookOpen,
  Coffee,
  CheckCircle2,
  Copy,
  Terminal,
  ExternalLink,
  ShieldAlert,
  Check,
  ShoppingBag,
  MapPin,
  Phone,
  Clock,
  X,
  Plus,
  Minus,
  Trash2,
  Pizza,
  ArrowRight,
  Heart,
  Menu,
  Instagram,
  MessageCircle,
  LogIn,
  Key,
  Shield,
  Mail,
  Lock,
  Truck,
  Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from './contexts/AuthContext';
import { LoginPage } from './components/LoginPage';
import { SignupPage } from './components/SignupPage';
import { MyOrdersPage } from './components/MyOrdersPage';
import { AdminLayout } from './components/AdminLayout';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminOrders } from './components/AdminOrders';
import { AdminMenu } from './components/AdminMenu';
import { requestAndGetFCMToken } from './firebase';

const getTodayDateString = () => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const getCurrentTimeString = () => {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
};

export default function App() {
  const { 
    categories, 
    menuItems, 
    menuSizes, 
    loading, 
    error, 
    errorDetails, 
    isPreviewMode, 
    enablePreviewMode, 
    refetch 
  } = useMenu();
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const [showDbDiagnostics, setShowDbDiagnostics] = useState(false);
  const [appNotification, setAppNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    const originalAlert = window.alert;
    window.alert = (message: string) => {
      setAppNotification({ message, type: 'info' });
    };
    return () => {
      window.alert = originalAlert;
    };
  }, []);

  useEffect(() => {
    let timer: any;
    if (appNotification) {
      timer = setTimeout(() => {
        setAppNotification(null);
      }, 5000);
    }
    return () => clearTimeout(timer);
  }, [appNotification]);
  
  // Shopping Cart States
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Checkout & Payment States
  const [isCheckoutStep, setIsCheckoutStep] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'upi'>('cod');
  const [userUpiId, setUserUpiId] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Simplified Order Type and Conditional Fields
  const [orderType, setOrderType] = useState<'delivery' | 'dine-in'>('delivery');
  const [houseNo, setHouseNo] = useState('');
  const [streetArea, setStreetArea] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [landmark, setLandmark] = useState('');
  const [numberOfPersons, setNumberOfPersons] = useState('');
  const [dineInDate, setDineInDate] = useState(getTodayDateString());
  const [dineInTime, setDineInTime] = useState(getCurrentTimeString());
  const [placedOrderDetails, setPlacedOrderDetails] = useState<{
    id: string;
    name: string;
    phone: string;
    address: string;
    paymentMethod: 'cod' | 'upi' | 'dine-in';
    total: number;
    itemsCount: number;
    whatsappUrl?: string;
    order_number?: number;
  } | null>(null);

  // Global SPA Router State
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  // Admin Verification & Protection State
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isAdminChecking, setIsAdminChecking] = useState(true);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Initialize Firebase Cloud Messaging (FCM) Push Notifications
  useEffect(() => {
    const initPushNotifications = async () => {
      try {
        await requestAndGetFCMToken();
      } catch (err) {
        console.warn('FCM registration skipped or failed:', err);
      }
    };
    initPushNotifications();
  }, []);

  const navigateTo = (path: string) => {
    window.history.pushState(null, '', path);
    setCurrentPath(path);
  };

  // Global Auth Integration
  const { user, session, loading: authLoading, signOut } = useAuth();
  
  const handleLogout = async () => {
    try {
      await signOut();
      navigateTo('/');
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };
  
  // Automatically redirect to homepage after successful login
  useEffect(() => {
    if (user && (currentPath === '/login' || currentPath === '/signup')) {
      navigateTo('/');
    }
  }, [user, currentPath]);

  // Protect Cart, Checkout and corresponding routes from unauthenticated access
  useEffect(() => {
    if (authLoading) return;
    
    if (isCartOpen || isCheckoutStep || currentPath === '/cart' || currentPath === '/checkout' || currentPath === '/my-orders') {
      if (!user) {
        setIsCartOpen(false);
        setIsCheckoutStep(false);
        navigateTo('/login');
        alert("Login required to continue.");
      }
    }
  }, [authLoading, user, isCartOpen, isCheckoutStep, currentPath]);

  // Check admin status whenever the authenticated user changes
  useEffect(() => {
    const verifyAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        setIsAdminChecking(false);
        return;
      }
      try {
        setIsAdminChecking(true);
        // Fetch role from 'users' table
        const { data, error } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();

        let role = data?.role;

        // Auto-provision developer or admin-labeled email as admin in 'users' table
        if (!data && (user.email === 'naveenkamboj353@gmail.com' || user.email === 'naveenkamboj3535@gmail.com' || user.email?.includes('admin'))) {
          await supabase
            .from('users')
            .upsert({ id: user.id, email: user.email, role: 'admin' });
          role = 'admin';
        }

        // Fallback for mock users or client testing
        if (!role) {
          role = localStorage.getItem('mock_user_role') || (user.email?.includes('admin') ? 'admin' : 'user');
        }

        setIsAdmin(role === 'admin');
      } catch (err) {
        console.error("Error checking admin status:", err);
        // Fallback check
        const hasAdminFallback = user.email === 'naveenkamboj353@gmail.com' || user.email?.includes('admin') || localStorage.getItem('mock_user_role') === 'admin';
        setIsAdmin(hasAdminFallback);
      } finally {
        setIsAdminChecking(false);
      }
    };
    verifyAdminStatus();
  }, [user]);

  // Enforce admin route protection
  useEffect(() => {
    const enforceAdminProtection = () => {
      if (currentPath.startsWith('/admin')) {
        if (isAdminChecking) return;
        
        if (!user || !isAdmin) {
          alert("Access Denied");
          navigateTo('/');
        }
      }
    };
    enforceAdminProtection();
  }, [currentPath, user, isAdmin, isAdminChecking]);

  // Auto-select first category when loaded
  useEffect(() => {
    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0].id);
    }
  }, [categories, selectedCategory]);

  // Reset search when selected category changes
  useEffect(() => {
    setSearchQuery('');
  }, [selectedCategory]);

  // Group items by category for listing
  const filteredCategories = useMemo(() => {
    if (!selectedCategory) {
      return [];
    }
    return categories.filter(cat => cat.id === selectedCategory);
  }, [categories, selectedCategory]);

  // Map of menu item id to its sizes
  const sizesByItemId = useMemo(() => {
    const map: Record<string, typeof menuSizes> = {};
    menuSizes.forEach(size => {
      if (!map[size.menu_item_id]) {
        map[size.menu_item_id] = [];
      }
      map[size.menu_item_id].push(size);
    });
    return map;
  }, [menuSizes]);

  // Handler for clearing all filters
  const handleResetFilters = () => {
    if (categories.length > 0) {
      setSelectedCategory(categories[0].id);
    }
    setSearchQuery('');
  };

  // Cart Operations
  const handleAddToCart = async (item: MenuItem, size: MenuSize | null) => {
    // Check if user is logged in
    if (!user) {
      alert("Please login to add items to cart.");
      setTimeout(() => {
        navigateTo('/login');
      }, 1500);
      return;
    }

    const cartItemId = `${item.id}-${size ? size.id : 'default'}`;
    setCart(prev => {
      const existingIndex = prev.findIndex(ci => ci.id === cartItemId);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += 1;
        return updated;
      } else {
        return [...prev, {
          id: cartItemId,
          menuItem: item,
          selectedSize: size,
          quantity: 1
        }];
      }
    });
  };

  const handleRemoveFromCart = (cartItemId: string) => {
    setCart(prev => prev.filter(ci => ci.id !== cartItemId));
  };

  const handleUpdateQuantity = (cartItemId: string, amount: number) => {
    setCart(prev => prev.map(ci => {
      if (ci.id === cartItemId) {
        const newQty = ci.quantity + amount;
        return newQty > 0 ? { ...ci, quantity: newQty } : ci;
      }
      return ci;
    }).filter(ci => ci.quantity > 0));
  };

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => {
      const itemPrice = item.selectedSize ? item.selectedSize.price : (item.menuItem.price || 0);
      return sum + (itemPrice * item.quantity);
    }, 0);
  }, [cart]);

  const cartItemsCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const handleProceedToCheckout = () => {
    if (cartTotal < 250) return;
    if (!user) {
      alert("Please login to place an order.");
      setIsCartOpen(false);
      navigateTo('/login');
      return;
    }
    setIsCheckoutStep(true);
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    // 3. If no user: Redirect to login page before placing order.
    if (!user) {
      alert("Please sign in to place an order.");
      setIsCartOpen(false);
      navigateTo('/login');
      return;
    }

    if (cartTotal < 250) return;

    if (!customerName.trim() || !customerPhone.trim()) {
      alert("Please fill in your name and phone number.");
      return;
    }

    let finalAddress = '';
    if (orderType === 'delivery') {
      if (!houseNo.trim() || !streetArea.trim() || !city.trim() || !pincode.trim()) {
        alert("Please fill in all required delivery address fields.");
        return;
      }
      finalAddress = `${houseNo.trim()}, ${streetArea.trim()}, ${city.trim()} - ${pincode.trim()}${landmark.trim() ? ` (Landmark: ${landmark.trim()})` : ''}`;
    } else {
      if (!numberOfPersons.trim() || !dineInDate || !dineInTime) {
        alert("Please fill in all required Dine-In details.");
        return;
      }
      finalAddress = `Dine-In (${numberOfPersons} persons) on ${dineInDate} at ${dineInTime}`;
    }

    setIsPlacingOrder(true);

    let dbOrderId: string | null = null;
    let dbOrderNumber: number | undefined = undefined;

    try {
      // 1. Insert into "orders" table
      const orderInsertPayload = {
        customer_name: customerName,
        customer_phone: customerPhone,
        total_amount: Math.round(cartTotal),
        payment_method: orderType === 'dine-in' ? 'dine-in' : paymentMethod,
        order_status: 'received',
        payment_status: 'pending',
        delivery_address: finalAddress,
        upi_id: (orderType === 'delivery' && paymentMethod === 'upi') ? userUpiId : null,
        user_id: (user && session) ? user.id : null,
        special_instructions: specialInstructions || null
      };

      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([orderInsertPayload])
        .select();

      // 4. If any error occurs: Log error in console & Show error message
      if (orderError) {
        console.error("Error inserting order:", orderError);
        alert(`Failed to place order: ${orderError.message}`);
        setIsPlacingOrder(false);
        return;
      }

      if (!orderData || orderData.length === 0) {
        const noDataErr = new Error("No data returned from order insertion.");
        console.error("Error inserting order: No data returned", noDataErr);
        alert("Failed to place order: No order data returned from the database.");
        setIsPlacingOrder(false);
        return;
      }

      // 2. After successful order insert, get inserted order id
      dbOrderId = orderData[0].id;
      dbOrderNumber = orderData[0].order_number;

      // 3. Insert all cart items into "order_items" table
      const orderItemsPayload = cart.map(item => ({
        order_id: dbOrderId,
        menu_item_id: item.menuItem.id,
        size_name: item.selectedSize ? (item.selectedSize.size || item.selectedSize.size_name || 'Regular') : 'Regular',
        quantity: item.quantity,
        price: item.selectedSize ? item.selectedSize.price : (item.menuItem.price || 0)
      }));

      const { data: itemsData, error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItemsPayload)
        .select();

      // 4. If any error occurs: Log error in console & Show error message
      if (itemsError) {
        console.error("Error inserting order items:", itemsError);
        alert(`Failed to save order items: ${itemsError.message}`);
        setIsPlacingOrder(false);
        return;
      }

    } catch (err: any) {
      // 4. If any error occurs: Log error in console & Show error message
      console.error("Unexpected error during order submission:", err);
      alert(`An unexpected error occurred: ${err.message || err}`);
      setIsPlacingOrder(false);
      return;
    }

    // Format items list for the WhatsApp message
    const itemsLines = cart.map(item => {
      const name = item.menuItem.name;
      const sizeText = item.selectedSize ? ` (${item.selectedSize.size})` : '';
      const price = item.selectedSize ? item.selectedSize.price : (item.menuItem.price || 0);
      const totalItemPrice = price * item.quantity;
      return `- ${name}${sizeText} x${item.quantity} = ₹${Math.round(totalItemPrice)}`;
    }).join('\n');

    const paymentMethodLabel = orderType === 'dine-in' ? 'Dine-In' : (paymentMethod === 'upi' ? 'UPI' : 'COD');

    // Format the standard message structure exactly as requested
    const messageText = `New Order - Ahli's Pizza

Customer Name: ${customerName}
Phone: ${customerPhone}
${orderType === 'delivery' ? `Address: ${finalAddress}` : `Type: Dine-In\nPersons: ${numberOfPersons}\nDate & Time: ${dineInDate} @ ${dineInTime}`}

Items:
${itemsLines}

Total: ₹${Math.round(cartTotal)}
Payment Method: ${paymentMethodLabel}

Thank you.`;

    const encodedMessage = encodeURIComponent(messageText);
    const whatsappUrl = `https://wa.me/919996733339?text=${encodedMessage}`;

    // 5. After successful insert: Clear cart, Show Order Success page, Display order id, Then redirect to WhatsApp
    setPlacedOrderDetails({
      id: dbOrderId || `AP-${Math.floor(1000 + Math.random() * 9000)}`,
      name: customerName,
      phone: customerPhone,
      address: finalAddress,
      paymentMethod: orderType === 'dine-in' ? 'dine-in' : paymentMethod,
      total: Math.round(cartTotal),
      itemsCount: cartItemsCount,
      whatsappUrl: whatsappUrl,
      order_number: dbOrderNumber
    });

    setIsPlacingOrder(false);
    setCheckoutSuccess(true);
    setCart([]); // Clear cart items on success

    // Save to local storage order history for guest/unconfirmed/demo support
    if (dbOrderId) {
      try {
        const localIds = JSON.parse(localStorage.getItem('local_order_ids') || '[]');
        if (!localIds.includes(dbOrderId)) {
          localIds.push(dbOrderId);
          localStorage.setItem('local_order_ids', JSON.stringify(localIds));
        }
      } catch (e) {
        console.error('Error saving local order id:', e);
      }
    }

    // Auto redirect user to WhatsApp
    try {
      window.open(whatsappUrl, '_blank');
    } catch (err) {
      console.warn("Auto-redirect popup blocked by browser, fallback button is provided:", err);
    }
  };

  const handleResetCheckout = () => {
    setCheckoutSuccess(false);
    setIsCheckoutStep(false);
    setCustomerName('');
    setCustomerPhone('');
    setDeliveryAddress('');
    setPaymentMethod('cod');
    setUserUpiId('');
    setSpecialInstructions('');
    setPlacedOrderDetails(null);
    setIsCartOpen(false);
  };

  const sqlScript = `-- Create orders table if it doesn't exist with all required columns
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  delivery_address text NOT NULL,
  payment_method text NOT NULL,
  upi_id text,
  order_status text DEFAULT 'received',
  total_amount numeric NOT NULL,
  special_instructions text,
  order_number SERIAL UNIQUE
);

-- Ensure order_number column exists if table was already created
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS order_number SERIAL UNIQUE;

-- Create order_items table if it doesn't exist with all required columns
CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
  menu_item_id integer NOT NULL,
  size_name text NOT NULL,
  quantity integer NOT NULL,
  price numeric NOT NULL
);

-- Grant SELECT/INSERT permissions to public/anon role on all tables
GRANT SELECT ON public.categories TO anon;
GRANT SELECT ON public.menu_items TO anon;
GRANT SELECT ON public.menu_sizes TO anon;
GRANT INSERT, SELECT ON public.orders TO anon;
GRANT INSERT, SELECT ON public.order_items TO anon;

-- Ensure Row Level Security (RLS) is enabled
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Recreate policies cleanly to prevent "already exists" errors
DROP POLICY IF EXISTS "Allow public select access" ON public.categories;
CREATE POLICY "Allow public select access" ON public.categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public select access" ON public.menu_items;
CREATE POLICY "Allow public select access" ON public.menu_items FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public select access" ON public.menu_sizes;
CREATE POLICY "Allow public select access" ON public.menu_sizes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert access" ON public.orders;
CREATE POLICY "Allow public insert access" ON public.orders FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public select access" ON public.orders;
CREATE POLICY "Allow public select access" ON public.orders FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert access" ON public.order_items;
CREATE POLICY "Allow public insert access" ON public.order_items FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public select access" ON public.order_items;
CREATE POLICY "Allow public select access" ON public.order_items FOR SELECT USING (true);`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const scrollToMenu = () => {
    if (currentPath !== '/') {
      navigateTo('/');
      setTimeout(() => {
        const el = document.getElementById('menu-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    } else {
      const el = document.getElementById('menu-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // 5. If loading -> show spinner
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex flex-col items-center justify-center space-y-4">
        <RotateCw className="w-10 h-10 text-[#e63946] animate-spin" />
        <p className="text-sm font-semibold text-stone-500 font-sans">Checking session status...</p>
      </div>
    );
  }

  // Render Admin pages
  if (currentPath.startsWith('/admin')) {
    if (isAdminChecking) {
      return (
        <div className="min-h-screen bg-[#f8f9fa] flex flex-col items-center justify-center space-y-4">
          <RotateCw className="w-10 h-10 text-[#e63946] animate-spin" />
          <p className="text-sm font-semibold text-stone-500">Verifying credentials...</p>
        </div>
      );
    }

    if (!user || !isAdmin) {
      return null; // enforceAdminProtection effect will redirect
    }

    return (
      <AdminLayout currentPath={currentPath} onNavigate={navigateTo}>
        {currentPath === '/admin' ? (
          <AdminDashboard onNavigate={navigateTo} />
        ) : currentPath === '/admin/orders' ? (
          <AdminOrders />
        ) : currentPath === '/admin/menu' ? (
          <AdminMenu />
        ) : (
          <div className="p-8 text-center text-stone-500">
            Page not found. Redirecting...
          </div>
        )}
      </AdminLayout>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-stone-900 font-sans selection:bg-red-100 selection:text-red-900 flex flex-col relative overflow-x-hidden">
      
      {/* Sticky Header Navbar */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-100/80 transition-all py-2.5 px-4 md:px-8">
        {/* Premium Minimal Database Status Indicator (Non-cluttering) */}
        {error && !loading && (
          <button 
            onClick={() => {
              setShowDbDiagnostics(prev => !prev);
              setTimeout(() => {
                const element = document.getElementById('db-diagnostics-section');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                }
              }, 100);
            }}
            className="w-full text-left bg-red-500 hover:bg-red-600 text-white text-[11px] py-2 px-4 md:px-8 flex justify-between items-center rounded-xl mb-3 shadow-xs cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span className="font-mono text-[10px] uppercase tracking-wider text-white">
                ⚠️ Connected to High-Quality Demo Menu (Database unpopulated or offline) — Click to view Supabase SQL Setup Guide
              </span>
            </div>
            <span className="font-mono text-[9px] uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-md font-bold">
              {showDbDiagnostics ? 'Hide Guide' : 'Setup Guide ↗'}
            </span>
          </button>
        )}
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Brand Logo & Name */}
          <div 
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              setIsMobileMenuOpen(false);
            }} 
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="p-2 bg-[#e63946] text-white rounded-xl group-hover:rotate-12 transition-transform duration-300 shadow-sm shadow-red-500/20">
              <Pizza className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div className="text-left">
              <h1 className="font-sans text-lg md:text-xl font-black tracking-tight text-[#1d3557]">
                Ahli's <span className="text-[#e63946]">Pizza</span>
              </h1>
              <p className="text-[8px] font-mono tracking-[0.2em] text-[#e63946] uppercase font-extrabold -mt-1">Artisanal Craft</p>
            </div>
          </div>

          {/* Navigation Links (Desktop) */}
          <div className="hidden md:flex items-center gap-8">
            <button 
              onClick={() => {
                if (currentPath !== '/') {
                  navigateTo('/');
                } else {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }} 
              className={`font-bold text-xs tracking-wider uppercase transition-colors cursor-pointer relative py-1 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 hover:after:w-full after:bg-[#e63946] after:transition-all after:duration-300 ${
                currentPath === '/' ? 'text-[#e63946] after:w-full' : 'text-stone-600 hover:text-[#e63946]'
              }`}
            >
              Home
            </button>
            <button 
              onClick={scrollToMenu} 
              className="text-stone-600 hover:text-[#e63946] font-bold text-xs tracking-wider uppercase transition-colors cursor-pointer relative py-1 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 hover:after:w-full after:bg-[#e63946] after:transition-all after:duration-300"
            >
              Menu
            </button>
            {user && (
              <button 
                onClick={() => navigateTo('/my-orders')} 
                className={`font-bold text-xs tracking-wider uppercase transition-colors cursor-pointer relative py-1 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 hover:after:w-full after:bg-[#e63946] after:transition-all after:duration-300 ${
                  currentPath === '/my-orders' ? 'text-[#e63946] after:w-full' : 'text-stone-600 hover:text-[#e63946]'
                }`}
              >
                My Orders
              </button>
            )}
            {user && isAdmin && (
              <button 
                onClick={() => navigateTo('/admin')} 
                className="text-[#e63946] hover:text-[#d62839] font-bold text-xs tracking-wider uppercase transition-colors cursor-pointer relative py-1 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 hover:after:w-full after:bg-[#e63946] after:transition-all after:duration-300 flex items-center gap-1"
              >
                <Shield className="w-3.5 h-3.5" />
                Admin Panel
              </button>
            )}
            <button 
              onClick={() => {
                if (currentPath !== '/') {
                  navigateTo('/');
                  setTimeout(() => {
                    const el = document.getElementById('about-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }, 150);
                } else {
                  const el = document.getElementById('about-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="text-stone-600 hover:text-[#e63946] font-bold text-xs tracking-wider uppercase transition-colors cursor-pointer relative py-1 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 hover:after:w-full after:bg-[#e63946] after:transition-all after:duration-300"
            >
              Our Process
            </button>
            <button 
              onClick={() => {
                if (currentPath !== '/') {
                  navigateTo('/');
                  setTimeout(() => {
                    const el = document.getElementById('footer-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }, 150);
                } else {
                  const el = document.getElementById('footer-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="text-stone-600 hover:text-[#e63946] font-bold text-xs tracking-wider uppercase transition-colors cursor-pointer relative py-1 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 hover:after:w-full after:bg-[#e63946] after:transition-all after:duration-300"
            >
              Contact
            </button>
          </div>

          {/* Right Area: Cart Trigger & Hamburger Button */}
          <div className="flex items-center gap-2 md:gap-3">
            {user ? (
              <div className="hidden md:flex items-center gap-3 mr-1">
                <button 
                  onClick={() => navigateTo('/my-orders')} 
                  className={`px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-full transition-all duration-300 cursor-pointer border ${
                    currentPath === '/my-orders'
                      ? 'text-[#e63946] border-[#e63946] bg-[#e63946]/5'
                      : 'text-stone-600 hover:text-[#e63946] border-stone-200 hover:border-[#e63946]/20 bg-stone-50 hover:bg-[#e63946]/5'
                  }`}
                >
                  My Orders
                </button>
                <button
                  onClick={handleLogout}
                  className="px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-stone-600 hover:text-[#e63946] border border-stone-200 hover:border-[#e63946]/20 bg-stone-50 hover:bg-[#e63946]/5 rounded-full transition-all duration-300 cursor-pointer"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2 mr-1">
                <button
                  onClick={() => navigateTo('/login')}
                  className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#1d3557] hover:text-[#e63946] transition-all duration-300 cursor-pointer"
                >
                  Login
                </button>
                <button
                  onClick={() => navigateTo('/signup')}
                  className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-white bg-[#1d3557] hover:bg-[#e63946] rounded-full transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md"
                >
                  Signup
                </button>
              </div>
            )}

            <button 
              id="navbar-cart-btn"
              onClick={() => setIsCartOpen(true)}
              className="relative px-4 py-2 rounded-full bg-[#1d3557] text-white hover:bg-[#e63946] transition-all duration-300 flex items-center gap-2 cursor-pointer shadow-sm hover:shadow-md hover:shadow-red-500/15 active:scale-95 group"
            >
              <div className="relative flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-2.5 -right-2.5 bg-[#e63946] text-white font-mono text-[8px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-[#1d3557] shadow-xs">
                    {cartItemsCount}
                  </span>
                )}
              </div>
              <span className="font-sans text-[11px] font-bold tracking-wider uppercase flex items-center gap-1.5">
                <span className="hidden sm:inline">Cart</span>
                {cartItemsCount > 0 && (
                  <span className="font-mono bg-white/20 text-white px-1.5 py-0.5 rounded-md text-[9px] font-bold">
                    ₹{Math.round(cartTotal)}
                  </span>
                )}
              </span>
            </button>

            {/* Hamburger Toggle (Mobile) */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-stone-600 hover:text-[#e63946] hover:bg-stone-50 rounded-lg md:hidden transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-5.5 h-5.5" /> : <Menu className="w-5.5 h-5.5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="md:hidden border-t border-gray-100 overflow-hidden bg-white mt-2.5"
            >
              <div className="flex flex-col py-4 px-2 gap-3 text-left">
                <button 
                  onClick={() => {
                    if (currentPath !== '/') {
                      navigateTo('/');
                    } else {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                    setIsMobileMenuOpen(false);
                  }} 
                  className={`font-bold text-xs tracking-wider uppercase py-2.5 px-3 rounded-lg transition-colors w-full text-left cursor-pointer ${
                    currentPath === '/' ? 'text-[#e63946] bg-red-50/50' : 'text-stone-700 hover:text-[#e63946] hover:bg-stone-50'
                  }`}
                >
                  Home
                </button>
                <button 
                  onClick={() => {
                    scrollToMenu();
                    setIsMobileMenuOpen(false);
                  }} 
                  className="text-stone-700 hover:text-[#e63946] font-bold text-xs tracking-wider uppercase py-2.5 px-3 rounded-lg hover:bg-stone-50 transition-colors w-full text-left cursor-pointer"
                >
                  Menu
                </button>
                {user && (
                  <button 
                    onClick={() => {
                      navigateTo('/my-orders');
                      setIsMobileMenuOpen(false);
                    }} 
                    className={`font-bold text-xs tracking-wider uppercase py-2.5 px-3 rounded-lg transition-colors w-full text-left cursor-pointer ${
                      currentPath === '/my-orders' ? 'text-[#e63946] bg-red-50/50' : 'text-stone-700 hover:text-[#e63946] hover:bg-stone-50'
                    }`}
                  >
                    My Orders
                  </button>
                )}
                {user && isAdmin && (
                  <button 
                    onClick={() => {
                      navigateTo('/admin');
                      setIsMobileMenuOpen(false);
                    }} 
                    className={`font-bold text-xs tracking-wider uppercase py-2.5 px-3 rounded-lg transition-colors w-full text-left cursor-pointer flex items-center gap-1.5 ${
                      currentPath.startsWith('/admin') ? 'text-[#e63946] bg-red-50/50' : 'text-stone-700 hover:text-[#e63946] hover:bg-stone-50'
                    }`}
                  >
                    <Shield className="w-4 h-4" />
                    Admin Panel
                  </button>
                )}
                <button 
                  onClick={() => {
                    if (currentPath !== '/') {
                      navigateTo('/');
                      setTimeout(() => {
                        const el = document.getElementById('about-section');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }, 150);
                    } else {
                      const el = document.getElementById('about-section');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-stone-700 hover:text-[#e63946] font-bold text-xs tracking-wider uppercase py-2.5 px-3 rounded-lg hover:bg-stone-50 transition-colors block w-full text-left"
                >
                  Our Process
                </button>
                <button 
                  onClick={() => {
                    if (currentPath !== '/') {
                      navigateTo('/');
                      setTimeout(() => {
                        const el = document.getElementById('footer-section');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }, 150);
                    } else {
                      const el = document.getElementById('footer-section');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-stone-700 hover:text-[#e63946] font-bold text-xs tracking-wider uppercase py-2.5 px-3 rounded-lg hover:bg-stone-50 transition-colors block w-full text-left"
                >
                  Contact
                </button>

                {/* Mobile Auth Controls */}
                {user ? (
                  <div className="border-t border-stone-100 pt-4 mt-2 flex flex-col gap-2">
                    <div className="px-3">
                      <p className="text-[9px] font-mono font-bold text-[#e63946] uppercase">Authenticated User</p>
                      <p className="text-xs font-bold text-[#1d3557] truncate mt-0.5">{user.email}</p>
                    </div>
                    <button
                      onClick={async () => {
                        await handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="text-[#e63946] hover:bg-red-50 font-bold text-xs tracking-wider uppercase py-2.5 px-3 rounded-lg transition-colors w-full text-left cursor-pointer flex items-center gap-2"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="border-t border-stone-100 pt-4 mt-2 flex flex-col gap-2">
                    <button
                      onClick={() => {
                        navigateTo('/login');
                        setIsMobileMenuOpen(false);
                      }}
                      className="text-stone-700 hover:text-[#e63946] hover:bg-stone-50 font-bold text-xs tracking-wider uppercase py-2.5 px-3 rounded-lg transition-colors w-full text-left cursor-pointer"
                    >
                      Login
                    </button>
                    <button
                      onClick={() => {
                        navigateTo('/signup');
                        setIsMobileMenuOpen(false);
                      }}
                      className="text-white bg-[#1d3557] hover:bg-[#e63946] font-bold text-xs tracking-wider uppercase py-2.5 px-3 rounded-lg transition-colors w-full text-center cursor-pointer shadow-sm"
                    >
                      Signup
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <div className="pt-20 flex-1 flex flex-col">
        {currentPath === '/login' ? (
          <LoginPage onNavigate={navigateTo} onSuccess={() => navigateTo('/')} />
        ) : currentPath === '/signup' ? (
          <SignupPage onNavigate={navigateTo} />
        ) : currentPath === '/my-orders' ? (
          <MyOrdersPage onNavigate={navigateTo} />
        ) : (
          <>
          {/* Premium Hero Section */}
          <section className="relative h-[580px] w-full bg-[#1d3557] flex items-center justify-center overflow-hidden">
        {/* Full-width Pizza Background Image with dual opacity layers */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1920&q=80" 
            alt="Fresh & Hot Pizzas background" 
            className="w-full h-full object-cover scale-102 filter brightness-[0.85]"
          />
          {/* Subtle gradient dark overlay for elegant text contrast */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent md:bg-gradient-to-t md:from-[#1d3557]/95 md:via-black/50 md:to-black/30" />
        </div>

        {/* Hero Contents with premium entrance transition */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center md:text-left text-white w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-8 flex flex-col items-center md:items-start text-center md:text-left"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full mb-6 border border-white/15">
                <span className="w-2 h-2 rounded-full bg-[#e63946] animate-pulse" />
                <span className="text-[10px] font-mono tracking-widest text-amber-200 uppercase font-black">
                  Authentic Freshly Baked Pizzas
                </span>
              </div>

              <h2 className="font-serif text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1] text-white">
                Fresh &amp; Hot Pizzas <br />
                <span className="text-[#e63946]">Delivered to You</span>
              </h2>

              <p className="text-stone-200 text-lg sm:text-xl max-w-xl leading-relaxed mb-8 font-medium">
                Savor the ultimate pizza experience, handcrafted with premium ingredients and baked fresh daily in Fatehabad.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 items-center justify-center md:justify-start w-full sm:w-auto">
                <button
                  onClick={scrollToMenu}
                  className="w-full sm:w-auto px-8 py-4 bg-[#e63946] hover:bg-[#d62839] text-white font-bold tracking-wider uppercase rounded-full shadow-lg shadow-red-500/25 transition-all flex items-center justify-center gap-2 hover:-translate-y-1 hover:shadow-xl cursor-pointer"
                >
                  Order Now <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={scrollToMenu}
                  className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/30 text-white font-bold tracking-wider uppercase rounded-full transition-all flex items-center justify-center gap-2 hover:-translate-y-1 cursor-pointer backdrop-blur-xs"
                >
                  View Menu
                </button>
              </div>
            </motion.div>

            {/* Premium visual grid showcase column */}
            <div className="hidden lg:flex lg:col-span-4 justify-end">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ duration: 1, delay: 0.2 }}
                className="relative p-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl shadow-2xl overflow-hidden w-80 h-96"
              >
                <img 
                  src="https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80" 
                  alt="Ahli's Gourmet Sourdough" 
                  className="w-full h-full object-cover rounded-2xl"
                />
                <div className="absolute inset-x-6 bottom-6 p-4 bg-stone-900/95 backdrop-blur-lg rounded-2xl border border-white/10 text-left">
                  <span className="text-[9px] font-mono tracking-wider uppercase text-[#e63946] font-black">Pizzaiolo Select</span>
                  <h4 className="font-serif text-white font-bold text-sm mt-0.5">Classic Margherita</h4>
                  <p className="text-[11px] text-stone-300 mt-1">Crushed San Marzano tomatoes, fresh buffalo mozzarella, hand-torn basil.</p>
                </div>
              </motion.div>
            </div>

          </div>
        </div>
      </section>

      {/* Main Container */}
      <main id="menu-section" className="flex-grow w-full py-16 flex flex-col gap-10">
        
        {/* Loading State */}
        {loading && (
          <div className="max-w-7xl mx-auto px-4 md:px-8 w-full flex-grow flex flex-col items-center justify-center py-20 text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
              className="mb-4"
            >
              <RotateCw className="w-12 h-12 text-[#e63946] stroke-[2]" />
            </motion.div>
            <p className="font-serif text-xl text-[#1d3557] font-semibold">Harvesting our Supabase woodfired ovens...</p>
            <p className="text-stone-400 text-xs mt-1.5 font-mono">Synchronizing menu items &amp; size pricing structures</p>
          </div>
        )}

        {/* Database Permissions Error / SQL Diagnostics State */}
        {error && !loading && showDbDiagnostics && (
          <div id="db-diagnostics-section" className="max-w-7xl mx-auto px-4 md:px-8 w-full flex-grow py-4">
            <div className="bg-white rounded-3xl border border-stone-200 shadow-xl overflow-hidden flex flex-col">
              
              {/* Alert Ribbon */}
              <div className="bg-[#1d3557] border-b border-white/10 p-8 flex items-start gap-4 text-white">
                <div className="p-3 bg-[#e63946] rounded-2xl text-white shadow-md">
                  <ShieldAlert className="w-8 h-8 animate-pulse" />
                </div>
                <div className="flex-grow text-left">
                  <span className="font-mono text-xs text-red-300 uppercase font-black tracking-widest block mb-1">SQL ACCESS ERROR (CODE 42501)</span>
                  <h3 className="font-serif text-2xl font-bold tracking-tight mb-1">
                    Supabase Public Privileges Action Required
                  </h3>
                  <p className="text-stone-300 text-sm leading-relaxed max-w-2xl">
                    Your Supabase client initialized and connected correctly, but the public <code className="font-mono bg-white/10 text-white px-1.5 py-0.5 rounded text-xs font-bold">anon</code> role does not yet have permission to read the menu tables. Follow our quick fix below!
                  </p>
                </div>
              </div>

              {/* Instructions Panel */}
              <div className="p-6 md:p-8 flex flex-col gap-6 text-left">
                <div>
                  <h4 className="text-xs font-mono uppercase tracking-wider text-stone-400 mb-3 flex items-center gap-1.5 font-bold">
                    <Terminal className="w-4 h-4 text-stone-500" /> paste this in your supabase SQL editor
                  </h4>
                  <p className="text-xs text-stone-600 mb-4">
                    Open your <strong>Supabase Project Dashboard</strong>, navigate to the <strong>SQL Editor</strong>, paste this snippet, and run it. This instantly grants access without writing table rows:
                  </p>

                  {/* SQL Block with copy button */}
                  <div className="relative rounded-2xl overflow-hidden border border-stone-200 bg-stone-950 text-stone-200 font-mono text-xs">
                    <div className="flex items-center justify-between px-4 py-3 bg-stone-900 border-b border-stone-800 text-stone-400 text-[10px] tracking-wide font-bold">
                      <span>SUPABASE PUBLIC GRANTS SCRIPT</span>
                      <button
                        onClick={handleCopySql}
                        className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer text-[10px] bg-stone-800 hover:bg-[#e63946] text-white font-bold px-3 py-1.5 rounded-lg"
                      >
                        {copied ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" /> Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" /> Copy SQL
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="p-5 overflow-x-auto max-h-56 text-[#f4f0e6] font-mono text-xs leading-relaxed text-left">
                      <code>{sqlScript}</code>
                    </pre>
                  </div>
                </div>

                <div className="pt-6 border-t border-stone-100">
                  <div className="flex flex-col justify-between gap-3 p-5 bg-stone-50 rounded-2xl border border-stone-200/50 text-left">
                    <div>
                      <h5 className="font-serif text-[#1d3557] font-bold text-base mb-2">
                        🔗 Supabase Dashboard Quick Link
                      </h5>
                      <p className="text-xs text-stone-600 leading-relaxed">
                        Log in to your Supabase project instance dashboard to execute the grant queries. Then, return here and hit Reconnect.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-3 mt-2">
                      <a
                        href="https://supabase.com/dashboard"
                        target="_blank"
                        rel="noreferrer"
                        className="w-full md:w-auto px-6 py-3 bg-[#1d3557] hover:bg-[#122238] text-white rounded-xl text-xs font-bold tracking-wider uppercase text-center transition-all flex items-center justify-center gap-2 shadow-xs"
                      >
                        Open Supabase <ExternalLink className="w-3 h-3" />
                      </a>
                      <button
                        onClick={enablePreviewMode}
                        className="w-full md:w-auto px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-bold tracking-wider uppercase text-center transition-all flex items-center justify-center gap-2 shadow-md shadow-red-500/15 cursor-pointer"
                      >
                        Continue in Demo Mode <Sparkles className="w-3.5 h-3.5 text-red-200" />
                      </button>
                      <button
                        onClick={refetch}
                        className="py-3 px-4 border border-stone-300 hover:border-stone-400 text-stone-700 bg-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center hover:bg-stone-50"
                        title="Reconnect"
                      >
                        <RotateCw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loaded Menu View */}
        {!loading && (!error || isPreviewMode) && (
          <>
            {/* Header Title with Subtext */}
            <div className="max-w-7xl mx-auto px-4 md:px-8 w-full mt-6">
              <div className="text-center md:text-left flex flex-col md:flex-row md:items-end justify-between border-b border-gray-100 pb-6 gap-6">
                <div className="text-left">
                  <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#e63946] font-extrabold">FRESH OUT OF THE OVEN</span>
                  <h2 className="font-serif text-3xl md:text-4xl font-extrabold text-[#1d3557] mt-1.5 tracking-tight">Explore Our Delicious Creations</h2>
                </div>

                {/* In-Menu Search Bar */}
                <div className="relative w-full md:w-80 shadow-sm rounded-full border border-gray-200 bg-white hover:border-[#e63946]/40 focus-within:border-[#e63946] focus-within:ring-2 focus-within:ring-[#e63946]/15 transition-all">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400">
                    <Search className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search gourmet menu..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-10 py-3 text-sm text-stone-900 placeholder:text-stone-400 outline-hidden bg-transparent font-sans font-medium"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute inset-y-0 right-4 flex items-center text-xs text-stone-400 hover:text-stone-600 transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* CLEAN FULL-WIDTH CATEGORY SCROLL */}
            <section className="w-full bg-[#f8f9fa] sticky top-[56px] md:top-[60px] z-30 border-b border-gray-200">

              <div className="w-full overflow-x-auto">
                <div className="flex gap-3 px-6 py-4 w-max">

                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`px-6 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200
                        ${
                          selectedCategory === category.id
                            ? "bg-[#e63946] text-white shadow-md"
                            : "bg-white text-gray-700 border border-gray-300 hover:bg-red-50 hover:text-[#e63946]"
                        }`}
                    >
                      {category.name}
                    </button>
                  ))}

                </div>
              </div>

            </section>

            {/* Menu Sections (Category-wise) */}
            <div className="w-full px-4 md:px-8 mt-8">
              <div className="flex flex-col gap-16 text-left">
              <AnimatePresence mode="popLayout">
                {filteredCategories.map((category) => {
                  const itemsInCategory = menuItems
                    .filter(item => item.category_id === selectedCategory)
                    .filter(item => {
                      const matchSearch = 
                        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
                      return matchSearch;
                    });

                  return (
                    <motion.section
                      key={category.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col gap-8"
                      id={`section-${category.id}`}
                    >
                      {/* Category Header */}
                      <div className="border-b border-gray-100 pb-4 flex flex-col md:flex-row md:items-baseline md:justify-between gap-3">
                        <div className="flex items-center gap-3.5">
                          <h3 id={`category-header-${category.id}`} className="font-serif text-2xl md:text-3.5xl text-[#1d3557] font-extrabold tracking-tight">
                             {category.name}
                          </h3>
                          <span className="text-[10px] font-mono font-black text-[#e63946] bg-red-50 border border-red-100/40 px-3 py-1 rounded-full">
                            {itemsInCategory.length} {itemsInCategory.length === 1 ? 'CRAFT SELECTION' : 'CRAFT SELECTIONS'}
                          </span>
                        </div>
                        {category.description && (
                          <p className="text-stone-500 text-sm font-medium leading-relaxed max-w-xl text-left">
                            {category.description}
                          </p>
                        )}
                      </div>

                      {/* Items Grid or Empty State */}
                      {itemsInCategory.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" id={`grid-${category.id}`}>
                          {itemsInCategory.map((item) => {
                            const itemSizes = sizesByItemId[item.id] || [];
                            return (
                              <MenuItemCard
                                key={item.id}
                                item={item}
                                sizes={itemSizes}
                                onAddToCart={handleAddToCart}
                                categoryName={category.name}
                              />
                            );
                          })}
                        </div>
                      ) : (
                        searchQuery.trim() !== '' ? (
                          <div className="py-16 text-center max-w-md mx-auto flex flex-col items-center justify-center bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
                            <div className="p-4 bg-stone-50 rounded-full text-stone-400 mb-4 border border-stone-100">
                              <UtensilsCrossed className="w-8 h-8 stroke-[1.5]" />
                            </div>
                            <h3 className="font-serif text-lg text-[#1d3557] font-extrabold mb-1">No Matches Found</h3>
                            <p className="text-stone-500 text-xs mb-6 leading-relaxed">
                              We couldn't find any menu selections matching "{searchQuery}" under this collection.
                            </p>
                            <button
                              onClick={() => setSearchQuery('')}
                              className="px-6 py-3 bg-[#e63946] hover:bg-[#d62839] text-white rounded-full text-xs font-bold tracking-wider uppercase transition-all shadow-md cursor-pointer hover:shadow-lg active:scale-95"
                            >
                              Reset Search
                            </button>
                          </div>
                        ) : (
                          <div className="py-16 text-center max-w-md mx-auto flex flex-col items-center justify-center bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
                            <div className="p-4 bg-stone-50 rounded-full text-stone-400 mb-4 border border-stone-100">
                              <UtensilsCrossed className="w-8 h-8 stroke-[1.5]" />
                            </div>
                            <h3 className="font-serif text-lg text-[#1d3557] font-extrabold mb-1">No items in this category.</h3>
                            <p className="text-stone-500 text-xs leading-relaxed">
                              Please check back later as we rotate our woodfired specialties!
                            </p>
                          </div>
                        )
                      )}
                    </motion.section>
                  );
                })}
              </AnimatePresence>
            </div>
            </div>
          </>
        )}
      </main>

      {/* About Section - Wood-Fired Sourdough Experience */}
      <section id="about-section" className="bg-[#1d3557] text-white py-20 px-4 md:px-8 relative overflow-hidden text-left">
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] opacity-5 pointer-events-none" />
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <div className="relative h-96 rounded-3xl overflow-hidden shadow-2xl border border-white/10 group">
            <img 
              src="https://images.unsplash.com/photo-1544982503-9f984c14501a?auto=format&fit=crop&w=1000&q=80" 
              alt="Artisanal Pizza making" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1d3557] via-transparent to-transparent opacity-80" />
            <div className="absolute bottom-6 left-6 right-6">
              <span className="text-[10px] font-mono tracking-widest text-red-400 font-bold uppercase block mb-1">THE STONE OVEN AT 900°F</span>
              <p className="font-serif text-xl font-bold">Leopard-spotted blistering &amp; light airy structure.</p>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <span className="text-xs font-mono uppercase tracking-[0.25em] text-[#e63946] font-bold">OUR PIZZA CRAFT</span>
            <h2 className="font-serif text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight">The 72-Hour Wild Sourdough Story</h2>
            
            <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
              Every crust is hand-stretched and prepared utilizing a wild yeast sourdough culture passed down for generations. The slow cooler fermentation results in natural grain breakdowns, rendering a light, bubbly texture that is wonderfully easy on digestion and brimming with rich artisanal flavor.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
              <div className="flex gap-3">
                <div className="p-2.5 bg-white/10 rounded-xl h-fit border border-white/5 text-[#e63946]">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-lg">Local Organic Wheat</h4>
                  <p className="text-xs text-stone-400 leading-relaxed mt-1">Sourced from local organic farms to maintain maximum freshness &amp; flavor integrity.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="p-2.5 bg-white/10 rounded-xl h-fit border border-white/5 text-[#e63946]">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-lg">Hand-Tossed Sourdough</h4>
                  <p className="text-xs text-stone-400 leading-relaxed mt-1">Stretched to perfection without rollers to trap air bubbles inside the rim.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Animated Slide-over Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-50 flex justify-end" id="cart-drawer-overlay">
            
            {/* Backdrop Blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (!checkoutSuccess) setIsCartOpen(false);
              }}
              className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm cursor-pointer"
            />

            {/* Cart Body */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              id="cart-drawer-panel"
              className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10"
            >
              
              {/* Cart Drawer Header */}
              <div className="px-6 py-5 border-b border-stone-200/80 flex items-center justify-between bg-stone-50">
                <div className="flex items-center gap-2.5 text-left">
                  <div className="p-2 bg-[#e63946]/10 text-[#e63946] rounded-xl">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-extrabold text-[#1d3557]">
                      {checkoutSuccess ? 'Order Placed!' : isCheckoutStep ? 'Secure Checkout' : 'Your Pizza Cart'}
                    </h3>
                    <p className="text-[10px] font-mono uppercase tracking-wider text-stone-400 font-bold">
                      {checkoutSuccess ? 'Thank you' : isCheckoutStep ? 'Step 2 of 2' : `${cart.length} unique selections`}
                    </p>
                  </div>
                </div>
                <button
                  disabled={isPlacingOrder}
                  onClick={handleResetCheckout}
                  className="p-2 rounded-full hover:bg-stone-200 text-stone-400 hover:text-stone-800 transition-colors cursor-pointer disabled:opacity-30"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {checkoutSuccess ? (
                /* Success Checkout View */
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="h-full flex flex-col justify-between p-6 gap-4 text-left overflow-y-auto"
                >
                  <div className="flex flex-col items-center justify-center text-center py-4 gap-3">
                    <div className="p-4 bg-emerald-50 rounded-full text-emerald-600 border border-emerald-100 animate-bounce">
                      <Check className="w-10 h-10 stroke-[2.5]" />
                    </div>
                    <h4 className="font-serif text-2xl font-bold text-[#1d3557]">Order Confirmed!</h4>
                    <p className="text-xs text-stone-500 max-w-xs leading-relaxed">
                      Thank you, {placedOrderDetails?.name}! Our pizzaiolos are preparing your sourdough creations.
                    </p>
                  </div>

                  <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 flex flex-col gap-3 text-xs font-medium">
                    <div className="flex justify-between font-mono font-bold text-[#1d3557] border-b border-stone-200 pb-2">
                      <span>ORDER ID</span>
                      <span>{getOrderDisplayId(placedOrderDetails?.id || '', placedOrderDetails?.order_number)}</span>
                    </div>
                    <div className="flex justify-between border-b border-stone-200 pb-2">
                      <span>Total Amount</span>
                      <span className="font-serif font-extrabold text-[#e63946] text-sm">₹{placedOrderDetails?.total}</span>
                    </div>
                    <div className="flex justify-between border-b border-stone-200 pb-2">
                      <span>Payment Method</span>
                      <span className="font-bold uppercase font-mono bg-stone-200/50 text-stone-700 px-2 py-0.5 rounded-md text-[10px]">
                        {placedOrderDetails?.paymentMethod === 'dine-in' ? 'Dine-In' : (placedOrderDetails?.paymentMethod === 'upi' ? 'UPI' : 'Cash on Delivery')}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-stone-200 pb-2">
                      <span>Contact Phone</span>
                      <span className="font-mono">{placedOrderDetails?.phone}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-stone-400 text-[10px] uppercase font-bold">
                        {placedOrderDetails?.paymentMethod === 'dine-in' ? 'Dine-In Details' : 'Delivery Address'}
                      </span>
                      <p className="text-stone-700 text-[11px] leading-snug">{placedOrderDetails?.address}</p>
                    </div>
                  </div>

                  <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3">
                    <Clock className="w-5 h-5 text-[#e63946] flex-shrink-0" />
                    <div>
                      <h5 className="font-bold text-xs text-stone-800">
                        {placedOrderDetails?.paymentMethod === 'dine-in' ? 'Table Reservation' : 'Estimated Delivery'}
                      </h5>
                      <p className="text-[11px] text-stone-500 leading-snug">
                        {placedOrderDetails?.paymentMethod === 'dine-in'
                          ? 'We have reserved your table. Please arrive at your selected time.'
                          : 'Your fresh pizza will arrive hot within 25 - 35 minutes.'}
                      </p>
                    </div>
                  </div>

                  {placedOrderDetails?.whatsappUrl && (
                    <a
                      href={placedOrderDetails.whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs tracking-wider uppercase rounded-full shadow-md shadow-emerald-500/10 hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer text-center mt-2"
                    >
                      <MessageCircle className="w-4 h-4 fill-white text-emerald-600" />
                      Send Order on WhatsApp <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}

                  <button
                    onClick={handleResetCheckout}
                    className="w-full py-4 bg-[#1d3557] hover:bg-[#1d3557]/90 text-white font-bold text-xs tracking-wider uppercase rounded-full shadow-md transition-all cursor-pointer text-center mt-1"
                  >
                    Order More Delicious Pizza
                  </button>
                </motion.div>
              ) : isCheckoutStep ? (
                /* Checkout Form Step */
                <form onSubmit={handlePlaceOrder} className="flex-grow flex flex-col justify-between text-left overflow-hidden h-full">
                  <div className="flex-grow overflow-y-auto px-6 py-5 flex flex-col gap-5">
                    <button
                      type="button"
                      onClick={() => setIsCheckoutStep(false)}
                      className="flex items-center gap-1 text-stone-500 hover:text-stone-900 cursor-pointer text-xs font-bold transition-colors w-fit"
                    >
                      <ArrowRight className="w-4 h-4 rotate-180" /> Back to Cart
                    </button>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-mono font-bold uppercase text-stone-400">Full Name</label>
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="e.g. Rahul Sharma"
                        className="px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#e63946] focus:ring-1 focus:ring-[#e63946]/30 transition-all placeholder:text-stone-300"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-mono font-bold uppercase text-stone-400">Mobile Phone Number</label>
                      <input
                        type="tel"
                        required
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="e.g. 99967 33339"
                        className="px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#e63946] focus:ring-1 focus:ring-[#e63946]/30 transition-all placeholder:text-stone-300"
                      />
                    </div>

                    {/* Order Type Toggle */}
                    <div className="flex flex-col gap-1.5 border-b border-stone-100 pb-4">
                      <label className="text-[10px] font-mono font-bold uppercase text-stone-400">Order Type</label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setOrderType('delivery')}
                          className={`py-3 rounded-xl border-2 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer
                            ${orderType === 'delivery'
                              ? 'border-[#e63946] bg-red-50/10 text-[#1d3557]'
                              : 'border-stone-200 bg-stone-50/50 text-stone-500 hover:border-stone-300'
                            }`}
                        >
                          <Truck className="w-4 h-4" /> Delivery
                        </button>
                        <button
                          type="button"
                          onClick={() => setOrderType('dine-in')}
                          className={`py-3 rounded-xl border-2 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer
                            ${orderType === 'dine-in'
                              ? 'border-[#e63946] bg-red-50/10 text-[#1d3557]'
                              : 'border-stone-200 bg-stone-50/50 text-stone-500 hover:border-stone-300'
                            }`}
                        >
                          <UtensilsCrossed className="w-4 h-4" /> Dine-In
                        </button>
                      </div>
                    </div>

                    {/* Conditional Fields based on Order Type */}
                    {orderType === 'delivery' ? (
                      <div className="flex flex-col gap-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-mono font-bold uppercase text-stone-400">House / Flat No</label>
                            <input
                              type="text"
                              required
                              value={houseNo}
                              onChange={(e) => setHouseNo(e.target.value)}
                              placeholder="e.g. 142, Ground Floor"
                              className="px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#e63946] focus:ring-1 focus:ring-[#e63946]/30 transition-all placeholder:text-stone-300"
                            />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-mono font-bold uppercase text-stone-400">Pincode</label>
                            <input
                              type="text"
                              required
                              value={pincode}
                              onChange={(e) => setPincode(e.target.value)}
                              placeholder="e.g. 125050"
                              className="px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#e63946] focus:ring-1 focus:ring-[#e63946]/30 transition-all placeholder:text-stone-300"
                            />
                          </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-mono font-bold uppercase text-stone-400">Street / Area</label>
                          <input
                            type="text"
                            required
                            value={streetArea}
                            onChange={(e) => setStreetArea(e.target.value)}
                            placeholder="e.g. Sector 14, Main Market"
                            className="px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#e63946] focus:ring-1 focus:ring-[#e63946]/30 transition-all placeholder:text-stone-300"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-mono font-bold uppercase text-stone-400">City</label>
                            <input
                              type="text"
                              required
                              value={city}
                              onChange={(e) => setCity(e.target.value)}
                              placeholder="e.g. Fatehabad"
                              className="px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#e63946] focus:ring-1 focus:ring-[#e63946]/30 transition-all placeholder:text-stone-300"
                            />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-mono font-bold uppercase text-stone-400">Landmark (Optional)</label>
                            <input
                              type="text"
                              value={landmark}
                              onChange={(e) => setLandmark(e.target.value)}
                              placeholder="e.g. Near Shiv Mandir"
                              className="px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#e63946] focus:ring-1 focus:ring-[#e63946]/30 transition-all placeholder:text-stone-300"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-mono font-bold uppercase text-stone-400">Number of Persons</label>
                          <input
                            type="number"
                            required
                            min="1"
                            max="20"
                            value={numberOfPersons}
                            onChange={(e) => setNumberOfPersons(e.target.value)}
                            placeholder="e.g. 4"
                            className="px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#e63946] focus:ring-1 focus:ring-[#e63946]/30 transition-all placeholder:text-stone-300"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-mono font-bold uppercase text-stone-400">Dine-In Date</label>
                            <input
                              type="date"
                              required
                              value={dineInDate}
                              onChange={(e) => setDineInDate(e.target.value)}
                              className="px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#e63946] focus:ring-1 focus:ring-[#e63946]/30 transition-all text-stone-700"
                            />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-mono font-bold uppercase text-stone-400">Dine-In Time</label>
                            <input
                              type="time"
                              required
                              value={dineInTime}
                              onChange={(e) => setDineInTime(e.target.value)}
                              className="px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#e63946] focus:ring-1 focus:ring-[#e63946]/30 transition-all text-stone-700"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {orderType === 'delivery' && (
                      <>
                        <div className="flex flex-col gap-2.5 border-t border-stone-100 pt-4">
                          <label className="text-[10px] font-mono font-bold uppercase text-stone-400">Choose Payment Method</label>
                          <div className="grid grid-cols-2 gap-3">
                            <div
                              onClick={() => setPaymentMethod('cod')}
                              className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex flex-col gap-1 text-left
                                ${paymentMethod === 'cod'
                                  ? 'border-[#e63946] bg-red-50/10 text-[#1d3557]'
                                  : 'border-stone-200 bg-stone-50/50 text-stone-500 hover:border-stone-300'
                                }`}
                            >
                              <span className="font-bold text-xs">Cash on Delivery</span>
                              <span className="text-[9px] text-stone-400 leading-normal">Pay cash at doorstep</span>
                            </div>
                            <div
                              onClick={() => setPaymentMethod('upi')}
                              className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex flex-col gap-1 text-left
                                ${paymentMethod === 'upi'
                                  ? 'border-[#e63946] bg-red-50/10 text-[#1d3557]'
                                  : 'border-stone-200 bg-stone-50/50 text-stone-500 hover:border-stone-300'
                                }`}
                            >
                              <span className="font-bold text-xs flex items-center gap-1">UPI Transfer</span>
                              <span className="text-[9px] text-stone-400 leading-normal">Instant digital payment</span>
                            </div>
                          </div>
                        </div>

                        {/* UPI Fields if selected */}
                        {paymentMethod === 'upi' && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="p-4 bg-red-50/30 border border-red-100/60 rounded-2xl flex flex-col gap-3 text-left overflow-hidden"
                          >
                            <div className="flex gap-3 items-start">
                              {/* QR Code Placeholder Box */}
                              <div className="w-16 h-16 bg-white border border-stone-200 rounded-xl flex items-center justify-center p-1 flex-shrink-0 relative">
                                <div className="absolute inset-0.5 border border-dashed border-stone-300 rounded-lg flex items-center justify-center bg-stone-50">
                                  <div className="grid grid-cols-3 gap-0.5 opacity-60">
                                    <div className="w-2.5 h-2.5 border-2 border-stone-800 rounded-xs"></div>
                                    <div className="w-2.5 h-2.5 bg-stone-800 rounded-xs"></div>
                                    <div className="w-2.5 h-2.5 border-2 border-stone-800 rounded-xs"></div>
                                    <div className="w-2.5 h-2.5 bg-stone-800 rounded-xs"></div>
                                    <div className="w-2.5 h-2.5 border-2 border-stone-800 rounded-xs"></div>
                                    <div className="w-2.5 h-2.5 bg-stone-800 rounded-xs"></div>
                                  </div>
                                </div>
                              </div>
                              <div className="flex-grow flex flex-col gap-0.5">
                                <h5 className="font-bold text-xs text-[#1d3557]">Our UPI Address</h5>
                                <span className="font-mono text-[11px] font-extrabold bg-white px-2 py-0.5 rounded border border-stone-200 text-stone-700 w-fit">
                                  ahlispizza@okaxis
                                </span>
                                <p className="text-[10px] text-[#e63946] font-bold mt-1">
                                  Complete payment and click confirm.
                                </p>
                              </div>
                            </div>

                            <div className="flex flex-col gap-1 border-t border-red-100/40 pt-2.5">
                              <label className="text-[10px] font-mono font-bold uppercase text-stone-400">Your UPI ID (Optional)</label>
                              <input
                                type="text"
                                value={userUpiId}
                                onChange={(e) => setUserUpiId(e.target.value)}
                                placeholder="e.g. rahul@okaxis"
                                className="px-3 py-2 bg-white border border-stone-200 rounded-lg text-xs font-medium focus:outline-none focus:border-[#e63946] focus:ring-1 focus:ring-[#e63946]/30 transition-all placeholder:text-stone-300"
                              />
                            </div>
                          </motion.div>
                        )}
                      </>
                    )}

                    {/* Special Instructions Field */}
                    <div className="flex flex-col gap-1.5 border-t border-stone-100 pt-4">
                      <label className="text-[10px] font-mono font-bold uppercase text-stone-400">Special Instructions (Optional)</label>
                      <textarea
                        value={specialInstructions}
                        onChange={(e) => setSpecialInstructions(e.target.value)}
                        placeholder="Less spicy, no onion, ring bell, etc."
                        rows={2}
                        className="px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#e63946] focus:ring-1 focus:ring-[#e63946]/30 transition-all placeholder:text-stone-300 resize-none"
                      />
                    </div>
                  </div>

                  {/* Form Footer */}
                  <div className="p-6 bg-stone-50 border-t border-stone-200/80 flex flex-col gap-3">
                    <div className="flex justify-between items-center text-sm text-stone-900 pb-1">
                      <span className="font-serif font-extrabold text-[#1d3557]">Total Payable Amount</span>
                      <span className="font-serif font-extrabold text-lg text-[#1d3557]">₹{Math.round(cartTotal)}</span>
                    </div>

                    <button
                      type="submit"
                      disabled={isPlacingOrder}
                      className={`w-full py-4 rounded-full font-bold tracking-wider uppercase text-xs transition-all flex items-center justify-center gap-2 cursor-pointer
                        ${isPlacingOrder 
                          ? 'bg-stone-300 text-stone-500 cursor-wait' 
                          : 'bg-[#e63946] hover:bg-[#d62839] text-white shadow-lg shadow-red-500/10'
                        }`}
                    >
                      {isPlacingOrder ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-stone-500 border-t-white rounded-full animate-spin inline-block"></span>
                          Placing Your Order...
                        </>
                      ) : (
                        <>
                          Confirm & Place Order <Check className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : cart.length === 0 ? (
                /* Empty Cart State */
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-stone-400">
                  <Pizza className="w-16 h-16 text-stone-200 stroke-[1] mb-4 animate-pulse" />
                  <h4 className="font-serif text-lg text-stone-700 font-bold mb-1">Your cart is empty</h4>
                  <p className="text-xs text-stone-500 max-w-xs mb-6">
                    Add some hot sourdough pizzas and artisanal sides from our menu.
                  </p>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="px-5 py-2.5 bg-[#e63946] hover:bg-[#d62839] text-white font-bold text-xs tracking-wider uppercase rounded-full shadow-md transition-all cursor-pointer"
                  >
                    Start Exploring Menu
                  </button>
                </div>
              ) : (
                /* Active Cart Items View */
                <>
                  <div className="flex-grow overflow-y-auto px-6 py-4 flex flex-col gap-4">
                    <AnimatePresence>
                      {cart.map((item) => {
                        const price = item.selectedSize ? item.selectedSize.price : (item.menuItem.price || 0);
                        return (
                          <motion.div
                            layout
                            key={item.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            className="p-4 bg-stone-50 rounded-2xl border border-stone-200 flex gap-4 text-left relative group hover:bg-stone-50/80 transition-all"
                          >
                            {/* Food Mini Image */}
                            <div className="w-16 h-16 rounded-xl bg-stone-200 overflow-hidden flex-shrink-0 relative">
                              {item.menuItem.image_url ? (
                                <img 
                                  src={item.menuItem.image_url} 
                                  alt={item.menuItem.name} 
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-[#f4f0e6] flex items-center justify-center">
                                  <Pizza className="w-6 h-6 text-[#e63946]" />
                                </div>
                              )}
                            </div>

                            {/* Item Details */}
                            <div className="flex-grow flex flex-col justify-between">
                              <div>
                                <div className="flex justify-between items-start gap-1">
                                  <h4 className="font-serif font-bold text-stone-900 text-sm leading-tight">
                                    {item.menuItem.name}
                                  </h4>
                                  <button
                                    onClick={() => handleRemoveFromCart(item.id)}
                                    className="text-stone-400 hover:text-red-500 transition-colors p-0.5 rounded cursor-pointer"
                                    title="Remove item"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                                {item.selectedSize && (
                                  <span className="text-[10px] font-mono bg-stone-200/60 text-stone-600 px-2 py-0.5 rounded-full inline-block mt-1 font-bold">
                                    {item.selectedSize.size}
                                  </span>
                                )}
                              </div>

                              <div className="flex justify-between items-center mt-3">
                                {/* Quantity Controls */}
                                <div className="flex items-center gap-1.5 bg-white border border-stone-200 rounded-full p-1 shadow-xs">
                                  <button
                                    onClick={() => handleUpdateQuantity(item.id, -1)}
                                    className="w-5 h-5 rounded-full hover:bg-stone-100 flex items-center justify-center text-stone-500 cursor-pointer text-xs"
                                  >
                                    <Minus className="w-3 h-3" />
                                  </button>
                                  <span className="font-mono text-xs font-bold text-stone-800 w-5 text-center">
                                    {item.quantity}
                                  </span>
                                  <button
                                    onClick={() => handleUpdateQuantity(item.id, 1)}
                                    className="w-5 h-5 rounded-full hover:bg-stone-100 flex items-center justify-center text-stone-500 cursor-pointer text-xs"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </button>
                                </div>

                                {/* Aggregated Item Price */}
                                <span className="font-serif font-extrabold text-[#1d3557] text-sm">
                                  ₹{Math.round(price * item.quantity)}
                                </span>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>

                  {/* Drawer Footer Subtotal Panel */}
                  <div className="p-6 bg-stone-50 border-t border-stone-200/80 flex flex-col gap-4 text-left">
                    <div className="flex flex-col gap-2 font-medium">
                      <div className="flex justify-between text-xs text-stone-500">
                        <span>Subtotal Selection</span>
                        <span className="font-mono font-bold">₹{Math.round(cartTotal)}</span>
                      </div>
                      <div className="flex justify-between text-xs text-stone-500">
                        <span>Delivery dispatch fee</span>
                        <span className="text-[#e63946] font-bold uppercase text-[10px] font-mono tracking-wider">FREE OF CHARGE</span>
                      </div>
                      <div className="flex justify-between text-sm text-stone-900 border-t border-dashed border-stone-300 pt-3">
                        <span className="font-serif font-extrabold text-[#1d3557] text-base">Total Order Value</span>
                        <span className="font-serif font-extrabold text-lg text-[#1d3557]">₹{Math.round(cartTotal)}</span>
                      </div>
                    </div>

                    {cartTotal < 250 && (
                      <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-[#e63946] text-xs font-bold text-center animate-pulse">
                        Minimum order amount is ₹250.
                      </div>
                    )}

                    <button
                      onClick={handleProceedToCheckout}
                      disabled={cartTotal < 250}
                      className={`w-full py-4 rounded-full font-bold tracking-wider uppercase text-xs transition-all flex items-center justify-center gap-2 cursor-pointer
                        ${cartTotal < 250
                          ? 'bg-stone-200 text-stone-400 cursor-not-allowed shadow-none border border-stone-300' 
                          : 'bg-[#e63946] hover:bg-[#d62839] text-white shadow-lg shadow-red-500/10 hover:shadow-xl active:scale-95'
                        }`}
                    >
                      Proceed to Checkout <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Visit Us Section */}
      <section id="visit-us" className="w-full bg-white py-16 px-4 md:px-8 border-t border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
              Visit <span className="text-[#e63946]">Ahli's Pizza</span>
            </h2>
            <div className="w-16 h-1 bg-[#e63946] mx-auto mt-4 rounded-full"></div>
            <p className="text-stone-500 mt-4 text-sm max-w-md mx-auto">
              Drop by for the freshest sourdough pizzas in Fatehabad or contact us online!
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            {/* Left Column: Details Card */}
            <div className="bg-[#f8f9fa] border border-gray-100 p-8 rounded-3xl flex flex-col justify-between shadow-md hover:shadow-lg transition-all duration-300 text-left">
              <div className="flex flex-col gap-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-serif text-2xl font-bold text-gray-950 mb-2">Ahli's Pizza</h3>
                    <p className="text-stone-500 text-xs tracking-wider uppercase font-mono font-bold text-[#e63946]">
                      Authentic Sourdough Pizzeria
                    </p>
                  </div>
                  {/* Quick Social Link in Card */}
                  <a 
                    href="https://www.instagram.com/ahlis_pizza?igsh=bHQwcXFuMW53YTU5" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="p-3 bg-[#e63946]/10 hover:bg-[#e63946] text-[#e63946] hover:text-white rounded-full transition-all duration-300 hover:scale-110 shadow-xs"
                    title="Follow us on Instagram"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                </div>

                <div className="flex flex-col gap-5">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-red-50 text-[#e63946] rounded-2xl flex-shrink-0 mt-0.5 shadow-sm">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-gray-900 mb-1">Our Address</h4>
                      <p className="text-stone-600 text-sm leading-relaxed font-medium">
                        Opp. PAPHIYA PARK, Model Town, Fatehabad, Haryana 125050
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-red-50 text-[#e63946] rounded-2xl flex-shrink-0 mt-0.5 shadow-sm">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-gray-900 mb-1">Call Us</h4>
                      <a 
                        href="tel:9996733339" 
                        className="text-[#e63946] hover:text-[#d62839] text-base font-bold transition-colors duration-200 inline-block font-mono"
                      >
                        9996733339
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-red-50 text-[#e63946] rounded-2xl flex-shrink-0 mt-0.5 shadow-sm">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-gray-900 mb-1">Opening Hours</h4>
                      <p className="text-stone-600 text-sm font-medium">
                        8:00 AM – 10:00 PM <span className="text-xs text-stone-400 font-mono ml-1.5 font-bold uppercase">(Every Day)</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200/50">
                <a 
                  href="https://maps.app.goo.gl/7ceEWLZiMKpkT98d6" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-[#e63946] hover:bg-[#d62839] text-white rounded-full text-sm font-bold shadow-md shadow-red-500/10 transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                >
                  Open in Google Maps <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Right Column: Google Maps iFrame */}
            <div className="relative rounded-3xl overflow-hidden border border-gray-200 bg-gray-100 min-h-[350px] lg:min-h-full shadow-md hover:shadow-lg transition-all duration-300">
              <iframe 
                src="https://maps.google.com/maps?q=Opp.+PAPHIYA+PARK,+Model+Town,+Fatehabad,+Haryana+125050&t=&z=15&ie=UTF8&iwloc=&output=embed" 
                className="absolute top-0 left-0 w-full h-full border-0"
                allowFullScreen={false} 
                loading="lazy" 
                referrerPolicy="no-referrer"
                title="Ahli's Pizza Location Map"
              ></iframe>
            </div>
          </div>
        </div>
      </section>
        </>
      )}
      </div>

      {/* Premium Footer with social links & rounded top corners */}
      <footer id="footer-section" className="bg-[#1d3557] text-white py-16 px-4 md:px-8 text-left rounded-t-[2.5rem] md:rounded-t-[4rem] shadow-2xl relative overflow-hidden border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col gap-12">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* Column 1: Restaurant Info */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-[#e63946] text-white rounded-xl">
                  <Pizza className="w-5 h-5 animate-bounce" style={{ animationDuration: '3s' }} />
                </div>
                <h3 className="font-serif text-white font-extrabold text-xl tracking-tight">
                  Ahli's <span className="text-[#e63946]">Pizza</span>
                </h3>
              </div>
              <p className="text-xs text-stone-200 leading-relaxed max-w-xs">
                Handcrafted sourdough pizzas baked to crispy bubbly perfection using fresh premium ingredients. Delivered hot in Fatehabad.
              </p>
              <div className="flex items-center gap-3 mt-2">
                <a 
                  href="https://www.instagram.com/ahlis_pizza?igsh=bHQwcXFuMW53YTU5" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="p-2.5 bg-white/10 hover:bg-[#e63946] text-white rounded-full transition-all duration-300 hover:scale-110 shadow-xs hover:shadow-md"
                  title="Follow Ahli's Pizza on Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Column 2: Opening Hours */}
            <div className="flex flex-col gap-4">
              <h4 className="font-serif text-white font-bold text-lg flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#e63946]" /> Opening Hours
              </h4>
              <div className="flex flex-col gap-2 text-xs text-stone-200 font-medium">
                <div className="flex justify-between border-b border-white/10 pb-1.5">
                  <span>Every Day:</span>
                  <span>8:00 AM – 10:00 PM</span>
                </div>
              </div>
            </div>

            {/* Column 3: Contact & Location */}
            <div className="flex flex-col gap-4">
              <h4 className="font-serif text-white font-bold text-lg flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#e63946]" /> Contact Details
              </h4>
              <div className="flex flex-col gap-3 text-xs text-stone-200">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-white/60 flex-shrink-0 mt-0.5" />
                  <span>Opp. PAPHIYA PARK, Model Town, Fatehabad, Haryana 125050</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-white/60 flex-shrink-0" />
                  <a href="tel:9996733339" className="hover:text-[#e63946] transition-colors font-mono font-semibold">
                    9996733339
                  </a>
                </div>
              </div>
            </div>

            {/* Column 4: Quick Navigation & Maps */}
            <div className="flex flex-col gap-4">
              <h4 className="font-serif text-white font-bold text-lg">Find Us On Maps</h4>
              <p className="text-xs text-stone-200 leading-relaxed">
                We are situated right opposite Paphiya Park in Model Town. Click below to view directions on Google Maps.
              </p>
              <a 
                href="https://maps.app.goo.gl/7ceEWLZiMKpkT98d6" 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full py-3 bg-[#e63946] hover:bg-[#d62839] text-white rounded-xl text-xs font-bold tracking-wider uppercase transition-all duration-250 shadow-md hover:shadow-red-500/20 cursor-pointer text-center hover:scale-[1.02]"
              >
                Get Directions <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

          </div>

          {/* Sub Footer Rights bar */}
          <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-stone-300 font-medium">
            <p>© 2026 Ahli's Pizza. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-[#e63946] transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-[#e63946] transition-colors">Terms of Service</a>
            </div>
          </div>

        </div>
      </footer>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
        {/* Floating Call Button */}
        <a
          href="tel:9996733339"
          className="flex items-center justify-center w-14 h-14 bg-[#e63946] hover:bg-[#d62839] text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 active:scale-95 group"
          title="Call Us"
        >
          <Phone className="w-6 h-6 animate-pulse" />
        </a>
        {/* Floating WhatsApp Button */}
        <a
          href="https://wa.me/919996733339"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-14 h-14 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 active:scale-95"
          title="Chat on WhatsApp"
        >
          <MessageCircle className="w-6 h-6" />
        </a>
      </div>

      {/* Premium Intercepted Alerts & Toast Overlay */}
      <AnimatePresence>
        {appNotification && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-[9999] w-[90%] max-w-md bg-white/95 backdrop-blur-md border border-stone-200/80 shadow-2xl rounded-3xl p-5 flex items-start gap-4 pointer-events-auto"
          >
            <div className="p-2.5 bg-[#e63946]/10 text-[#e63946] rounded-2xl flex-shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="flex-grow text-left">
              <h4 className="font-serif text-sm font-black text-[#1d3557]">Notification</h4>
              <p className="text-xs text-stone-600 mt-1 leading-relaxed font-sans">{appNotification.message}</p>
            </div>
            <button
              onClick={() => setAppNotification(null)}
              className="p-1.5 hover:bg-stone-100 rounded-xl text-stone-400 hover:text-stone-600 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
