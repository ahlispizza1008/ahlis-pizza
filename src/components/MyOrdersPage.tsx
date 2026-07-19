import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { getOrderDisplayId } from '../utils/orderUtils';
import { useAuth } from '../contexts/AuthContext';
import { 
  Pizza, 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  User, 
  ChevronRight, 
  ShoppingBag, 
  Loader, 
  AlertCircle, 
  CheckCircle, 
  Info,
  DollarSign,
  CreditCard
} from 'lucide-react';
import { motion } from 'motion/react';

interface MyOrdersPageProps {
  onNavigate: (path: string) => void;
}

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
  payment_status?: string;
  delivery_address: string;
  upi_id: string | null;
  user_id: string;
  created_at: string;
  items: OrderItem[];
  special_instructions?: string | null;
  order_number?: number | null;
}

const steps = [
  "received",
  "preparing",
  "ready",
  "out_for_delivery",
  "delivered"
];

const stepLabels: Record<string, string> = {
  received: "Received",
  preparing: "Preparing",
  ready: "Ready",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered"
};

export const MyOrdersPage: React.FC<MyOrdersPageProps> = ({ onNavigate }) => {
  const { user, session, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      // 6. If not logged in: Redirect to /login
      alert("Please login to view your orders.");
      onNavigate('/login');
      return;
    }

    const fetchOrders = async () => {
      setLoading(true);
      setError(null);

      try {
        setUserEmail(user.email || null);

        const isRealSession = session && !user.id.startsWith('mock-');
        const localIds = JSON.parse(localStorage.getItem('local_order_ids') || '[]');

        let ordersData: any[] = [];

        // If we have a real active session, retrieve their cloud-linked orders
        if (isRealSession) {
          const { data, error: ordersError } = await supabase
            .from('orders')
            .select('*')
            .eq('user_id', user.id);

          if (ordersError) throw ordersError;
          ordersData = data || [];
        }

        // If we have locally placed order IDs, retrieve and merge them
        if (localIds.length > 0) {
          const { data: localData, error: localError } = await supabase
            .from('orders')
            .select('*')
            .in('id', localIds);

          if (!localError && localData) {
            const existingIds = new Set(ordersData.map(o => o.id));
            localData.forEach(o => {
              if (!existingIds.has(o.id)) {
                ordersData.push(o);
              }
            });
          }
        }

        // Sort newest first
        ordersData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        if (ordersData.length === 0) {
          setOrders([]);
          setLoading(false);
          return;
        }

        const orderIds = ordersData.map(o => o.id);

        // 3. Fetch related order_items
        const { data: itemsData, error: itemsError } = await supabase
          .from('order_items')
          .select('*')
          .in('order_id', orderIds);

        if (itemsError) throw itemsError;

        // Fetch menu items to map item names and images
        const { data: menuItemsData, error: menuItemsError } = await supabase
          .from('menu_items')
          .select('*');

        const menuItemMap = new Map<string, { name: string; image_url?: string }>();
        if (menuItemsData && !menuItemsError) {
          menuItemsData.forEach(item => {
            menuItemMap.set(item.id, { name: item.name, image_url: item.image_url });
          });
        }

        // Map items to their corresponding orders
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
            items: relatedItems,
          };
        });

        setOrders(ordersWithItems);

      } catch (err: any) {
        console.warn('Error fetching user orders:', err.message || err);
        setError(err.message || 'Failed to retrieve your order history.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [onNavigate, authLoading, user, session]);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'received':
        return 'bg-stone-100 text-stone-700 border-stone-200';
      case 'preparing':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'ready':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'out_for_delivery':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'delivered':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'cancelled':
        return 'bg-rose-100 text-rose-700 border-rose-200';
      default:
        return 'bg-stone-100 text-stone-700 border-stone-200';
    }
  };

  const getStatusBadge = (status: string) => {
    let text = 'Received';
    const s = status?.toLowerCase();
    if (s === 'preparing') text = 'Preparing';
    else if (s === 'ready') text = 'Ready';
    else if (s === 'out_for_delivery') text = 'Out for Delivery';
    else if (s === 'delivered') text = 'Delivered';
    else if (s === 'cancelled') text = 'Cancelled';
    
    return (
      <span className={`px-4 py-1.5 rounded-full text-sm font-black tracking-wide border uppercase ${getStatusColor(status)} shadow-xs`}>
        {text}
      </span>
    );
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'completed':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'failed':
        return 'bg-rose-100 text-rose-700 border-rose-200';
      default:
        return 'bg-amber-100 text-amber-700 border-amber-200';
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    const text = status ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase() : 'Pending';
    return (
      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border uppercase tracking-wider ${getPaymentStatusColor(status)}`}>
        {text}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 text-left">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-3xl font-black text-[#1d3557] tracking-tight">
            My Pizza Orders
          </h1>
          <p className="text-stone-500 text-xs font-medium mt-1">
            {userEmail ? `Signed in as ${userEmail}` : 'Your authentic gourmet history'}
          </p>
        </div>
        <button
          onClick={() => onNavigate('/')}
          className="px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5 self-start md:self-auto shadow-xs"
        >
          <Pizza className="w-4 h-4 text-[#e63946]" />
          <span>Back to Menu</span>
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-stone-100 shadow-sm">
          <Loader className="w-8 h-8 text-[#e63946] animate-spin" />
          <p className="text-stone-500 text-xs font-bold uppercase tracking-wider mt-4">
            Loading your order records...
          </p>
        </div>
      ) : error ? (
        <div className="p-6 bg-rose-50 border border-rose-100 rounded-3xl text-rose-700 text-center flex flex-col items-center gap-3">
          <AlertCircle className="w-8 h-8 text-[#e63946]" />
          <div>
            <h3 className="font-bold text-sm">Failed to Load Orders</h3>
            <p className="text-xs mt-1">{error}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-white border border-rose-200 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            Retry Fetching
          </button>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 px-6 bg-white rounded-3xl border border-stone-100 shadow-sm flex flex-col items-center max-w-md mx-auto">
          <div className="p-4 bg-stone-50 text-stone-400 rounded-full mb-4">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h3 className="font-serif text-xl font-bold text-[#1d3557]">No orders placed yet</h3>
          <p className="text-stone-500 text-xs font-medium mt-2 mb-6">
            You haven't ordered any of our sourdough gourmet pizzas yet. Start customizing your selection now!
          </p>
          <button
            onClick={() => onNavigate('/')}
            className="px-6 py-3 bg-[#e63946] hover:bg-[#d62839] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md hover:shadow-red-500/10 cursor-pointer"
          >
            Explore Menu Now
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {orders.map((order, index) => {
            const currentStatus = order.order_status?.toLowerCase() || '';
            const currentStepIndex = steps.indexOf(currentStatus);

            return (
              <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden hover:shadow-md transition-all duration-300"
            >
              {/* Order Header Card */}
              <div className="bg-stone-50/70 border-b border-stone-100 px-6 py-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <span className="text-stone-900 font-extrabold text-base tracking-tight font-sans">
                        Order ID: <span className="font-mono text-red-600 font-black">{getOrderDisplayId(order.id, order.order_number)}</span>
                      </span>
                      <div className="flex flex-wrap gap-1.5 mt-1 sm:mt-0">
                        {getStatusBadge(order.order_status)}
                        {getPaymentStatusBadge(order.payment_status || 'pending')}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-stone-500 text-xs font-medium">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-stone-400" />
                        <span>Ordered on <strong>{formatDate(order.created_at)}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CreditCard className="w-4 h-4 text-stone-400" />
                        <span className="uppercase">{order.payment_method === 'upi' ? 'UPI' : 'Cash (COD)'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:flex-col md:justify-center md:items-end gap-1 px-4 py-2 bg-[#e63946]/5 rounded-2xl border border-[#e63946]/10 shrink-0">
                    <span className="text-[10px] font-bold font-mono text-[#e63946] uppercase tracking-widest md:block hidden">Total Amount</span>
                    <span className="text-xl font-black text-[#e63946] font-sans">
                      ₹{order.total_amount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Content */}
              <div className="p-6">
                {/* Order Tracking Timeline */}
                <div className="mb-8 pb-6 border-b border-stone-100">
                  <h5 className="text-[10px] font-mono font-bold uppercase text-stone-400 tracking-wider mb-4">
                    Order Tracking Status
                  </h5>
                  
                  {currentStatus === 'cancelled' ? (
                    <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-rose-50 border border-rose-100/60 text-rose-700 font-bold text-xs">
                      <AlertCircle className="w-4 h-4 text-[#e63946]" />
                      <span>This order has been Cancelled</span>
                    </div>
                  ) : (
                    <>
                      {/* Desktop Progress Bar (Horizontal) */}
                      <div className="relative w-full hidden md:block px-4 py-2 my-2">
                        {/* The track container */}
                        <div className="absolute top-6 left-8 right-8 h-[3px] bg-stone-100 -translate-y-1/2 z-0 rounded-full">
                          {/* Active colored line */}
                          <div 
                            className="h-full bg-emerald-500 transition-all duration-500 rounded-full"
                            style={{ 
                              width: `${currentStepIndex <= 0 ? 0 : (currentStepIndex / (steps.length - 1)) * 100}%` 
                            }}
                          />
                        </div>

                        {/* Steps container */}
                        <div className="relative z-10 flex justify-between">
                          {steps.map((step, idx) => {
                            const isCompleted = idx < currentStepIndex;
                            const isCurrent = idx === currentStepIndex;
                            
                            let circleStyle = "bg-stone-50 border-stone-200 text-stone-400";
                            if (isCompleted) circleStyle = "bg-emerald-500 border-emerald-500 text-white shadow-xs";
                            else if (isCurrent) circleStyle = "bg-white border-blue-500 text-blue-600 ring-4 ring-blue-100";

                            return (
                              <div key={step} className="flex flex-col items-center select-none w-24 text-center">
                                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-xs transition-all duration-300 ${circleStyle}`}>
                                  {isCompleted ? (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                  ) : (
                                    idx + 1
                                  )}
                                </div>
                                <span className={`text-[10px] font-bold tracking-tight mt-2 uppercase transition-all duration-300 block leading-tight ${isCurrent ? 'text-blue-600' : isCompleted ? 'text-emerald-600' : 'text-stone-400'}`}>
                                  {stepLabels[step]}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Mobile Progress Bar (Vertical) */}
                      <div className="flex flex-col gap-2 md:hidden pl-2">
                        {steps.map((step, idx) => {
                          const isCompleted = idx < currentStepIndex;
                          const isCurrent = idx === currentStepIndex;

                          let circleStyle = "bg-stone-50 border-stone-200 text-stone-400";
                          if (isCompleted) circleStyle = "bg-emerald-500 border-emerald-500 text-white shadow-xs";
                          else if (isCurrent) circleStyle = "bg-white border-blue-500 text-blue-600 ring-4 ring-blue-100";

                          return (
                            <div key={step} className="relative flex items-start gap-4 select-none">
                              {/* Circle & line block */}
                              <div className="flex flex-col items-center shrink-0">
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center font-bold text-[10px] transition-all duration-300 ${circleStyle}`}>
                                  {isCompleted ? (
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                  ) : (
                                    idx + 1
                                  )}
                                </div>
                                {/* Connecting line to next step */}
                                {idx < steps.length - 1 && (
                                  <div className={`w-[2px] h-6 my-1 transition-colors duration-300 ${idx < currentStepIndex ? 'bg-emerald-500' : 'bg-stone-200'}`} />
                                )}
                              </div>
                              
                              {/* Label and description */}
                              <div className="pt-0.5 flex flex-col">
                                <span className={`text-[10px] font-bold tracking-wide uppercase transition-all duration-300 ${isCurrent ? 'text-blue-600 font-black' : isCompleted ? 'text-emerald-600' : 'text-stone-400'}`}>
                                  {stepLabels[step]}
                                </span>
                                {isCurrent && (
                                  <span className="text-[9px] text-blue-500 font-semibold animate-pulse mt-0.5">
                                    Active Stage
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>

                {/* Items List */}
                <div className="divide-y divide-stone-100">
                  {order.items.map((item) => (
                    <div key={item.id} className="py-3.5 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                      <div className="flex items-center gap-3">
                        {item.itemImage ? (
                          <img 
                            src={item.itemImage} 
                            alt={item.itemName} 
                            className="w-12 h-12 rounded-xl object-cover bg-stone-100 border border-stone-100 flex-shrink-0"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-stone-50 border border-stone-200/60 flex items-center justify-center text-stone-400 flex-shrink-0">
                            <Pizza className="w-5 h-5" />
                          </div>
                        )}
                        <div>
                          <h4 className="text-sm font-bold text-[#1d3557]">{item.itemName}</h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="px-1.5 py-0.5 bg-stone-100 rounded-md text-[10px] font-bold text-stone-600">
                              {item.size_name}
                            </span>
                            <span className="text-[11px] text-stone-400 font-bold">
                              Qty: {item.quantity}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-black text-stone-800">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </span>
                        <div className="text-[10px] text-stone-400 font-medium mt-0.5">
                          ₹{item.price.toFixed(2)} each
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Delivery and Payment Details Grid */}
                <div className="mt-6 pt-5 border-t border-stone-100 grid grid-cols-1 md:grid-cols-2 gap-5 text-xs text-stone-600">
                  {/* Delivery details */}
                  <div className="bg-stone-50/50 p-4 rounded-2xl border border-stone-100/70 flex flex-col gap-2.5">
                    <h5 className="font-bold text-stone-800 flex items-center gap-1.5 pb-1 border-b border-stone-100">
                      <MapPin className="w-3.5 h-3.5 text-[#e63946]" />
                      <span>Delivery Details</span>
                    </h5>
                    <div className="flex items-start gap-2">
                      <User className="w-3.5 h-3.5 text-stone-400 mt-0.5 flex-shrink-0" />
                      <span className="font-semibold text-stone-700">{order.customer_name}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Phone className="w-3.5 h-3.5 text-stone-400 mt-0.5 flex-shrink-0" />
                      <span>{order.customer_phone}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-stone-400 mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-2">{order.delivery_address}</span>
                    </div>
                    {order.special_instructions && (
                      <div className="mt-1.5 pt-1.5 border-t border-stone-100 flex flex-col gap-1 text-[11px]">
                        <span className="font-bold text-[10px] text-[#e63946] uppercase tracking-wider">Special Instructions:</span>
                        <p className="italic text-stone-700 bg-red-50/20 px-2.5 py-1.5 rounded-xl border border-red-100/30">
                          "{order.special_instructions}"
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Payment & Total info */}
                  <div className="bg-stone-50/50 p-4 rounded-2xl border border-stone-100/70 flex flex-col justify-between gap-3">
                    <div className="flex flex-col gap-2">
                      <h5 className="font-bold text-stone-800 flex items-center gap-1.5 pb-1 border-b border-stone-100">
                        <DollarSign className="w-3.5 h-3.5 text-amber-500" />
                        <span>Payment Info</span>
                      </h5>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-stone-500">Method:</span>
                        <span className="font-bold uppercase text-stone-700">
                          {order.payment_method === 'upi' ? 'UPI Online' : 'Cash on Delivery (COD)'}
                        </span>
                      </div>
                      {order.upi_id && (
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-stone-500">UPI Transaction ID:</span>
                          <span className="font-mono text-stone-700 font-semibold">{order.upi_id}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-dashed border-stone-200">
                      <span className="text-sm font-bold text-stone-700">Total Paid:</span>
                      <span className="text-lg font-black text-[#e63946]">
                        ₹{order.total_amount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
        </div>
      )}
    </div>
  );
};
