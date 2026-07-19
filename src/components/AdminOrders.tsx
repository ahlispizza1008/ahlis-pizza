import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { getOrderDisplayId } from '../utils/orderUtils';
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  User, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  AlertCircle, 
  Clock3, 
  Truck, 
  XCircle, 
  RefreshCw,
  DollarSign,
  Pizza,
  Eye,
  CreditCard,
  Bell,
  X,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  size_name: string;
  quantity: number;
  price: number;
  itemName?: string;
  itemImage?: string;
}

interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  total_amount: number;
  payment_method: string;
  order_status: string;
  delivery_address: string;
  upi_id: string | null;
  user_id: string;
  created_at: string;
  items: OrderItem[];
  payment_status: string;
  special_instructions?: string | null;
  order_number?: number | null;
}

const MOCK_ADMIN_ORDERS: Order[] = [
  {
    id: 'o1',
    customer_name: 'Naveen Kamboj',
    customer_phone: '9876543210',
    total_amount: 54.20,
    payment_method: 'upi',
    order_status: 'delivered',
    payment_status: 'completed',
    delivery_address: 'Sector 15, Chandigarh, India',
    upi_id: 'naveen@upi',
    user_id: 'user1',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    items: [
      {
        id: 'oi1',
        order_id: 'o1',
        menu_item_id: 'a1111111-1111-1111-1111-111111111111',
        size_name: 'Medium 12"',
        quantity: 2,
        price: 15.75,
        itemName: 'Classic Margherita',
        itemImage: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 'oi2',
        order_id: 'o1',
        menu_item_id: 'a5555555-5555-5555-5555-555555555555',
        size_name: '12 Knots',
        quantity: 1,
        price: 11.95,
        itemName: 'Garlic Butter Dough Knots',
        itemImage: 'https://images.unsplash.com/photo-1619535860434-ba1d8fa12536?auto=format&fit=crop&w=800&q=80'
      }
    ]
  },
  {
    id: 'o2',
    customer_name: 'Preeti Sharma',
    customer_phone: '8765432109',
    total_amount: 18.95,
    payment_method: 'cod',
    order_status: 'preparing',
    payment_status: 'pending',
    delivery_address: 'Phase 3B2, Mohali, India',
    upi_id: null,
    user_id: 'user2',
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    items: [
      {
        id: 'oi3',
        order_id: 'o2',
        menu_item_id: 'a4444444-4444-4444-4444-444444444444',
        size_name: 'Medium 12"',
        quantity: 1,
        price: 18.95,
        itemName: 'Smoky BBQ Pulled Chicken',
        itemImage: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80'
      }
    ]
  },
  {
    id: 'o3',
    customer_name: 'Vikram Singh',
    customer_phone: '7654321098',
    total_amount: 32.50,
    payment_method: 'upi',
    order_status: 'ready',
    payment_status: 'completed',
    delivery_address: 'Sukhna Lake Road, Chandigarh',
    upi_id: 'vikram@upi',
    user_id: 'user3',
    created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
    items: [
      {
        id: 'oi4',
        order_id: 'o3',
        menu_item_id: 'a2222222-2222-2222-2222-222222222222',
        size_name: 'Medium 12"',
        quantity: 1,
        price: 17.95,
        itemName: "Ahli's Spicy Pepperoni",
        itemImage: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 'oi5',
        order_id: 'o3',
        menu_item_id: 'a6666666-6666-6666-6666-666666666666',
        size_name: 'Regular 10"',
        quantity: 1,
        price: 10.95,
        itemName: 'Chocolate Nutella Berry Pizza',
        itemImage: 'https://images.unsplash.com/photo-1590947132387-155cc02f3212?auto=format&fit=crop&w=800&q=80'
      }
    ]
  },
  {
    id: 'o4',
    customer_name: 'Anjali Gupta',
    customer_phone: '9012345678',
    total_amount: 45.75,
    payment_method: 'upi',
    order_status: 'out_for_delivery',
    payment_status: 'completed',
    delivery_address: 'Sector 22-B, Chandigarh',
    upi_id: 'anjali@okaxis',
    user_id: 'user4',
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    items: [
      {
        id: 'oi6',
        order_id: 'o4',
        menu_item_id: 'a3333333-3333-3333-3333-333333333333',
        size_name: 'Medium 12"',
        quantity: 1,
        price: 20.25,
        itemName: 'Truffle Mushroom Bianco',
        itemImage: 'https://images.unsplash.com/photo-1544982503-9f984c14501a?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 'oi7',
        order_id: 'o4',
        menu_item_id: 'a1111111-1111-1111-1111-111111111111',
        size_name: 'Personal 10"',
        quantity: 1,
        price: 12.50,
        itemName: 'Classic Margherita',
        itemImage: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=800&q=80'
      }
    ]
  }
];

