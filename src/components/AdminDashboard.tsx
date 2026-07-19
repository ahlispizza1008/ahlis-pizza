import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { getOrderDisplayId } from '../utils/orderUtils';
import { 
  DollarSign, 
  ShoppingBag, 
  Clock, 
  CheckCircle, 
  TrendingUp, 
  Pizza, 
  ArrowRight,
  RefreshCw,
  XCircle,
  TrendingDown,
  Calendar,
  Sparkles
} from 'lucide-react';
import { motion } from 'motion/react';

interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  size_name: string;
  quantity: number;
  price: number;
  itemName?: string;
}

interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  total_amount: number;
  payment_method: string;
  order_status: string;
  delivery_address: string;
  created_at: string;
  special_instructions?: string | null;
  order_number?: number | null;
}

interface AdminDashboardProps {
  onNavigate: (path: string) => void;
}

const MOCK_DASHBOARD_ORDERS: Order[] = [
  {
    id: 'o1',
    customer_name: 'Naveen Kamboj',
    customer_phone: '9876543210',
    total_amount: 54.20,
    payment_method: 'upi',
    order_status: 'delivered',
    delivery_address: 'Sector 15, Chandigarh, India',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString() // 2 hours ago
  },
  {
    id: 'o2',
    customer_name: 'Preeti Sharma',
    customer_phone: '8765432109',
    total_amount: 18.95,
    payment_method: 'cod',
    order_status: 'preparing',
    delivery_address: 'Phase 3B2, Mohali, India',
    created_at: new Date(Date.now() - 3600000 * 5).toISOString() // 5 hours ago
  },
  {
    id: 'o3',
    customer_name: 'Vikram Singh',
    customer_phone: '7654321098',
    total_amount: 32.50,
    payment_method: 'upi',
    order_status: 'ready',
    delivery_address: 'Sukhna Lake Road, Chandigarh',
    created_at: new Date(Date.now() - 3600000 * 8).toISOString() // 8 hours ago
  },
  {
    id: 'o4',
    customer_name: 'Anjali Gupta',
    customer_phone: '9012345678',
    total_amount: 45.75,
    payment_method: 'upi',
    order_status: 'out_for_delivery',
    delivery_address: 'Sector 22-B, Chandigarh',
    created_at: new Date(Date.now() - 3600000 * 12).toISOString() // 12 hours ago
  },
  {
    id: 'o5',
    customer_name: 'Amit Patel',
    customer_phone: '9543210987',
    total_amount: 22.95,
    payment_method: 'cod',
    order_status: 'cancelled',
    delivery_address: 'Industrial Area Phase 1, Panchkula',
    created_at: new Date(Date.now() - 3600000 * 24).toISOString() // 1 day ago
  },
  {
    id: 'o6',
    customer_name: 'Rohan Mehra',
    customer_phone: '9432109876',
    total_amount: 67.50,
    payment_method: 'upi',
    order_status: 'delivered',
    delivery_address: 'MDC Sector 4, Panchkula',
    created_at: new Date(Date.now() - 3600000 * 28).toISOString() // ~1.2 days ago
  }
];

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [menuItemsCount, setMenuItemsCount] = useState(0);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const fetchDashboardData = async (forceReal = false) => {
    setLoading(true);
    setError(null);

    if (isPreviewMode && !forceReal) {
      setLoading(false);
      return;
    }

    try {
      // Fetch all orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*');

      if (ordersError) throw ordersError;
      setOrders(ordersData || []);

      // Fetch menu items count for stats
      const { count, error: menuError } = await supabase
        .from('menu_items')
        .select('*', { count: 'exact', head: true });
      
      if (!menuError && count !== null) {
        setMenuItemsCount(count);
      } else {
        setMenuItemsCount(6);
      }

      setIsPreviewMode(false);
    } catch (err: any) {
      console.warn('Error fetching dashboard metrics, falling back to simulated data:', err.message || err);
      setOrders(MOCK_DASHBOARD_ORDERS);
      setMenuItemsCount(6);
      setIsPreviewMode(true);
      setError(null); // Clear error since we have a fully complete fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Calculate stats
  const isToday = (dateString: string) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const todayOrders = orders.filter(o => isToday(o.created_at));
  const totalOrdersTodayCount = todayOrders.length;

  const totalRevenueToday = todayOrders
    .filter(o => o.order_status?.toLowerCase() !== 'cancelled')
    .reduce((sum, o) => sum + (o.total_amount || 0), 0);

  const pendingOrdersCount = orders.filter(o => 
    !['delivered', 'cancelled'].includes(o.order_status?.toLowerCase() || '')
  ).length;

  const completedOrdersCount = orders.filter(o => 
    ['delivered'].includes(o.order_status?.toLowerCase() || '')
  ).length;

  const cancelledOrders = orders.filter(o => 
    ['cancelled'].includes(o.order_status?.toLowerCase() || '')
  ).length;

  // Map helper variables for existing template cards/activity components
  const totalOrders = orders.length;
  const activeOrders = pendingOrdersCount;
  const completedOrders = completedOrdersCount;

  // Recent 5 orders
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const getStatusBadgeClass = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'preparing':
      case 'cooking':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'dispatched':
      case 'on the way':
        return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'cancelled':
        return 'bg-rose-50 text-rose-700 border-rose-100';
      default:
        return 'bg-stone-50 text-stone-700 border-stone-100';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="space-y-8">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-black text-gray-950">Dashboard Overview</h1>
          <p className="text-sm text-stone-500 font-medium">Real-time performance metrics and insights for Ahli's Pizza.</p>
        </div>
        <button
          onClick={fetchDashboardData}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 hover:border-stone-300 font-bold text-xs tracking-wider uppercase rounded-xl transition-all shadow-xs cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Data
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <RefreshCw className="w-10 h-10 text-[#e63946] animate-spin" />
          <p className="text-sm font-semibold text-stone-500">Calculating kitchen metrics...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-50 border border-red-100 rounded-3xl text-red-600 text-sm font-semibold flex items-start gap-3">
          <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p>Error loading dashboard metrics</p>
            <p className="text-xs font-normal text-red-500">{error}</p>
          </div>
        </div>
      ) : (
        <>
          {/* Sandbox/Preview Mode Banner */}
          {isPreviewMode && (
            <div className="bg-amber-500 text-white text-xs font-semibold p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md border border-amber-400">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-amber-200 animate-pulse shrink-0" />
                <div>
                  <p className="font-extrabold uppercase tracking-wide">Demo Sandbox Preview Enabled</p>
                  <p className="text-[11px] font-normal text-amber-100 mt-0.5">
                    Live database metrics are currently unavailable. Enjoy looking around our beautifully designed admin interface with real-time local statistics!
                  </p>
                </div>
              </div>
              <button
                onClick={() => fetchDashboardData(true)}
                className="px-3 py-1.5 bg-white text-amber-700 hover:bg-amber-50 font-bold rounded-lg text-[10px] uppercase tracking-wider transition-colors cursor-pointer shrink-0"
              >
                Retry Live Database
              </button>
            </div>
          )}

          {/* Stats Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Orders Today */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-white p-6 rounded-3xl border border-stone-100 shadow-xs flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono font-bold text-stone-400 uppercase tracking-wider">Total Orders Today</span>
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                  <Calendar className="w-5 h-5" />
                </div>
              </div>
              <div>
                <h3 className="font-sans text-2xl font-black text-stone-900">{totalOrdersTodayCount}</h3>
                <div className="flex items-center gap-1.5 mt-2 text-blue-600 font-bold text-xs">
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>{totalOrders} overall order(s) logged</span>
                </div>
              </div>
            </motion.div>

            {/* Pending Orders */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white p-6 rounded-3xl border border-stone-100 shadow-xs flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono font-bold text-stone-400 uppercase tracking-wider">Pending Orders</span>
                <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
              <div>
                <h3 className="font-sans text-2xl font-black text-stone-900">{pendingOrdersCount}</h3>
                <div className="flex items-center gap-1.5 mt-2 text-amber-600 font-bold text-xs">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <span>In kitchen/delivery transit</span>
                </div>
              </div>
            </motion.div>

            {/* Completed Orders */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white p-6 rounded-3xl border border-stone-100 shadow-xs flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono font-bold text-stone-400 uppercase tracking-wider">Completed Orders</span>
                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                  <CheckCircle className="w-5 h-5" />
                </div>
              </div>
              <div>
                <h3 className="font-sans text-2xl font-black text-stone-900">{completedOrdersCount}</h3>
                <div className="flex items-center gap-1.5 mt-2 text-emerald-600 font-bold text-xs">
                  <span>Fulfillments delivered successfully</span>
                </div>
              </div>
            </motion.div>

            {/* Total Revenue Today */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white p-6 rounded-3xl border border-stone-100 shadow-xs flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono font-bold text-stone-400 uppercase tracking-wider">Total Revenue Today</span>
                <div className="p-2.5 bg-[#e63946]/5 text-[#e63946] rounded-xl">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
              <div>
                <h3 className="font-sans text-2xl font-black text-stone-900">₹{totalRevenueToday.toLocaleString('en-IN')}</h3>
                <div className="flex items-center gap-1.5 mt-2 text-[#e63946] font-bold text-xs font-sans">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Excludes today's cancelled</span>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Orders List */}
            <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-xs lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-lg font-bold text-gray-950">Recent Orders</h2>
                <button
                  onClick={() => onNavigate('/admin/orders')}
                  className="text-xs font-bold text-[#e63946] hover:text-[#d62839] flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  View All Orders <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-medium border-collapse">
                  <thead>
                    <tr className="border-b border-stone-100 text-stone-400 uppercase tracking-wider font-mono text-[10px]">
                      <th className="py-3 px-4">Order ID</th>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-50">
                    {recentOrders.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-stone-400">
                          No orders placed yet.
                        </td>
                      </tr>
                    ) : (
                      recentOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-stone-50/50 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-stone-500">
                            {getOrderDisplayId(order.id, order.order_number)}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-stone-900">{order.customer_name}</div>
                            <div className="text-[10px] text-stone-400 font-mono mt-0.5">{order.customer_phone}</div>
                          </td>
                          <td className="py-3.5 px-4 text-stone-500">
                            {formatDate(order.created_at)}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-stone-900">
                            ₹{order.total_amount}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <span className={`inline-block px-2 py-0.5 rounded-full border text-[10px] font-bold ${getStatusBadgeClass(order.order_status)}`}>
                              {order.order_status || 'received'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick Kitchen Panel / Activity */}
            <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-xs space-y-4 flex flex-col">
              <h2 className="font-serif text-lg font-bold text-gray-950">Kitchen Activities</h2>
              
              <div className="flex-1 flex flex-col justify-center items-center text-center p-6 space-y-3 bg-stone-50 rounded-2xl border border-dashed border-stone-200">
                <div className="p-3 bg-[#e63946]/10 text-[#e63946] rounded-full animate-bounce">
                  <Pizza className="w-8 h-8 stroke-[2]" />
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 text-sm">Active Baking Status</h3>
                  <p className="text-xs text-stone-500 max-w-[200px] mt-1 leading-relaxed">
                    We currently have <span className="font-bold text-[#e63946]">{activeOrders}</span> orders in the cooking queue.
                  </p>
                </div>
                <button
                  onClick={() => onNavigate('/admin/orders')}
                  className="mt-2 px-4 py-2 bg-[#1d3557] hover:bg-[#e63946] text-white font-bold text-[10px] uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-xs"
                >
                  Go to kitchen orders
                </button>
              </div>

              {/* Quick info metrics */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-100/40">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-700">Completion</div>
                  <div className="text-lg font-black text-emerald-900 mt-1">
                    {totalOrders > 0 ? Math.round((completedOrders/totalOrders)*100) : 0}%
                  </div>
                </div>
                <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-100/40">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-amber-700">Active queue</div>
                  <div className="text-lg font-black text-amber-900 mt-1">
                    {totalOrders > 0 ? Math.round((activeOrders/totalOrders)*100) : 0}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
