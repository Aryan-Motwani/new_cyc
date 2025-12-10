import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Check, X, Truck, Eye, Phone, MapPin } from "lucide-react";
import { supabase } from '../createClient';

const STATUS_CONFIG = {
  all: { label: "All", color: "bg-neutral-50 text-neutral-900 border-neutral-200" },
  pending: { label: "Pending", color: "bg-amber-50 text-amber-800 border-amber-200", icon: Clock },
  confirmed: { label: "Confirmed", color: "bg-blue-50 text-blue-800 border-blue-200", icon: Check },
  out_for_delivery: { label: "Out for Delivery", color: "bg-purple-50 text-purple-800 border-purple-200", icon: Truck },
  delivered: { label: "Delivered", color: "bg-emerald-50 text-emerald-800 border-emerald-200", icon: Check },
  cancelled: { label: "Cancelled", color: "bg-red-50 text-red-800 border-red-200", icon: X }
};

const STATUS_OPTIONS = ["all", "pending", "confirmed", "out_for_delivery", "delivered", "cancelled"];

export default function OrdersPage({ setPage }) {
  const [allOrders, setAllOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updating, setUpdating] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]); // Default to today

  useEffect(() => {
    const fetchAllOrders = async () => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        setAllOrders(data || []);
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };
    fetchAllOrders();

    const subscription = supabase
      .channel('orders-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchAllOrders)
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const todayString = new Date().toISOString().split('T')[0];

const filteredOrders = allOrders.filter(order => {
  const matchesStatus = filterStatus === 'all' || order.status === filterStatus;

  // Treat null delivery_date as today's date
  const orderDate = order.delivery_date || todayString;
  const matchesDate = !filterDate || orderDate === filterDate;

  const matchesSearch = !searchTerm.trim() || order.items.some(item => item.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return matchesStatus && matchesDate && matchesSearch;
});


  const updateOrderStatus = async (orderId, newStatus) => {
    setUpdating(orderId);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', orderId);
      if (error) throw error;
      setAllOrders(prev => prev.map(order => order.id === orderId ? { ...order, status: newStatus, updated_at: new Date().toISOString() } : order));
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status');
    } finally {
      setUpdating(null);
    }
  };

  const formatTime = timestamp => new Date(timestamp).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

  const getStatusActions = order => {
    const { status } = order;
    const actions = [];
    if (status === 'pending') {
      actions.push(
        { label: 'Confirm', status: 'confirmed', color: 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl' },
        { label: 'Cancel', status: 'cancelled', color: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-xl' }
      );
    } else if (status === 'confirmed') {
      actions.push(
        { label: 'Out for Delivery', status: 'out_for_delivery', color: 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-lg hover:shadow-xl' },
        { label: 'Cancel', status: 'cancelled', color: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-xl' }
      );
    } else if (status === 'out_for_delivery') {
      actions.push(
        { label: 'Mark Delivered', status: 'delivered', color: 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-lg hover:shadow-xl' }
      );
    }
    return actions;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-white/80 border-b border-slate-200/60 shadow-sm">
        <div className="max-w-screen-lg mx-auto px-6 py-4 flex items-center gap-4">
          <button onClick={() => setPage("menu")} className="h-11 w-11 rounded-2xl border border-slate-300 bg-white hover:bg-slate-50 grid place-items-center transition-all duration-200 shadow-sm hover:shadow-md active:scale-95" aria-label="Back to menu">
            <span className="text-lg font-bold text-slate-700">←</span>
          </button>
          <div className="flex-1 text-center">
            <h1 className="text-xl font-bold text-slate-900">Orders Dashboard</h1>
            <p className="text-sm text-slate-600">Manage all incoming orders</p>
          </div>
          <div className="flex gap-6">
            <div className="bg-white px-4 py-2 rounded-3xl border border-slate-200 shadow-sm text-center">
              <p className="text-lg font-bold text-slate-900">{allOrders.length}</p>
              <p className="text-xs text-slate-500">All Orders</p>
            </div>
            <div className="bg-amber-50 px-4 py-2 rounded-3xl border border-amber-200 text-center">
              <p className="text-lg font-bold text-amber-800">{allOrders.filter(o => o.status === 'pending').length}</p>
              <p className="text-xs text-amber-600">Pending</p>
            </div>
          </div>
        </div>
      </header>

      <div className="sticky top-[72px] z-20 bg-white border-b border-slate-200 shadow-sm">
        <nav className="max-w-screen-lg mx-auto px-6 py-2 flex items-center space-x-4 overflow-x-auto">
          {STATUS_OPTIONS.map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`flex-shrink-0 px-4 py-2 rounded-full font-medium text-sm transition ${
                filterStatus === status
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-white text-slate-700 hover:bg-blue-100"
              }`}
              aria-label={`Filter orders by ${STATUS_CONFIG[status].label}`}
            >
              {STATUS_CONFIG[status].label}
            </button>
          ))}
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="ml-auto border border-slate-300 rounded-md px-3 py-2 text-sm"
            aria-label="Filter orders by delivery date"
          />
          {/* <input
            type="text"
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-slate-300 rounded-md px-3 py-2 text-sm ml-4 flex-grow max-w-sm"
            aria-label="Search orders by item name"
          /> */}
        </nav>
      </div>

      <main className="max-w-screen-lg mx-auto px-6 py-8">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-20">
            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 grid place-items-center mx-auto mb-6 shadow-lg">
              <span className="text-4xl">📋</span>
            </div>
            <h3 className="font-bold text-2xl text-slate-900 mb-4">No orders found</h3>
            <p className="text-slate-600 max-w-md mx-auto">Try adjusting your search or filter to see orders.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            <AnimatePresence>
              {filteredOrders.map(order => {
                const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                const StatusIcon = statusConfig.icon;
                const actions = getStatusActions(order);

                return (
                  <motion.div
                    key={order.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-white rounded-3xl border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                  >
                    <div className="bg-gradient-to-r from-slate-50 to-blue-50 p-6 border-b border-slate-100">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-slate-900">Order #{order.id}</h3>
                            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border-2 ${statusConfig.color}`}>
                              <StatusIcon className="h-4 w-4" />
                              {statusConfig.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-600">
                            <Clock className="h-4 w-4" />
                            <span>{formatTime(order.created_at)}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-slate-900">₹{order.total_price}</p>
                          <p className="text-sm text-slate-600">{order.total_calories} kcal</p>
                        </div>
                      </div>
                    </div>

                    {(order.phone || order.delivery_address) && (
                      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                        <div className="grid gap-4 md:grid-cols-2">
                          {order.phone && (
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-xl bg-blue-100 grid place-items-center">
                                <Phone className="h-5 w-5 text-blue-600" />
                              </div>
                              <div>
                                <p className="text-xs font-medium text-slate-500 uppercase">Phone</p>
                                <p className="font-semibold">{order.phone}</p>
                              </div>
                            </div>
                          )}
                          {order.delivery_address && (
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-xl bg-emerald-100 grid place-items-center">
                                <MapPin className="h-5 w-5 text-emerald-600" />
                              </div>
                              <div>
                                <p className="text-xs font-medium text-slate-500 uppercase">Address</p>
                                <p className="font-semibold">{order.delivery_address}</p>
                                <p className="text-xs font-medium text-slate-500 uppercase">Delivery Date</p>
                                <p className="font-semibold">{order.delivery_date}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="px-6 py-5">
                      <button
                        onClick={() => setSelectedOrder(selectedOrder === order.id ? null : order.id)}
                        className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:underline"
                      >
                        <Eye className="mr-1" /> View Items ({order.items.length})
                      </button>

                      <AnimatePresence>
                        {selectedOrder === order.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-4 bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-5 border border-slate-200">
                              {order.items.map((item, idx) => (
                                <div key={idx} className="flex justify-between bg-white p-4 rounded-lg shadow mb-3">
                                  <div>
                                    <p className="font-semibold">{item.title}</p>
                                    <p className="text-sm text-slate-600">Quantity: {item.qty}</p>
                                  </div>
                                  {/* <div className="font-bold">₹{(item.price * item.qty).toFixed(2)}</div> */}
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {actions.length > 0 && (
                      <div className="px-6 pb-6">
                        <div className="flex gap-3 flex-wrap">
                          {actions.map((action, idx) => (
                            <button
                              key={idx}
                              onClick={() => updateOrderStatus(order.id, action.status)}
                              disabled={updating === order.id}
                              className={`px-6 py-2 rounded-full font-semibold text-white transition ${
                                action.color
                              } ${updating === order.id ? "opacity-50 cursor-not-allowed" : "hover:scale-95"}`}
                            >
                              {updating === order.id ? (
                                <span className="animate-spin inline-block w-4 h-4 border-4 border-white border-t-transparent rounded-full"></span>
                              ) : (
                                action.label
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
}