export const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [updatingStatuses, setUpdatingStatuses] = useState<Record<string, boolean>>({});
  const [newOrderNotification, setNewOrderNotification] = useState<{
    id: string;
    customer_name: string;
    total_amount: number;
  } | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [notificationAudio] = useState(() => {
    try {
      const audio = new Audio('https://jcyxbpoergyslwcwjluv.supabase.co/storage/v1/object/public/assets/notification.mp3');
      audio.preload = 'auto';
      return audio;
    } catch (e) {
      console.error('Failed to initialize notification audio:', e);
      return null;
    }
  });

  // Pre-unlock audio playback on first user gesture for desktop & mobile browsers
  useEffect(() => {
    const unlockAudio = () => {
      if (notificationAudio) {
        notificationAudio.volume = 0;
        notificationAudio.play()
          .then(() => {
            notificationAudio.pause();
            notificationAudio.currentTime = 0;
            notificationAudio.volume = 0.5;
          })
          .catch(e => {
            console.warn('Audio play/unlock failed on interaction:', e);
          });
      }
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    };

    window.addEventListener('click', unlockAudio);
    window.addEventListener('touchstart', unlockAudio);

    return () => {
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    };
  }, [notificationAudio]);

  const fetchOrders = async (forceReal = false, silent = false) => {
    if (!silent) {
      setLoading(true);
    }
    setError(null);

    if (isPreviewMode && !forceReal) {
      if (!silent) {
        setLoading(false);
      }
      return;
    }

    try {
      // 1. Fetch all orders sorted by date newest first
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      if (!ordersData || ordersData.length === 0) {
        setOrders([]);
        if (!silent) {
          setLoading(false);
        }
        setIsPreviewMode(false);
        return;
      }

      const orderIds = ordersData.map(o => o.id);

      // 2. Fetch related order items
      const { data: itemsData, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .in('order_id', orderIds);

      if (itemsError) throw itemsError;

      // 3. Fetch menu items for names and images
      const { data: menuItemsData, error: menuItemsError } = await supabase
        .from('menu_items')
        .select('*');

      const menuItemMap = new Map<string, { name: string; image_url?: string }>();
      if (menuItemsData && !menuItemsError) {
        menuItemsData.forEach(item => {
          menuItemMap.set(item.id, { name: item.name, image_url: item.image_url });
        });
      }

      // 4. Map items to corresponding orders
      const ordersWithItems: Order[] = ordersData.map(order => {
        const relatedItems = (itemsData || [])
          .filter(item => item.order_id === order.id)
          .map(item => {
            const details = menuItemMap.get(item.menu_item_id);
            return {
              ...item,
              itemName: details?.name || 'Delicious Pizza',
              itemImage: details?.image_url,
            };
          });

        return {
          ...order,
          payment_status: order.payment_status,
          items: relatedItems,
        };
      });

      setOrders(ordersWithItems);
      setIsPreviewMode(false);
    } catch (err: any) {
      console.warn('Error fetching admin orders, falling back to simulated pipeline:', err.message || err);
      setOrders(MOCK_ADMIN_ORDERS);
      setIsPreviewMode(true);
      setError(null); // Clear error since we have a complete fallback
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchOrders();

    // Set up real-time subscription for orders
    const ordersChannel = supabase
      .channel('admin-orders-realtime-channel')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload) => {
          // Reload orders
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
    };
  }, [isPreviewMode]);

  useEffect(() => {
    if (newOrderNotification) {
      const timer = setTimeout(() => {
        setNewOrderNotification(null);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [newOrderNotification]);

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdatingStatuses(prev => ({ ...prev, [orderId]: true }));

    if (isPreviewMode) {
      setOrders(prevOrders => 
        prevOrders.map(o => 
          o.id === orderId ? { ...o, order_status: newStatus } : o
        )
      );
      setUpdatingStatuses(prev => ({ ...prev, [orderId]: false }));
      return;
    }

    try {
      const { data, error: updateError } = await supabase
        .from('orders')
        .update({ order_status: newStatus })
        .eq('id', orderId)
        .select();

      if (updateError) throw updateError;

      // Re-fetch orders from database after update is complete
      await fetchOrders(false, true);
    } catch (err: any) {
      console.error('Error updating status:', err);
      alert(`Failed to update order status: ${err.message}`);
    } finally {
      setUpdatingStatuses(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const handleUpdatePaymentStatus = async (orderId: string, newStatus: string) => {
    setUpdatingStatuses(prev => ({ ...prev, [orderId]: true }));

    if (isPreviewMode) {
      setOrders(prevOrders => 
        prevOrders.map(o => 
          o.id === orderId ? { ...o, payment_status: newStatus } : o
        )
      );
      setUpdatingStatuses(prev => ({ ...prev, [orderId]: false }));
      return;
    }

    try {
      const { data, error: updateError } = await supabase
        .from('orders')
        .update({ payment_status: newStatus })
        .eq('id', orderId)
        .select();

      if (updateError) throw updateError;

      // Re-fetch orders from database after update is complete
      await fetchOrders(false, true);
    } catch (err: any) {
      console.error('Error updating payment status:', err);
      alert(`Failed to update payment status: ${err.message}`);
    } finally {
      setUpdatingStatuses(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const toggleExpandOrder = (id: string) => {
    setExpandedOrderId(prev => (prev === id ? null : id));
  };

  // Colored badges mapping for order status
  const getOrderStatusStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 'bg-blue-50 text-blue-700 border-blue-200 focus:ring-blue-500'; // delivered = blue
      case 'cancelled':
        return 'bg-rose-50 text-rose-700 border-rose-200 focus:ring-rose-500'; // cancelled = red
      case 'received':
        return 'bg-purple-50 text-purple-700 border-purple-200 focus:ring-purple-500';
      case 'preparing':
        return 'bg-amber-50 text-amber-700 border-amber-200 focus:ring-amber-500';
      case 'ready':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 focus:ring-emerald-500';
      case 'out_for_delivery':
        return 'bg-sky-50 text-sky-700 border-sky-200 focus:ring-sky-500';
      default:
        return 'bg-stone-50 text-stone-700 border-stone-200 focus:ring-stone-500';
    }
  };

  // Colored badges mapping for payment status
  const getPaymentStatusStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-200 focus:ring-amber-500'; // pending = yellow
      case 'completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 focus:ring-emerald-500'; // completed = green
      case 'failed':
        return 'bg-rose-50 text-rose-700 border-rose-200 focus:ring-rose-500'; // failed = red
      default:
        return 'bg-stone-50 text-stone-700 border-stone-200 focus:ring-stone-500';
    }
  };

  // Filter & Search logic
  const filteredOrders = orders.filter(order => {
    const matchesStatus = statusFilter === 'all' || order.order_status?.toLowerCase() === statusFilter.toLowerCase();
    const matchesPayment = paymentFilter === 'all' || order.payment_status?.toLowerCase() === paymentFilter.toLowerCase();
    
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      order.customer_name.toLowerCase().includes(searchLower) ||
      (order.customer_phone && order.customer_phone.includes(searchLower)) ||
      (order.delivery_address && order.delivery_address.toLowerCase().includes(searchLower)) ||
      order.id.toLowerCase().includes(searchLower) ||
      getOrderDisplayId(order.id, order.order_number).toLowerCase().includes(searchLower);

    return matchesStatus && matchesPayment && matchesSearch;
  });

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };

  // Status List declarations
  const orderStatusOptions = [
    { value: 'received', label: 'Received' },
    { value: 'preparing', label: 'Preparing' },
    { value: 'ready', label: 'Ready' },
    { value: 'out_for_delivery', label: 'Out for Delivery' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const paymentStatusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'completed', label: 'Completed' },
    { value: 'failed', label: 'Failed' }
  ];

  // Helper counters for header overview cards
  const pendingPaymentCount = orders.filter(o => o.payment_status === 'pending').length;
  const completedPaymentCount = orders.filter(o => o.payment_status === 'completed').length;
  const preparingOrderCount = orders.filter(o => o.order_status === 'preparing' || o.order_status === 'received').length;

  return (
    <div className="space-y-6">
      {/* Real-time Order Alert Floating Banner */}
      <AnimatePresence>
        {newOrderNotification && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-stone-900 border border-stone-800 text-white rounded-2xl shadow-2xl p-4 flex gap-3.5 items-start font-sans"
          >
            <div className="p-2 bg-red-500 rounded-xl text-white">
              <Bell className="w-5 h-5 animate-bounce" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono tracking-wider font-extrabold text-red-400 uppercase">New Order Received</span>
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              </div>
              <h4 className="font-extrabold text-sm text-stone-100 truncate mt-0.5">
                {newOrderNotification.customer_name}
              </h4>
              <p className="text-[11px] text-stone-400 mt-0.5">
                Total Amount: <span className="font-bold text-white font-sans text-xs">₹{Math.round(newOrderNotification.total_amount)}</span>
              </p>
            </div>
            <button
              onClick={() => setNewOrderNotification(null)}
              className="p-1 hover:bg-stone-800 text-stone-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-black text-gray-950 font-sans">Kitchen Orders</h1>
          <p className="text-sm text-stone-500 font-medium">Monitor active ovens, track delivery streams, and manage secure transactions.</p>
        </div>
        <button
          onClick={fetchOrders}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 hover:border-stone-300 font-bold text-xs tracking-wider uppercase rounded-xl transition-all shadow-xs cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Orders
        </button>
      </div>

      {/* Sandbox/Preview Mode Banner */}
      {isPreviewMode && (
        <div className="bg-amber-500 text-white text-xs font-semibold p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md border border-amber-400">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-amber-200 animate-pulse shrink-0" />
            <div>
              <p className="font-extrabold uppercase tracking-wide">Demo Sandbox Preview Enabled</p>
              <p className="text-[11px] font-normal text-amber-100 mt-0.5">
                The live order queue database is currently unavailable. Enjoy navigating the custom tracking tools with realistic order logs!
              </p>
            </div>
          </div>
          <button
            onClick={() => fetchOrders(true)}
            className="px-3 py-1.5 bg-white text-amber-700 hover:bg-amber-50 font-bold rounded-lg text-[10px] uppercase tracking-wider transition-colors cursor-pointer shrink-0"
          >
            Retry Live Database
          </button>
        </div>
      )}

      {/* Top summary boxes */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-stone-100 shadow-xs flex items-center gap-3">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-mono text-stone-400 uppercase tracking-wider">Unpaid Tickets</div>
            <div className="text-lg font-black text-stone-900">{pendingPaymentCount} orders pending</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-100 shadow-xs flex items-center gap-3">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-mono text-stone-400 uppercase tracking-wider">Paid Settlements</div>
            <div className="text-lg font-black text-stone-900">{completedPaymentCount} orders completed</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-100 shadow-xs flex items-center gap-3">
          <div className="p-3 bg-[#e63946]/5 text-[#e63946] rounded-xl">
            <Pizza className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-mono text-stone-400 uppercase tracking-wider">Oven Queue</div>
            <div className="text-lg font-black text-stone-900">{preparingOrderCount} active bakes</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-stone-100 shadow-xs flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="Search orders by customer name, phone number, address, order ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 focus:border-red-400 rounded-xl text-xs font-semibold text-stone-800 placeholder-stone-400 outline-none transition-all"
            />
          </div>

          {/* Quick Payment Status selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-stone-400 shrink-0 font-mono uppercase tracking-wider">Payment Filter:</span>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="px-3 py-2 bg-stone-50 border border-stone-200 hover:border-stone-300 rounded-xl text-xs font-bold text-stone-700 outline-none transition-all cursor-pointer"
            >
              <option value="all">All Payment Statuses</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>

        {/* Filter Badges */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 md:pb-0 scrollbar-none border-t border-stone-50 pt-3">
          <Filter className="w-4 h-4 text-stone-400 shrink-0 hidden sm:block mr-1" />
          {[
            { value: 'all', label: 'All Orders' },
            { value: 'received', label: 'Received' },
            { value: 'preparing', label: 'Preparing' },
            { value: 'ready', label: 'Ready' },
            { value: 'out_for_delivery', label: 'Out for Delivery' },
            { value: 'delivered', label: 'Delivered' },
            { value: 'cancelled', label: 'Cancelled' }
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-3.5 py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer border ${
                statusFilter === tab.value
                  ? 'bg-red-500 text-white border-red-500 shadow-sm shadow-red-500/15'
                  : 'bg-white hover:bg-stone-50 text-stone-600 border-stone-200 hover:border-stone-300'
              }`}
            >
              {tab.label}
              {tab.value !== 'all' && (
                <span className={`ml-1.5 px-1 rounded-md text-[9px] ${statusFilter === tab.value ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-500'}`}>
                  {orders.filter(o => o.order_status?.toLowerCase() === tab.value).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Output */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <RefreshCw className="w-10 h-10 text-[#e63946] animate-spin" />
          <p className="text-sm font-semibold text-stone-500">Querying order archives...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-50 border border-red-100 rounded-3xl text-red-600 text-sm font-semibold flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p>Error retrieving order history</p>
            <p className="text-xs font-normal text-red-500">{error}</p>
          </div>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-stone-100 p-16 text-center shadow-xs">
          <ShoppingBag className="w-12 h-12 text-stone-300 mx-auto mb-4" />
          <h3 className="font-bold text-stone-800">No orders found</h3>
          <p className="text-xs text-stone-400 mt-1 max-w-sm mx-auto">
            We couldn't find any orders matching your search or filters. When customers place orders, they will instantly appear here.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-stone-100 overflow-hidden shadow-xs">
          {/* Main Desktop Responsive Table Layout */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-medium border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-100 text-stone-500 uppercase tracking-wider font-mono text-[10px]">
                  <th className="py-4 px-5">Order ID</th>
                  <th className="py-4 px-5">Order Type</th>
                  <th className="py-4 px-5">Customer Name</th>
                  <th className="py-4 px-5">Phone</th>
                  <th className="py-4 px-5">Total</th>
                  <th className="py-4 px-5">Payment Method</th>
                  <th className="py-4 px-5">Payment Status</th>
                  <th className="py-4 px-5">Order Status</th>
                  <th className="py-4 px-5">Date</th>
                  <th className="py-4 px-5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredOrders.map((order) => {
                  const isExpanded = expandedOrderId === order.id;
                  const itemsCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

                  // Parse Order Type & Details
                  const isDineIn = order.delivery_address?.startsWith('Dine-In');
                  let orderTypeAndDetails = {
                    type: 'delivery' as 'delivery' | 'dine-in',
                    persons: '',
                    date: '',
                    time: '',
                    address: order.delivery_address || ''
                  };

                  if (isDineIn) {
                    const match = order.delivery_address.match(/Dine-In \((.*?) persons\) on (.*?) at (.*)/);
                    if (match) {
                      orderTypeAndDetails = {
                        type: 'dine-in',
                        persons: match[1],
                        date: match[2],
                        time: match[3],
                        address: ''
                      };
                    } else {
                      orderTypeAndDetails = {
                        type: 'dine-in',
                        persons: 'Unknown',
                        date: 'Unknown',
                        time: 'Unknown',
                        address: ''
                      };
                    }
                  }

                  return (
                    <React.Fragment key={order.id}>
                      {/* Table row itself */}
                      <tr 
                        className={`hover:bg-stone-50/60 transition-colors duration-150 ${
                          isExpanded ? 'bg-red-50/15' : ''
                        }`}
                      >
                        {/* Order ID column */}
                        <td className="py-3 px-5">
                          <button 
                            onClick={() => toggleExpandOrder(order.id)}
                            className="font-mono font-black text-[#e63946] hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            {getOrderDisplayId(order.id, order.order_number)}
                          </button>
                        </td>

                        {/* Order Type column */}
                        <td className="py-3 px-5">
                          {orderTypeAndDetails.type === 'dine-in' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-50 border border-purple-100 text-purple-700 text-[10px] font-bold">
                              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                              Dine-In
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-[10px] font-bold">
                              <Truck className="w-3 h-3 text-blue-500" />
                              Delivery
                            </span>
                          )}
                        </td>

                        {/* Customer Name column */}
                        <td className="py-3 px-5 font-bold text-stone-900">
                          <div>{order.customer_name}</div>
                          {orderTypeAndDetails.type === 'dine-in' ? (
                            <div className="text-[10px] text-purple-600 font-medium mt-0.5 space-y-0.5">
                              <div>• {orderTypeAndDetails.persons} Persons</div>
                              <div>• Date: {orderTypeAndDetails.date}</div>
                              <div>• Time: {orderTypeAndDetails.time}</div>
                            </div>
                          ) : (
                            <div className="text-[10px] text-stone-500 font-normal mt-0.5 max-w-[250px] whitespace-normal break-words leading-relaxed">
                              {order.delivery_address}
                            </div>
                          )}
                        </td>

                        {/* Phone column */}
                        <td className="py-3 px-5 font-mono text-stone-600">
                          {order.customer_phone}
                        </td>

                        {/* Total column */}
                        <td className="py-3 px-5 font-extrabold text-stone-900 text-[13px]">
                          ₹{order.total_amount}
                        </td>

                        {/* Payment Method column */}
                        <td className="py-3 px-5">
                          <span className="inline-block px-2 py-0.5 rounded-md bg-stone-100 border border-stone-200 text-stone-600 text-[9px] font-bold uppercase">
                            {order.payment_method === 'dine-in' ? 'Pay at Restaurant' : (order.payment_method === 'upi' ? 'UPI' : 'COD')}
                          </span>
                        </td>

                        {/* Payment Status Dropdown column */}
                        <td className="py-3 px-5">
                          <select
                            value={order.payment_status}
                            onChange={(e) => handleUpdatePaymentStatus(order.id, e.target.value)}
                            disabled={updatingStatuses[order.id] || order.payment_method === 'dine-in'}
                            className={`px-2 py-1 border text-[10px] font-bold rounded-lg outline-none transition-all cursor-pointer ${getPaymentStatusStyle(order.payment_status)} ${order.payment_method === 'dine-in' ? 'opacity-60 cursor-not-allowed' : ''}`}
                          >
                            {paymentStatusOptions.map(opt => (
                              <option key={opt.value} value={opt.value} className="bg-white text-stone-800 font-semibold">
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </td>

                        {/* Order Status Dropdown column */}
                        <td className="py-3 px-5">
                          <select
                            value={order.order_status}
                            onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                            disabled={updatingStatuses[order.id]}
                            className={`px-2 py-1 border text-[10px] font-bold rounded-lg outline-none transition-all cursor-pointer ${getOrderStatusStyle(order.order_status)}`}
                          >
                            {orderStatusOptions.map(opt => (
                              <option key={opt.value} value={opt.value} className="bg-white text-stone-800 font-semibold">
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </td>

                        {/* Date column */}
                        <td className="py-3 px-5 text-stone-500 text-[11px]">
                          {formatDate(order.created_at)}
                        </td>

                        {/* Actions column */}
                        <td className="py-3 px-5 text-center">
                          <button
                            onClick={() => toggleExpandOrder(order.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-stone-50 border border-stone-200 hover:border-stone-300 hover:bg-stone-100 text-stone-700 text-[10px] font-bold uppercase rounded-lg transition-all cursor-pointer shadow-xs active:scale-95"
                          >
                            <Eye className="w-3.5 h-3.5 text-[#e63946]" />
                            <span>{isExpanded ? 'Hide' : 'Details'}</span>
                          </button>
                        </td>
                      </tr>

                      {/* Expandable items and detailed block view */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={10} className="bg-stone-50/40 p-5 border-t border-b border-stone-100">
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              transition={{ duration: 0.2 }}
                              className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left"
                            >
                              {/* Order Items column */}
                              <div className="space-y-3">
                                <h4 className="font-serif text-sm font-bold text-[#1d3557] flex items-center gap-2">
                                  <Pizza className="w-4 h-4 text-[#e63946]" />
                                  Ordered Pizza Items ({itemsCount})
                                </h4>
                                
                                <div className="bg-white border border-stone-100 rounded-2xl overflow-hidden shadow-xs divide-y divide-stone-50">
                                  {order.items.map((item) => (
                                    <div key={item.id} className="p-3 flex items-center justify-between gap-3 text-xs">
                                      <div className="flex items-center gap-3">
                                        {item.itemImage ? (
                                          <img
                                            src={item.itemImage}
                                            alt={item.itemName}
                                            className="w-10 h-10 object-cover rounded-lg shrink-0 border border-stone-100"
                                          />
                                        ) : (
                                          <div className="w-10 h-10 bg-red-50 text-[#e63946] border border-red-100 rounded-lg flex items-center justify-center shrink-0">
                                            <Pizza className="w-4 h-4 stroke-[2]" />
                                          </div>
                                        )}
                                        <div>
                                          <div className="font-bold text-stone-900">{item.itemName}</div>
                                          <div className="text-[10px] text-stone-400 mt-0.5">
                                            Size: <span className="font-bold text-stone-600">{item.size_name || 'Regular'}</span>
                                          </div>
                                        </div>
                                      </div>

                                      <div className="text-right">
                                        <div className="font-bold text-stone-900">₹{item.price * item.quantity}</div>
                                        <div className="text-[10px] text-stone-400 mt-0.5 font-mono">
                                          ₹{item.price} × {item.quantity}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                  
                                  <div className="p-3 bg-stone-50/60 flex items-center justify-between text-xs font-bold text-stone-900">
                                    <span>Settlement Price</span>
                                    <span>₹{order.total_amount}</span>
                                  </div>
                                </div>

                                {order.special_instructions && (
                                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2 shadow-xs">
                                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                    <div>
                                      <span className="font-bold text-[10px] tracking-wider uppercase text-amber-700 block mb-1">Special Instructions</span>
                                      <p className="font-semibold text-stone-800 leading-relaxed italic">
                                        "{order.special_instructions}"
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Logistics column */}
                              <div className="space-y-4">
                                <h4 className="font-serif text-sm font-bold text-[#1d3557] flex items-center gap-2">
                                  {orderTypeAndDetails.type === 'dine-in' ? (
                                    <>
                                      <Calendar className="w-4 h-4 text-purple-600" />
                                      Dine-In Details
                                    </>
                                  ) : (
                                    <>
                                      <MapPin className="w-4 h-4 text-blue-600" />
                                      Delivery Logistics
                                    </>
                                  )}
                                </h4>

                                <div className="bg-white border border-stone-100 rounded-2xl p-4 space-y-3.5 text-xs">
                                  <div>
                                    <div className="text-[10px] font-mono text-stone-400 uppercase tracking-wider">Customer Name & Phone</div>
                                    <div className="font-bold text-stone-800 mt-1 flex items-center gap-1">
                                      <User className="w-3.5 h-3.5 text-stone-400" />
                                      {order.customer_name} ({order.customer_phone})
                                    </div>
                                  </div>

                                  {orderTypeAndDetails.type === 'dine-in' ? (
                                    <>
                                      <div>
                                        <div className="text-[10px] font-mono text-stone-400 uppercase tracking-wider">Number of Persons</div>
                                        <p className="font-bold text-purple-700 mt-1 text-sm">{orderTypeAndDetails.persons} Persons</p>
                                      </div>
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <div className="text-[10px] font-mono text-stone-400 uppercase tracking-wider">Dine-In Date</div>
                                          <p className="font-semibold text-stone-800 mt-1">{orderTypeAndDetails.date}</p>
                                        </div>
                                        <div>
                                          <div className="text-[10px] font-mono text-stone-400 uppercase tracking-wider">Dine-In Time</div>
                                          <p className="font-semibold text-stone-800 mt-1">{orderTypeAndDetails.time}</p>
                                        </div>
                                      </div>
                                    </>
                                  ) : (
                                    <div>
                                      <div className="text-[10px] font-mono text-stone-400 uppercase tracking-wider">Drop-off Destination Address</div>
                                      <p className="font-semibold text-stone-800 mt-1 leading-relaxed">{order.delivery_address || 'No address specified'}</p>
                                    </div>
                                  )}

                                  {order.special_instructions && (
                                    <div className="border-t border-stone-100 pt-3">
                                      <div className="text-[10px] font-mono text-[#e63946] uppercase tracking-wider font-bold">Special Instructions</div>
                                      <p className="font-semibold text-stone-800 mt-1 italic bg-red-50/25 p-2.5 rounded-xl border border-red-100/40 leading-relaxed">
                                        "{order.special_instructions}"
                                      </p>
                                    </div>
                                  )}

                                  <div className="grid grid-cols-2 gap-4 border-t border-stone-50 pt-3">
                                    <div>
                                      <div className="text-[10px] font-mono text-stone-400 uppercase tracking-wider">Payment Method</div>
                                      <div className="font-bold text-stone-800 mt-1 uppercase text-[10px] flex items-center gap-1">
                                        {order.payment_method === 'dine-in' ? (
                                          <span className="text-purple-600 font-mono">Pay at Restaurant</span>
                                        ) : order.payment_method === 'upi' ? (
                                          <span className="text-purple-600 font-mono">UPI Digital</span>
                                        ) : (
                                          <span className="text-amber-700 font-mono">Cash On Delivery</span>
                                        )}
                                      </div>
                                    </div>

                                    {order.upi_id && (
                                      <div>
                                        <div className="text-[10px] font-mono text-stone-400 uppercase tracking-wider">Sender UPI ID</div>
                                        <p className="font-mono font-bold text-stone-700 mt-1 select-all">{order.upi_id}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
