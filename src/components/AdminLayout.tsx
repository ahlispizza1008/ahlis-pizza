import React, { useState, useEffect } from 'react';
import { 
  Pizza, 
  LayoutDashboard, 
  ShoppingBag, 
  LogOut, 
  Menu, 
  X, 
  ChevronRight, 
  Globe, 
  User,
  ShieldCheck,
  ChefHat,
  Bell
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../supabaseClient';

interface AdminLayoutProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ currentPath, onNavigate, children }) => {
  const { user, signOut } = useAuth();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; customerName?: string; totalAmount?: number }>>([]);

  const playNotification = () => {
    const audio = new Audio("https://jcyxbpoergyslwcwjluv.supabase.co/storage/v1/object/public/assets/notification.mp3");
    audio.play().catch(() => {});
  };

  const showToast = (message: string, customerName?: string, totalAmount?: number) => {
    const id = Math.random().toString();
    setToasts(prev => [...prev, { id, message, customerName, totalAmount }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 6000);
  };

  useEffect(() => {
    const ordersChannel = supabase
      .channel('orders-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders'
        },
        (payload) => {
          const customerName = payload.new?.customer_name || 'Guest Customer';
          const totalAmount = payload.new?.total_amount || 0;
          playNotification();
          showToast("New Order Received!", customerName, totalAmount);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
      onNavigate('/');
    } catch (e) {
      console.error("Logout failed:", e);
    }
  };

  const navItems = [
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: '/admin',
      active: currentPath === '/admin'
    },
    {
      label: 'Kitchen Orders',
      icon: ShoppingBag,
      path: '/admin/orders',
      active: currentPath === '/admin/orders'
    },
    {
      label: 'Menu Management',
      icon: ChefHat,
      path: '/admin/menu',
      active: currentPath === '/admin/menu'
    }
  ];

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between bg-[#1d3557] text-white p-5 border-r border-blue-950/20">
      {/* Brand logo header */}
      <div className="space-y-8">
        <div 
          onClick={() => {
            onNavigate('/');
            setIsMobileSidebarOpen(false);
          }}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="p-2 bg-[#e63946] text-white rounded-xl shadow-md shadow-red-500/20 group-hover:rotate-12 transition-transform duration-300">
            <Pizza className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div className="text-left">
            <h1 className="font-sans text-base font-black tracking-tight leading-none text-white">
              Ahli's <span className="text-[#e63946]">Pizza</span>
            </h1>
            <span className="text-[9px] font-mono tracking-widest text-amber-200 uppercase font-black">
              Admin HQ
            </span>
          </div>
        </div>

        {/* Navigation Items list */}
        <div className="space-y-1.5 pt-4">
          <div className="text-[10px] font-mono font-bold tracking-wider text-stone-400 uppercase pb-2">
            Operations
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => {
                  onNavigate(item.path);
                  setIsMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                  item.active
                    ? 'bg-[#e63946] text-white shadow-md shadow-red-500/15'
                    : 'text-stone-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
                <ChevronRight className={`w-3.5 h-3.5 opacity-60 transition-transform ${item.active ? 'translate-x-0.5' : ''}`} />
              </button>
            );
          })}
        </div>

        {/* Global links */}
        <div className="space-y-1.5 border-t border-white/5 pt-5">
          <div className="text-[10px] font-mono font-bold tracking-wider text-stone-400 uppercase pb-2">
            Quick Links
          </div>
          <button
            onClick={() => {
              onNavigate('/');
              setIsMobileSidebarOpen(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-stone-300 hover:text-white hover:bg-white/5 cursor-pointer"
          >
            <Globe className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Customer Shop</span>
          </button>
        </div>
      </div>

      {/* Admin metadata & log-out controller */}
      <div className="space-y-4 border-t border-white/5 pt-4">
        <div className="flex items-center gap-2.5 px-2">
          <div className="p-2 bg-white/10 rounded-xl text-amber-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="overflow-hidden">
            <div className="font-bold text-[10px] uppercase tracking-wider text-stone-300">Logged in as</div>
            <div className="text-stone-400 text-[10px] font-mono truncate max-w-[150px]" title={user?.email || ''}>
              {user?.email || 'Admin User'}
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#e63946]/10 hover:bg-[#e63946] text-[#e63946] hover:text-white font-bold text-xs tracking-wider uppercase rounded-xl transition-all cursor-pointer border border-[#e63946]/20"
        >
          <LogOut className="w-4 h-4" />
          <span>Exit Admin HQ</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-stone-900 font-sans flex relative overflow-x-hidden">
      
      {/* Permanent sidebar for Desktop size */}
      <aside className="hidden lg:block w-64 h-screen sticky top-0 shrink-0">
        {sidebarContent}
      </aside>

      {/* Slide-out sidebar for Mobile size with dimming overlay */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <>
            {/* Background Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileSidebarOpen(false)}
              className="fixed inset-0 bg-black z-40 lg:hidden"
            />

            {/* Sidebar drawer panel */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed top-0 bottom-0 left-0 w-64 z-50 lg:hidden"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        
        {/* Mobile Header Bar */}
        <header className="lg:hidden h-16 shrink-0 bg-white border-b border-stone-100 flex items-center justify-between px-4 sticky top-0 z-30">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="p-2 hover:bg-stone-50 rounded-xl text-stone-700 active:scale-95 transition-all border border-stone-100 cursor-pointer"
              aria-label="Open Sidebar Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="p-1 bg-[#e63946] text-white rounded-lg">
                <Pizza className="w-3.5 h-3.5" />
              </div>
              <span className="font-serif text-sm font-black text-[#1d3557]">Admin Panel</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[9px] font-mono bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-100 font-bold uppercase">
              Secure HQ
            </span>
          </div>
        </header>

        {/* Content body wrapper */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Real-time Toast Notifications (Top-Right) */}
      <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.95, x: 20 }}
              animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
              exit={{ opacity: 0, y: -10, scale: 0.95, x: 10 }}
              className="pointer-events-auto bg-stone-900 border border-stone-800 text-white rounded-2xl shadow-2xl p-4 flex gap-3.5 items-start font-sans"
            >
              <div className="p-2 bg-red-500 rounded-xl text-white shrink-0">
                <Bell className="w-4 h-4 animate-bounce" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono tracking-wider font-extrabold text-red-400 uppercase">Alert</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                </div>
                <h4 className="font-extrabold text-sm text-stone-100 truncate mt-0.5">
                  {toast.message}
                </h4>
                {toast.customerName && (
                  <p className="text-xs text-stone-400 mt-1">
                    Customer: <span className="font-semibold text-white">{toast.customerName}</span>
                  </p>
                )}
                {toast.totalAmount !== undefined && (
                  <p className="text-xs text-stone-400 mt-0.5">
                    Amount: <span className="font-semibold text-white">₹{Math.round(toast.totalAmount)}</span>
                  </p>
                )}
              </div>
              <button
                onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                className="p-1 hover:bg-stone-800 text-stone-400 hover:text-white rounded-lg transition-colors cursor-pointer shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
