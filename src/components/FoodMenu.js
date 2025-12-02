import React, { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {  ShoppingCart, Plus, Minus, X, ChevronDown, Search, CheckCircle, User, LogOut, History, Bell, RefreshCw,
  // Add all these different icons:
  UtensilsCrossed, Pizza, Soup, Sandwich, Cake, Coffee, Salad, Hamburger,
  Martini
   } from "lucide-react";
import { supabase } from "../createClient";
import { data } from "autoprefixer";
import SubscriptionCalendar from "./SubscriptionCalendar";

import { auth, googleProvider } from './firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import AddressForm from './AddressForm';


// Demo users for manual auth
const DEMO_USERS = [
  { id: "user1", email: "john", phone: "+919876543210", password: "password123", name: "John Doe" },
  { id: "user2", email: "jane", phone: "+919876543211", password: "password123", name: "Jane Smith" },
  { id: "demo", email: "demo", phone: "+919999999999", password: "demo", name: "Demo User" },
  { id: "aryan", email: "aryan", phone: "9372329966", password: "pass", name: "Aryan Motwani" }
];

const STATUS_CONFIG = {
  pending: { label: "Pending", color: "bg-amber-100 text-amber-800", icon: "⏳" },
  confirmed: { label: "Confirmed", color: "bg-blue-100 text-blue-800", icon: "✅" },
  out_for_delivery: { label: "Out for Delivery", color: "bg-purple-100 text-purple-800", icon: "🚚" },
  delivered: { label: "Delivered", color: "bg-green-100 text-green-800", icon: "📦" },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-800", icon: "❌" }
};

export default function FoodMenu({ setPage }) {
  const [password, setPassword] = useState('');



  // Core app state
  const [menuItems, setMenuItems] = useState([]);
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [menuError, setMenuError] = useState(null);

  const [user, setUser] = useState(null);
const [loading, setLoading] = useState(true);
const [loginData, setLoginData] = useState({ email: "", password: "" });
const [isSignUp, setIsSignUp] = useState(false);


  const [showLogin, setShowLogin] = useState(false);
  // const [loginData, setLoginData] = useState({ identifier: "", password: "" });
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [step, setStep] = useState("menu");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState({});
  const [showCart, setShowCart] = useState(false);
  const [descOpen, setDescOpen] = useState({});
  const [cartView, setCartView] = useState("items");
  const [deliveryAddress, setDeliveryAddress] = useState("Home - 123 Street, City");
  const [couponCode, setCouponCode] = useState("");
  const [deliveryType, setDeliveryType] = useState("pickup");
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [isConfirming, setIsConfirming] = useState(false);
  const [lastOrderId, setLastOrderId] = useState(null);
  const [showOrderHistory, setShowOrderHistory] = useState(false);
  const [userOrders, setUserOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [notifications, setNotifications] = useState([]);


// ADD THESE NEW STATES after your existing states:
const [subscriptionCart, setSubscriptionCart] = useState({});
const [showSubscriptionSetup, setShowSubscriptionSetup] = useState(false);
const [subscriptionDuration, setSubscriptionDuration] = useState(7);
const [subscriptionTimeSlot, setSubscriptionTimeSlot] = useState('13:00');

// Add state for address management
const [selectedAddress, setSelectedAddress] = useState(null);
const [showAddressForm, setShowAddressForm] = useState(false);



  const [currentBanner, setCurrentBanner] = useState(0);


  // SUBSCRIPTIONS feature states
  const [subscriptionTab, setSubscriptionTab] = useState(false); // false=Menu, true=Subscriptions
  const [activeSub, setActiveSub] = useState(null);
  const [subscriptionForm, setSubscriptionForm] = useState({
    foodId: "",
    days: 7,
    slot: "13:00"
  });

  // payment
  
  // ADD THESE NEW FUNCTIONS after addNotification:

// Subscription cart list
const subscriptionCartList = useMemo(() => {
  return menuItems.filter(item => subscriptionCart[item.id]);
}, [subscriptionCart, menuItems]);

// Subscription totals
const subscriptionTotals = useMemo(() => {
  let price = 0, calories = 0, protein = 0, carbs = 0, fats = 0;
  
  subscriptionCartList.forEach(item => {
    const qty = subscriptionCart[item.id];
    price += item.price * qty;
    calories += item.calories * qty;
    protein += item.protein * qty;
    carbs += item.carbs * qty;
    fats += item.fats * qty;
  });
  
  return {
    price: Math.round(price),
    calories: Math.round(calories),
    protein: Math.round(protein),
    carbs: Math.round(carbs),
    fats: Math.round(fats)
  };
}, [subscriptionCart, subscriptionCartList]);

// Increment subscription item
const incrementSubscription = (id) => {
  setSubscriptionCart(prev => ({
    ...prev,
    [id]: (prev[id] || 0) + 1
  }));
};

// Decrement subscription item
const decrementSubscription = (id) => {
  setSubscriptionCart(prev => {
    const newQty = (prev[id] || 0) - 1;
    if (newQty <= 0) {
      const { [id]: removed, ...rest } = prev;
      return rest;
    }
    return { ...prev, [id]: newQty };
  });
};

// Add this helper function to your codebase
const placeSubscriptionOrders = async (subscriptionId, subscriptionData) => {
  for (let i = 0; i < subscriptionData.days; i++) {
    const deliveryDate = new Date(subscriptionData.start_date);
    deliveryDate.setDate(deliveryDate.getDate() + i);

  //   const totalPrice = subItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  // const totalCalories = subItems.reduce((sum, item) => sum + item.calories * item.qty, 0);

    const totalPrice = 0;
  const totalCalories = 0;

    const orderPayload = {
      user_id: subscriptionData.user_id,
      subscription_id: subscriptionId,
      items: subscriptionData.food_items,
      delivery_date: deliveryDate.toISOString().split('T')[0],
      status: 'pending',
      // add other necessary fields like address, phone, etc. if needed

        // user_id: subscriptionData.user_id,
    // subscription_id: subscriptionId, // <---- Link order to subscription
    // items: subItems,
    // status: 'pending',
    total_price: totalPrice,
    total_calories: totalCalories,
    delivery_address: "Subscription Delivery",
    phone: phone, // ensure accessible here or pass as argument
    created_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('orders').insert([orderPayload]);
    if (error) {
      console.error('Error placing order for day', i + 1, error);
      throw error;
    }
  }
};

// Start subscription function
const startSubscription = async () => {
  if (!user) {
    addNotification("Error", "Please login first", 'error');
    return;
  }

  if (subscriptionCartList.length === 0) {
    addNotification("Error", "Please add meals to your subscription", 'error');
    return;
  }

  try {
    // Prepare subscription data in your existing format
    const subscriptionData = {
      user_id: user.id,
      food_items: subscriptionCartList.map(item => ({
        itemid: item.id,
        quantity: subscriptionCart[item.id]
      })),
      
      days: subscriptionDuration,
      slot: subscriptionTimeSlot,
      start_date: new Date().toISOString().split('T')[0],
      // end date should be start date + days
      end_date : new Date(new Date().setDate(new Date().getDate() + subscriptionDuration)).toISOString().split('T')[0],

      status: 'active',
      active : true
    };

    const { data, error } = await supabase
  .from('subscriptions')
  .insert([subscriptionData])
  .select();

if (error) throw error;
if (!data || data.length === 0) throw new Error('Subscription insert failed');

const insertedSubscription = data[0];

await placeSubscriptionOrders(insertedSubscription.id, insertedSubscription);


    addNotification("Success", `Your ${subscriptionDuration}-day meal subscription has been started!`);
    
    // Clear cart and close modal
    setSubscriptionCart({});
    setShowSubscriptionSetup(false);
    
    // Refresh subscriptions to show the new one
    fetchUserSubscriptions();

  } catch (error) {
    console.error('Error starting subscription:', error);
    addNotification("Error", "Failed to start subscription. Please try again.", 'error');
  }
};

// Add this if it doesn't exist
const fetchUserSubscriptions = async () => {
  if (!user) return;
  
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching subscriptions:', error);
      return;
    }

    setActiveSub(data);
  } catch (error) {
    console.error('Error:', error);
  }
};


  // Auth state listener
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
    if (firebaseUser) {
      // Convert Firebase user to your app's user format
      const userData = {
        id: firebaseUser.uid,
        email: firebaseUser.email,
        name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
        phone: firebaseUser.phoneNumber || null
      };
      setUser(userData);
      setName(userData.name);
    } else {
      setUser(null);
    }
    setLoading(false);
  });
  
  return () => unsubscribe();
}, []);

// Auto carousel for banners
useEffect(() => {
  const banners = [
    "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=200&fit=crop", // Pizza
    "https://images.unsplash.com/photo-1563379091339-03246963d203?w=800&h=200&fit=crop", // Biryani
    "https://images.unsplash.com/photo-1551782450-17144efb9c50?w=800&h=200&fit=crop", // Burger
  ];
  
  const interval = setInterval(() => {
    setCurrentBanner(prev => (prev + 1) % banners.length);
  }, 3000); // Change every 3 seconds
  
  return () => clearInterval(interval);
}, []);


// Email/Password Login
const handleEmailLogin = async (e) => {
  e.preventDefault();
  setIsLoggingIn(true);
  
  try {
    if (isSignUp) {
      await createUserWithEmailAndPassword(auth, loginData.email, loginData.password);
      addNotification("Account Created", "Welcome to our food delivery app!");
    } else {
      await signInWithEmailAndPassword(auth, loginData.email, loginData.password);
      addNotification("Welcome Back", "Successfully logged in!");
    }
    setShowLogin(false);
  } catch (error) {
    console.error("Auth error:", error);
    addNotification("Error", error.message, 'error');
  } finally {
    setIsLoggingIn(false);
  }
};

// Google Sign-in
const handleGoogleLogin = async () => {
  setIsLoggingIn(true);
  
  try {
    const result = await signInWithPopup(auth, googleProvider);
    addNotification("Welcome!", `Hello ${result.user.displayName}!`);
    setShowLogin(false);
  } catch (error) {
    console.error("Google auth error:", error);
    addNotification("Error", "Google sign-in failed", 'error');
  } finally {
    setIsLoggingIn(false);
  }
};

// Logout
const handleLogout = async () => {
  try {
    await signOut(auth);
    setUser(null);
    setName("");
    setPhone("");
    setActiveSub(null);
    addNotification("Logged Out", "See you soon!");
  } catch (error) {
    console.error("Logout error:", error);
  }
};


  // Menu categories
  const CATEGORIES = useMemo(() => {
    if (menuItems.length === 0) return ["All"];
    return ["All", ...Array.from(new Set(menuItems.map((m) => m.category)))];
  }, [menuItems]);

  // Fetch menu
  const fetchMenuItems = async () => {
    try {
      setLoadingMenu(true);
      setMenuError(null);
      const { data, error } = await supabase.from('Food').select('*');
      if (error) throw error;
      setMenuItems(data || []);
    } catch (error) {
      setMenuError("Failed to load menu items");
    } finally {
      setLoadingMenu(false);
    }
  };

  

  // Check user session
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      setName(userData.name);
      setPhone(userData.phone);
    }
  }, []);

  // Real-time order notification subscription
  useEffect(() => {
    if (!user) return;
    const subscription = supabase
      .channel('user-orders-channel')
      .on('postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const { new: newOrder, old: oldOrder } = payload;
          if (newOrder.status !== oldOrder.status) {
            const statusConfig = STATUS_CONFIG[newOrder.status] || STATUS_CONFIG.pending;
            addNotification(
              `🎉 Order Update!`,
              `Order #${newOrder.id} is now ${statusConfig.label} ${statusConfig.icon}`,
              'order_update'
            );
            if (showOrderHistory) fetchUserOrders();
          }
        }
      ).subscribe();
    return () => { subscription.unsubscribe(); };
  }, [user, showOrderHistory]);

  // Viewport/fetch menu on mount
  useEffect(() => {
    // <p>Your meal: <b>{menuItems.find(i => i.id === activeSub.food_id)?.title || "..."}</b></p>
    console.log(activeSub);
    
    fetchMenuItems();
    const meta = document.querySelector('meta[name="viewport"]');
    if (meta) {
      meta.setAttribute("content", "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover");
    } else {
      const m = document.createElement("meta");
      m.name = "viewport";
      m.content = "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover";
      document.head.appendChild(m);
    }
    document.body.style.touchAction = "manipulation";
  }, []);

  // ============ SUBSCRIPTIONS: Fetch & Automation Logic =============
  useEffect(() => {
    if (!user) return setActiveSub(null); // cleanup when logout
    const fetchSub = async () => {
      const { data } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('active', true)
        .maybeSingle();
      setActiveSub(data || null);
    };
    fetchSub();
    
  }, [user]);

  useEffect(() => {
    if (!activeSub || !user) return;
    
    // <p>Your meal: <b>{menuItems.find(i => i.id === activeSub.food_id)?.title || "..."}</b></p>
    
    const timer = setInterval(() => checkAndTriggerSubscriptionOrder(), 2 * 60 * 1000); // every 2 min
    checkAndTriggerSubscriptionOrder(); // call once immediately
    return () => clearInterval(timer);
    // eslint-disable-next-line
  }, [activeSub, menuItems, user]);

  const checkAndTriggerSubscriptionOrder = async () => {
  if (!activeSub || !user) return;
  
  const today = new Date().toISOString().split('T')[0];
  const now = new Date();
  const [slotTimeArr] = activeSub.slot.split(':');
    const slotDate = new Date();
    slotDate.setHours(Number(slotTimeArr[0]), Number(slotTimeArr[1]), 0, 0);
    if (
      now.toDateString() >= new Date(activeSub.start_date).toDateString() &&
      now.toDateString() <= new Date(activeSub.end_date).toDateString() &&
      now.getHours() >= Number(slotTimeArr[0]) &&
      now.getMinutes() >= Number(slotTimeArr[1])
    ) {
      const { data: skipData } = await supabase
      .from('subscription_skips')
      .select('id')
      .eq('subscription_id', activeSub.id)
      .eq('skip_date', today);
    
    if (skipData && skipData.length > 0) {
      console.log('Meal skipped for today');
      return;
    }
    
    // Check existing orders
    const { data: existingOrders } = await supabase
      .from('orders')
      .select('id')
      .eq('user_id', user.id)
      .gte('created_at', `${today}T00:00:00`)
      .lte('created_at', `${today}T23:59:59`)
      .contains('items', [{ itemid: activeSub.foodid }]);
    
    if (!existingOrders || existingOrders.length === 0) {
      await placeSubscriptionOrder();
    }
  }
};

  const handleSubscribe = async (e) => {
  e.preventDefault();
  if (!user) return alert("Please login first.");
  if (!subscriptionForm.foodIds || subscriptionForm.foodIds.length === 0) return alert("Select some food.");

  const start = new Date();
  const end = new Date(start.getTime() + (subscriptionForm.days - 1) * 24 * 60 * 60 * 1000);
  const food_Items = subscriptionForm.foodIds.map(id => ({ item_id: id, qty: 1 }));

  const payload = {
    user_id: user.id,
    food_items: food_Items,
    days: subscriptionForm.days,
    slot: subscriptionForm.slot,
    start_date: start.toISOString().split('T')[0],
    end_date: end.toISOString().split('T')[0],
    status: `coming at ${subscriptionForm.slot}`,
    active: true,
    last_order_date: null
  };

  console.log("Inserting subscription:", payload);

  const { data, error } = await supabase
    .from('subscriptions')
    .insert([payload])
    .select();

  if (error) {
    console.error(error);
    alert("Failed to start subscription");
    return;
  }

  if (data && data.length > 0) {
    setActiveSub(data[0]);
  } else {
    alert("Subscription started but no data received from DB");
    return;
  }

  await placeSubscriptionOrder(data[0].id, data[0]);
  addNotification("Subscribed!", "Your subscription has started.");
};




// Place an order for all items in the subscription
const placeSubscriptionOrder = async (subscriptionId, subscriptionData) => {
  const subItems = subscriptionData.food_items.map(f => {
    const foodItem = menuItems.find(m => String(m.id) === String(f.item_id));
    return {
      item_id: foodItem.id,
      title: foodItem.title,
      qty: f.qty,
      price: foodItem.price,
      calories: foodItem.calories,
      protein: foodItem.protein,
      carbs: foodItem.carbs,
      fats: foodItem.fats
    };
  });

  const totalPrice = subItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  const totalCalories = subItems.reduce((sum, item) => sum + item.calories * item.qty, 0);

  const orderPayload = {
    user_id: subscriptionData.user_id,
    subscription_id: subscriptionId, // <---- Link order to subscription
    status: 'pending',
    items: subItems,
    total_price: totalPrice,
    total_calories: totalCalories,
    delivery_address: "Subscription Delivery",
    phone: phone, // ensure accessible here or pass as argument
    created_at: new Date().toISOString(),
  };

  const { data, error } = await supabase.from('orders').insert([orderPayload]);

  if (error) {
    console.error("Error placing subscription order:", error);
  } else {
    addNotification("Order placed", "Your subscription order has been placed successfully.");
  }
};


const cancelSubscriptionAndOrders = async (subscriptionId, user_id) => {
  const { error: subError } = await supabase
    .from('subscriptions')
    .update({ status: 'cancelled', active: false })
    .eq('id', subscriptionId);

  if (subError) {
    console.error("Error cancelling subscription:", subError);
    return;
  }

  const { data: subscriptionOrders, error: ordersError } = await supabase
    .from('orders')
    .select('id')
    .eq('user_id', user_id)
    .eq('subscription_id', subscriptionId);

  if (ordersError) {
    console.error("Error fetching orders for cancellation:", ordersError);
    return;
  }

  if (subscriptionOrders && subscriptionOrders.length > 0) {
    const orderIds = subscriptionOrders.map(o => o.id);
    const { error: updateOrdersError } = await supabase
      .from('orders')
      .update({ status: 'cancelled' })
      .in('id', orderIds);

    if (updateOrdersError) {
      console.error("Error updating order statuses:", updateOrdersError);
    }
  }
};




  const handleCancelSub = async (id) => {
    await supabase.from('subscriptions').update({ status: 'cancelled', active: false }).eq('id', id);
    await cancelSubscriptionAndOrders(activeSub.id, user.id);

  setActiveSub(null);
  addNotification("Subscription cancelled.", "");
};




  // --- Existing/unchanged logic ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setTimeout(() => {
      const foundUser = DEMO_USERS.find(u =>
        (u.email === loginData.identifier || u.phone === loginData.identifier) &&
        u.password === loginData.password
      );
      if (foundUser) {
        setUser(foundUser);
        setName(foundUser.name);
        setPhone(foundUser.phone);
        localStorage.setItem('currentUser', JSON.stringify(foundUser));
        setShowLogin(false);
        setLoginData({ identifier: "", password: "" });
        addNotification("Welcome back!", `Hello ${foundUser.name}, you're successfully logged in! 👋`);
      } else {
        alert("Invalid credentials!");
      }
      setIsLoggingIn(false);
    }, 1000);
  };

  const handleLogoout = () => {
    setUser(null);
    setName("");
    setPhone("");
    setCart({});
    localStorage.removeItem('currentUser');
    setShowOrderHistory(false);
    addNotification("Goodbye!", "You've been logged out successfully. See you soon! 👋");
  };

  const addNotification = (title, message, type = 'success') => {
    const id = Date.now();
    const newNotification = { id, title, message, timestamp: new Date(), type };
    setNotifications(prev => [newNotification, ...prev.slice(0, 4)]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, type === 'order_update' ? 6000 : 5000);
  };

  const fetchUserOrders = async () => {
    if (!user) return;
    setLoadingOrders(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setUserOrders(data || []);
    } catch (error) {
      //
    } finally {
      setLoadingOrders(false);
    }
  };
  const openOrderHistory = () => {
    setShowOrderHistory(true);
    fetchUserOrders();
  };
  
  const confirmOrder = async () => {
  if (!user || cartList.length === 0) return;

  setIsConfirming(true);
  try {
    // Prepare your order data for Supabase
    const orderData = {
      user_id: user.id,
      status: 'pending',
      items: cartList.map(item => ({
        item_id: item.id,
        title: item.title,
        qty: cart[item.id],
        price: item.price,
        calories: item.calories,
        protein: item.protein,
        carbs: item.carbs,
        fats: item.fats
      })),
      total_price: Math.round(totals.price),
      total_calories: Math.round(totals.calories),
      delivery_address: deliveryType === 'delivery' ? deliveryAddress : null,
      phone: phone
    };

    // Save order to your database
    const { data, error } = await supabase
      .from('orders')
      .insert([orderData])
      .select();

    if (error) throw error;

    const petpoojaPayload =     {
        "app_key": "w7qes154dkgo62bzrp8mufna9vhyx0it",
        "app_secret": "537d86c9b83dae301080d40e01aebb070c7ffe27",
        "access_token": "7ffd7e6da67afa84c712fd9ff8a304b6efe97f5e",
        "orderinfo": {
            "OrderInfo": {
                "Restaurant": {
                    "details": {
                    "res_name": "CYC FOOD",
                    "address": "2nd Floor, Reliance Mall, Nr.Akshar Chowk",
                    "contact_information": "9427846660",
                    "restID": "emx940d3"
                    }
                },
            "Customer": {
                "details": {
                "email": "amar@gmail.com",
                "name": "John Doe",
                "address": "2, Amin Society, Naranpura",
                "phone": "9090909090",
                "latitude": "34.11752681212772",
                "longitude": "74.72949172653219"
                }
            },
            "Order": {
                "details": {
                "orderID": new Date(),
                "preorder_date": "2022-01-01",
                "preorder_time": "15:50:00",
                "service_charge": "0",
                "sc_tax_amount": "0",
                "delivery_charges": "50",
                "dc_tax_percentage": "5",
                "dc_tax_amount": "2.5",
                "dc_gst_details": [
                    {
                    "gst_liable": "vendor",
                    "amount": "2.5"
                    },
                    {
                    "gst_liable": "restaurant",
                    "amount": "0"
                    }
                ],
                "packing_charges": "20",
                "pc_tax_amount": "1",
                "pc_tax_percentage": "5",
                "pc_gst_details": [
                    {
                    "gst_liable": "vendor",
                    "amount": "1"
                    },
                    {
                    "gst_liable": "restaurant",
                    "amount": "0"
                    }
                ],
                "order_type": "H",
                "ondc_bap" : "buyerAppName",
                "advanced_order": "N",
                "urgent_order": false,
                "urgent_time" : 20,
                "payment_type": "COD",
                "table_no": "",
                "no_of_persons": "0",
                "discount_total": "45",
                "tax_total": "65.52",
                "discount_type": "F",
                "total": "560",
                "description": "",
                "created_on": "2022-01-01 15:49:00",
                "enable_delivery": 1,
                "min_prep_time": 20,
                "callback_url": "https://yparjubvkbeytnffqnpv.supabase.co/functions/v1/api-callback",
                "collect_cash": "480",
                "otp": "9876"
                }
            },
           OrderItem: {
  details: cartList.map(item => {
    // Calculate item tax dynamically (2.5% each for CGST and SGST)
    const taxRate = 2.5;
    const taxAmount = ((item.price * taxRate) / 100).toFixed(2);
    const finalPrice = (item.price * (cart[item.id] || 1)).toFixed(2);
    const discount = ''; // Add discount logic if needed

    return {
      id: item.id,
      name: item.title,
      tax_inclusive: true,
      gst_liability: 'vendor',
      item_tax: [
        { id: '11213', name: 'CGST', tax_percentage: taxRate.toString(), amount: taxAmount },
        { id: '20375', name: 'SGST', tax_percentage: taxRate.toString(), amount: taxAmount }
      ],
      item_discount: discount,
      price: item.price.toFixed(2),
      final_price: finalPrice,
      quantity: cart[item.id] || 1,
      description: '',
      variation_name: '',
      variation_id: ''
    };
  })
},

            "Tax": {
                "details": [
                {
                    "id": "11213",
                    "title": "CGST",
                    "type": "P",
                    "price": "2.5",
                    "tax": "5.9",
                    "restaurant_liable_amt": "0.00"
                },
                {
                    "id": "20375",
                    "title": "SGST",
                    "type": "P",
                    "price": "2.5",
                    "tax": "5.9",
                    "restaurant_liable_amt": "0.00"
                },
                {
                    "id": "21866",
                    "title": "CGST",
                    "type": "P",
                    "price": "9",
                    "tax": "25.11",
                    "restaurant_liable_amt": "25.11"
                },
                {
                    "id": "21867",
                    "title": "SGST",
                    "type": "P",
                    "price": "9",
                    "tax": "25.11",
                    "restaurant_liable_amt": "25.11"
                }
                ]
            },
            "Discount": {
                "details": [
                {
                    "id": "362",
                    "title": "Discount",
                    "type": "F",
                    "price": "45"
                }
                ]
            }
        },
        "udid": "2323232",
        "device_type": "Web"
        }
    };

const response = await fetch('https://qle1yy2ydc.execute-api.ap-southeast-1.amazonaws.com/V1/save_order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(petpoojaPayload)
    });

    const result = await response.json();

    if (response.ok) {
      // Handle success if needed
      console.log('Petpooja order created:', result);
    } else {
      // Handle error
      console.error('Petpooja API error:', result);
    }

    // Reset your local state post successful order
    setLastOrderId(data[0].id);
    setCart({});
    setShowCart(false);
    setCartView("items");
    setStep("orderSuccess");
    addNotification("Order Placed! 🎉", `Your order #${data[0].id} has been placed successfully!`);

  } catch (error) {
    console.error('Error placing order:', error);
    alert('Failed to place order. Please try again.');
  } finally {
    setIsConfirming(false);
  }
};

  const resetToMenu = () => { setStep("menu"); setLastOrderId(null); };
  const canContinue = name.trim().length >= 2 && /^\+?\d{8,15}$/.test(phone.replace(/\s/g, ""));
  const itemsFiltered = useMemo(() => {
    const byCategory = category === "All" ? menuItems : menuItems.filter((i) => i.category === category);
    if (!query.trim()) return byCategory;
    const q = query.toLowerCase();
    return byCategory.filter(
      (i) =>
        i.title.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q)
    );
  }, [category, query, menuItems]);
  const cartList = useMemo(() => menuItems.filter((i) => cart[i.id] > 0), [cart, menuItems]);
  const totals = useMemo(() => {
    return cartList.reduce(
      (acc, item) => {
        const qty = cart[item.id] || 0;
        acc.items += qty;
        acc.calories += item.calories * qty;
        acc.protein += item.protein * qty;
        acc.carbs += item.carbs * qty;
        acc.fats += item.fats * qty;
        acc.price += item.price * qty;
        return acc;
      },
      { items: 0, calories: 0, protein: 0, carbs: 0, fats: 0, price: 0 }
    );
  }, [cartList, cart]);
  const increment = (id) => setCart((c) => ({ ...c, [id]: (c[id] || 0) + 1 }));
  const decrement = (id) => setCart((c) => {
    const next = { ...c, [id]: Math.max((c[id] || 0) - 1, 0) };
    if (next[id] === 0) delete next[id];
    return next;
  });

  // --- UI render ---
  return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">

      {/* Enhanced Notifications */}
            <AnimatePresence>
              {notifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: -50, x: 50, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -50, x: 50, scale: 0.8 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  className={`fixed top-20 right-4 z-50 rounded-2xl p-4 shadow-2xl max-w-sm border-2 ${
                    notification.type === 'order_update' 
                      ? 'bg-gradient-to-r from-blue-50 to-green-50 border-green-300' 
                      : 'bg-white border-green-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`h-10 w-10 rounded-full grid place-items-center ${
                      notification.type === 'order_update' 
                        ? 'bg-gradient-to-r from-blue-100 to-green-100' 
                        : 'bg-green-100'
                    }`}>
                      {notification.type === 'order_update' ? (
                        <div className="relative">
                          <Bell className="h-5 w-5 text-green-700" />
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ repeat: 3, duration: 0.5 }}
                            className="absolute inset-0"
                          >
                            <Bell className="h-5 w-5 text-green-600" />
                          </motion.div>
                        </div>
                      ) : (
                        <Bell className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={`font-bold text-sm ${
                        notification.type === 'order_update' ? 'text-green-800' : 'text-gray-800'
                      }`}>
                        {notification.title}
                      </p>
                      <p className="text-xs text-gray-700 mt-1 font-medium">
                        {notification.message}
                      </p>
                      <p className="text-[10px] text-gray-500 mt-1">
                        {new Date(notification.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                    <button
                      onClick={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
                      className="h-6 w-6 rounded-full hover:bg-gray-200 grid place-items-center"
                    >
                      <X className="h-3 w-3 text-gray-500" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
      
            {/* Header */}
            <header className="sticky top-0 z-30 backdrop-blur bg-white/70 border-b border-neutral-200">
              <div className="max-w-screen-sm mx-auto px-4 py-3 flex items-center gap-3">
                <div className="h-9 w-9 rounded-2xl place-items-center">
                  <img src="https://raw.githubusercontent.com/Aryan-Motwani/food/refs/heads/main/WhatsApp%20Image%20sdsd-modified.png" />
                </div>
                <div className="flex-1">
                  <h1 className="text-lg font-semibold leading-tight">Count Your Calories</h1>
                  <p className="text-xs text-neutral-500">
                    {user ? `Welcome back, ${user.name.split(' ')[0]}!` : "Healthy, tasty & fast"}
                  </p>
                </div>
                
                {user ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={fetchMenuItems}
                      className="h-10 w-10 rounded-2xl border border-neutral-300 bg-white grid place-items-center"
                      aria-label="Refresh Menu"
                      disabled={loadingMenu}
                    >
                      <RefreshCw className={`h-5 w-5 ${loadingMenu ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                      onClick={openOrderHistory}
                      className="h-10 w-10 rounded-2xl border border-neutral-300 bg-white grid place-items-center"
                      aria-label="Order History"
                    >
                      <History className="h-5 w-5" />
                    </button>
                    {step === "menu" && (
                      <button
                        onClick={() => setShowCart(true)}
                        className="relative h-10 w-10 rounded-2xl border border-neutral-300 bg-white grid place-items-center"
                        aria-label="Open cart"
                      >
                        <ShoppingCart className="h-5 w-5" />
                        {totals.items > 0 && (
                          <span className="absolute -top-1 -right-1 h-5 min-w-5 px-1 rounded-full bg-black text-white text-xs grid place-items-center">
                            {totals.items}
                          </span>
                        )}
                      </button>
                    )}
                    <button
                      onClick={handleLogout}
                      className="h-10 w-10 rounded-2xl border border-red-300 bg-red-50 grid place-items-center"
                      aria-label="Logout"
                    >
                      <LogOut className="h-4 w-4 text-red-600" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowLogin(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-black text-white text-sm font-medium"
                  >
                    <User className="h-4 w-4" />
                    Login
                  </button>
                )}
              </div>
            </header>

      {/* Main or Subscriptions Tab */}
      <div className="flex mt-3 mx-4 gap-2">
        <button
          className={`flex-1 px-4 py-2 rounded-2xl border text-sm font-semibold ${!subscriptionTab ? "bg-black text-white border-black" : "bg-white border-neutral-300 text-black"}`}
          onClick={() => setSubscriptionTab(false)}
        >
          Menu
        </button>
        <button
          className={`flex-1 px-4 py-2 rounded-2xl border text-sm font-semibold ${subscriptionTab ? "bg-black text-white border-black" : "bg-white border-neutral-300 text-black"}`}
          onClick={() => setSubscriptionTab(true)}
        >
          Subscriptions
        </button>
      </div>

      {!subscriptionTab && (
        // --- Existing Menu UI (copy all your menu/cart logic here, unchanged) ---
        // ... (OMITTED here for brevity)

         <main className="max-w-screen-sm mx-auto pb-28">
                {/* Login Required Message */}
                {!user ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="px-4 pt-8"
                  >
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-3xl p-8 text-center border border-blue-200">
                      <div className="h-16 w-16 bg-blue-100 rounded-full grid place-items-center mx-auto mb-4">
                        <User className="h-8 w-8 text-blue-600" />
                      </div>
                      <h2 className="text-xl font-bold text-gray-900 mb-2">Welcome to Count Your Calories</h2>
                      <p className="text-gray-600 mb-6">Please login to start ordering healthy and delicious meals</p>
                      <button
                        onClick={() => setShowLogin(true)}
                        className="px-6 py-3 bg-black text-white rounded-2xl font-semibold"
                      >
                        Login to Continue
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <AnimatePresence mode="wait">
                    {/* Step 1: Info */}
                    {step === "info" && (
                      <motion.section
                        key="info"
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -16 }}
                        transition={{ duration: 0.25 }}
                        className="px-4 pt-6"
                      >
                        <div className="rounded-3xl p-5 bg-white border border-neutral-200 shadow-sm">
                          <h2 className="text-xl font-semibold">Welcome 👋</h2>
                          <p className="text-sm text-neutral-600 mt-1">Tell us a bit about you to get started.</p>
        
                          <form
                            className="mt-4 grid gap-3"
                            onSubmit={(e) => {
                              e.preventDefault();
                              if (canContinue) setStep("menu");
                            }}
                          >
                            <label className="grid gap-1">
                              <span className="text-xs text-neutral-500">Name</span>
                              <input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="px-4 py-3 rounded-2xl border border-neutral-300 outline-none focus:ring-2 focus:ring-black"
                                placeholder="Your full name"
                                required
                              />
                            </label>
                            <label className="grid gap-1">
                              <span className="text-xs text-neutral-500">Phone</span>
                              <input
                                inputMode="numeric"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="px-4 py-3 rounded-2xl border border-neutral-300 outline-none focus:ring-2 focus:ring-black"
                                placeholder="e.g. +9198xxxxxxx"
                                required
                              />
                              <span className="text-[11px] text-neutral-500">We'll contact you about your order if needed.</span>
                            </label>
        
                            <button
                              disabled={!canContinue}
                              className="mt-2 active:scale-[0.99] transition rounded-2xl bg-black text-white px-4 py-3 font-medium disabled:opacity-50"
                              type="submit"
                            >
                              Continue to Menu
                            </button>
                          </form>
                        </div>
                      </motion.section>
                    )}
        
                    {/* Step 2: Menu */}
                    {step === "menu" && (
                      <motion.section
                        key="menu"
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -16 }}
                        transition={{ duration: 0.25 }}
                      >
                        <div className="px-4 pt-4">
                          <h2 className="text-lg font-semibold">Hey {name.split(" ")[0] || user.name.split(" ")[0]} 👋</h2>
                          <p className="text-sm text-neutral-600">What are you craving today?</p>
                          
                          <div className="flex gap-2 mt-3">
                            <button
                              onClick={() => setPage("myom")}
                              className="px-4 py-3 rounded-2xl bg-black text-white text-sm font-medium active:scale-[0.99]"
                            >
                              Make Your Own Meal
                            </button>
                          </div>
        
                          <motion.div 
  className="mt-4 mx-4"
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.2 }}
>
  <div className="relative">
    <motion.div 
      className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white border border-neutral-300 shadow-sm"
      whileFocus={{ scale: 1.02, borderColor: "#000" }}
      transition={{ duration: 0.2 }}
    >
      <Search className="h-5 w-5 text-neutral-400" />
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search dishes, categories..."
        className="flex-1 outline-none bg-transparent text-sm placeholder-neutral-400"
      />
      {query && (
        <motion.button
          onClick={() => setQuery('')}
          className="h-6 w-6 rounded-full bg-neutral-100 hover:bg-neutral-200 grid place-items-center"
          whileTap={{ scale: 0.9 }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <X className="h-3 w-3" />
        </motion.button>
      )}
    </motion.div>
  </div>
</motion.div>

{/* Auto Carousel Banner Section */}
<motion.div
  className="mt-4 mx-4"
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.2 }}
>
  <div className="relative h-32 rounded-2xl overflow-hidden">
    {[
      { 
        img: "https://thumbs.dreamstime.com/b/pieces-pizza-different-various-types-banner-old-retro-boards-still-life-concept-closeup-129819511.jpg", 
        title: "🍕 Get 50% off on Pizza!", 
        subtitle: "Order now and save big" 
      },
      { 
        img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRKX_pA57WYMzHv7Ykeo6PziwtAb26UuiKc9g&s", 
        title: "🍛 Special Biryani Deal", 
        subtitle: "Free delivery on orders above ₹300" 
      },
      { 
        img: "https://images.unsplash.com/photo-1551782450-17144efb9c50?w=800&h=200&fit=crop", 
        title: "🍔 Burger Combo Offer", 
        subtitle: "Buy 2 get 1 free on all burgers" 
      },
    ].map((banner, index) => (
      <motion.div
        key={index}
        className="absolute inset-0"
        initial={{ opacity: 0, x: 100 }}
        animate={{ 
          opacity: currentBanner === index ? 1 : 0,
          x: currentBanner === index ? 0 : (index > currentBanner ? 100 : -100)
        }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        <img 
          src={banner.img} 
          alt={banner.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent flex flex-col justify-center px-4">
          <h3 className="text-white font-bold text-lg mb-1">{banner.title}</h3>
          <p className="text-white/90 text-sm">{banner.subtitle}</p>
        </div>
      </motion.div>
    ))}
    
    {/* Carousel Indicators */}
    <div className="absolute bottom-2 right-2 flex gap-1">
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className={`w-2 h-2 rounded-full transition-all ${
            currentBanner === index ? 'bg-white' : 'bg-white/50'
          }`}
        />
      ))}
    </div>
  </div>
</motion.div>

{/* Inspiration for your first order - Real Food Items */}
<motion.div
  className="mt-6 px-4"
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.3, duration: 0.4 }}
>
  <h2 className="text-xl font-bold text-neutral-900 mb-4">Inspiration for your first order</h2>
  <div className="overflow-x-auto no-scrollbar">
    <div className="flex gap-4 pb-4">
      {itemsFiltered.slice(0, 8).map((item, index) => (
        <motion.div
          key={item.id}
          className="flex-shrink-0 w-32"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 + 0.4 }}
          whileHover={{ scale: 1.05 }}
        >
          <div className="bg-white rounded-2xl border border-neutral-200 p-3 shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-3">
              <img 
                src={item.img} 
                alt={item.title}
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="text-xs font-medium text-center text-neutral-900 mb-1 truncate">
              {item.title}
            </h3>
            <p className="text-xs font-bold text-center text-black mb-2">₹{item.price}</p>
            {cart[item.id] ? (
              <div className="scale-75 flex justify-center">
                <QtyControl 
                  qty={cart[item.id]} 
                  onDec={() => decrement(item.id)} 
                  onInc={() => increment(item.id)} 
                />
              </div>
            ) : (
              <motion.button
                onClick={() => increment(item.id)}
                className="w-full py-1.5 text-xs rounded-lg bg-black text-white font-medium"
                whileTap={{ scale: 0.95 }}
              >
                Add
              </motion.button>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  </div>
</motion.div>

{/* Top brands for you - Popular Food Items */}
<motion.div
  className="mt-8 px-4"
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.6, duration: 0.4 }}
>
  <h2 className="text-xl font-bold text-neutral-900 mb-4">Top picks for you</h2>
  <div className="overflow-x-auto no-scrollbar">
    <div className="flex gap-4 pb-4">
      {itemsFiltered
        .filter(item => item.price > 200) // Show premium items
        .slice(0, 8)
        .map((item, index) => (
        <motion.div
          key={item.id}
          className="flex-shrink-0 w-40"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 + 0.7 }}
          whileHover={{ y: -2, scale: 1.02 }}
        >
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
            <img 
              src={item.img} 
              alt={item.title}
              className="w-full h-24 object-cover"
            />
            <div className="p-3">
              <h3 className="font-semibold text-sm text-neutral-900 mb-1 truncate">
                {item.title}
              </h3>
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg font-bold text-black">₹{item.price}</span>
                <div className="flex items-center gap-1 text-xs text-neutral-500">
                  <span>⭐ 4.2</span>
                  <span>• 25 min</span>
                </div>
              </div>
              {cart[item.id] ? (
                <div className="scale-90">
                  <QtyControl 
                    qty={cart[item.id]} 
                    onDec={() => decrement(item.id)} 
                    onInc={() => increment(item.id)} 
                  />
                </div>
              ) : (
                <motion.button
                  onClick={() => increment(item.id)}
                  className="w-full py-2 text-sm rounded-lg bg-gradient-to-r from-black to-gray-800 text-white font-medium"
                  whileTap={{ scale: 0.95 }}
                >
                  Add to Cart
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  </div>
</motion.div>

{/* What's on your mind - Category wise items */}
{/* <motion.div
  className="mt-8 px-4"
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.8, duration: 0.4 }}
>
  <h2 className="text-xl font-bold text-neutral-900 mb-4">What's on your mind?</h2>
  <div className="overflow-x-auto no-scrollbar">
    <div className="flex gap-4 pb-4">
      {itemsFiltered
        .filter(item => item.category === 'Italian') // Focus on one category
        .slice(0, 6)
        .map((item, index) => (
        <motion.div
          key={item.id}
          className="flex-shrink-0 w-48"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 + 0.9 }}
          whileHover={{ y: -4, scale: 1.02 }}
        >
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
            <img 
              src={item.img} 
              alt={item.title}
              className="w-full h-32 object-cover"
            />
            <div className="p-4">
              <h3 className="font-bold text-sm text-neutral-900 mb-2 truncate">
                {item.title}
              </h3>
              <div className="flex items-center gap-2 text-xs text-neutral-500 mb-3">
                <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                  {item.calories} kcal
                </span>
                <span>⭐ 4.3</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-black">₹{item.price}</span>
                {cart[item.id] ? (
                  <div className="scale-75">
                    <QtyControl 
                      qty={cart[item.id]} 
                      onDec={() => decrement(item.id)} 
                      onInc={() => increment(item.id)} 
                    />
                  </div>
                ) : (
                  <motion.button
                    onClick={() => increment(item.id)}
                    className="px-4 py-1.5 text-xs rounded-lg bg-black text-white font-medium"
                    whileTap={{ scale: 0.95 }}
                  >
                    Add
                  </motion.button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  </div>
</motion.div> */}


{/* Top brands for you */}
{/* <motion.div
  className="mt-8 px-4"
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.6, duration: 0.4 }}
>
  <h2 className="text-xl font-bold text-neutral-900 mb-4">Top brands for you</h2>
  <div className="overflow-x-auto no-scrollbar">
    <div className="flex gap-4 pb-4">
      {[
        { name: "McDonald's", time: "32 min", img: "https://logos-world.net/wp-content/uploads/2020/04/McDonalds-Logo.png", bg: "bg-yellow-400" },
        { name: "Vrindavan Bhojnalaya", time: "25 min", img: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop&crop=center", bg: "bg-red-800" },
        { name: "Pizza Hut", time: "32 min", img: "https://logos-world.net/wp-content/uploads/2020/06/Pizza-Hut-Logo.png", bg: "bg-red-600" },
        { name: "KFC", time: "28 min", img: "https://logos-world.net/wp-content/uploads/2020/04/KFC-Logo.png", bg: "bg-red-500" },
        { name: "Eat N Joy", time: "25 min", img: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=100&h=100&fit=crop&crop=center", bg: "bg-orange-500" },
        { name: "Domino's", time: "30 min", img: "https://logos-world.net/wp-content/uploads/2020/06/Dominos-Logo.png", bg: "bg-blue-600" },
      ].map((brand, index) => (
        <motion.div
          key={brand.name}
          className="flex-shrink-0 w-36"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 + 0.7 }}
          whileHover={{ y: -2, scale: 1.02 }}
        >
          <div className="bg-white rounded-2xl border border-neutral-200 p-4 shadow-sm hover:shadow-lg transition-all duration-300">
            <div className={`w-16 h-16 ${brand.bg} rounded-full mx-auto mb-3 flex items-center justify-center overflow-hidden`}>
              <img 
                src={brand.img} 
                alt={brand.name}
                className="w-12 h-12 object-contain"
              />
            </div>
            <h3 className="font-semibold text-sm text-center text-neutral-900 mb-1 truncate">
              {brand.name}
            </h3>
            <p className="text-xs text-neutral-500 text-center">{brand.time}</p>
          </div>
        </motion.div>
      ))}
    </div>
  </div>
</motion.div> */}



        
                          {/* Loading state */}
                          {loadingMenu && (
                            <div className="text-center py-8">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-2"></div>
                              <p className="text-sm text-neutral-600">Loading menu...</p>
                            </div>
                          )}
        
                          {/* Error state */}
                          {menuError && (
                            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mt-4">
                              <p className="text-red-700 text-sm">{menuError}</p>
                              <button 
                                onClick={fetchMenuItems}
                                className="mt-2 text-red-600 text-sm font-medium"
                              >
                                Try Again
                              </button>
                            </div>
                          )}
        
                          {/* Show categories and menu items only when not loading and no error */}
                          {!loadingMenu && !menuError && (
                            <>
                             {/* Enhanced Categories with Sliding Animation */}
{/* Enhanced Categories with Round Buttons */}
<motion.div 
  className="mt-4"
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  <div className="px-4 mb-2">
    <h3 className="text-lg font-semibold text-neutral-900">Categories</h3>
  </div>
  <div className="overflow-x-auto no-scrollbar">
    <div className="flex gap-4 px-4 pb-2">
      {CATEGORIES.map((cat, index) => {
        // Define icons for each category
        // Define different icons for each category  
const categoryIcons = {
  'All': UtensilsCrossed,      // Fork and knife crossed
  'Bowls': Soup,               // Bowl icon
  'Pizzas': Pizza,             // Pizza slice
  'Mains': UtensilsCrossed,    // Main dishes 
  'Snacks': Hamburger,             // Snack icon
  'Wraps': Salad,               // Wrap icon
  'Italian': Pizza,            // Pizza for Italian
  'Chinese': Soup,             // Soup bowl for Chinese
  'Indian': Pizza,              // Bowl for Indian
  'Mexican': Sandwich,         // Sandwich for Mexican
  'Desserts': Cake,            // Cake for desserts
  'Beverages': Coffee,         // Coffee cup for beverages
  'Fast Food': Sandwich,       // Sandwich for fast food
  'Vegetarian': Salad,
  'Drinks' : Martini          // Salad for vegetarian
};

        
        const IconComponent = categoryIcons[cat] || UtensilsCrossed;
        
        return (
          <motion.div
            key={cat}
            className="flex-shrink-0"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -2, scale: 1.02 }}
          >
            <button 
              onClick={() => setCategory(cat)}
              className={`w-20 h-20 rounded-full border-2 transition-all duration-300 ${
                category === cat 
                  ? "bg-gradient-to-br from-green-500 to-green-600 border-green-400 text-white shadow-lg scale-105" 
                  : "bg-white border-green-200 text-green-600 hover:border-green-300 hover:shadow-md hover:text-green-700"
              }`}
            >
              <div className="flex flex-col items-center justify-center h-full">
                <IconComponent 
                  className={`w-6 h-6 mb-1 ${
                    category === cat ? 'text-white' : 'text-green-600'
                  }`}
                />
                <span className="text-xs font-medium leading-tight text-center px-1">
                  {cat}
                </span>
              </div>
            </button>
          </motion.div>
        );
      })}
    </div>
  </div>
</motion.div>




        
                              {/* Enhanced Menu Grid with Staggered Animations */}
{/* Enhanced Menu Grid with Staggered Animations */}
<motion.div 
  className="mt-6 grid grid-cols-1 gap-4"
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.4 }}
>
  <AnimatePresence mode="wait">
    {itemsFiltered.map((item, index) => (
      <motion.div
        key={item.id}
        layout
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ 
          duration: 0.3, 
          delay: index * 0.05,
          type: "spring",
          stiffness: 100
        }}
        whileHover={{ y: -4, scale: 1.02 }}
        className="rounded-3xl border border-neutral-200 bg-white p-4 shadow-sm hover:shadow-xl transition-shadow duration-300"
      >
        <div className="flex gap-4">
          <motion.img 
            src={item.img} 
            alt={item.title}
            className="h-24 w-24 rounded-2xl object-cover object-center flex-shrink-0"
            loading="lazy"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.3 }}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-lg text-neutral-900 truncate">{item.title}</h3>
                <p className="text-sm text-neutral-500 mt-1">{item.category}</p>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-600">
                  <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-medium">
                    {item.calories} kcal
                  </span>
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                    {item.protein}g P
                  </span>
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                    {item.carbs}g C
                  </span>
                  <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">
                    {item.fats}g F
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="text-xl font-bold text-black">₹{item.price}</span>
                {cart[item.id] ? (
                  <QtyControl 
                    qty={cart[item.id]} 
                    onDec={() => decrement(item.id)} 
                    onInc={() => increment(item.id)} 
                  />
                ) : (
                  <motion.button
                    onClick={() => increment(item.id)}
                    className="px-4 py-2 text-sm rounded-xl bg-gradient-to-r from-black to-gray-800 text-white font-medium shadow-md hover:shadow-lg transition-all"
                    whileTap={{ scale: 0.95 }}
                    whileHover={{ scale: 1.05, y: -2 }}
                  >
                    Add
                  </motion.button>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Description Toggle */}
        <motion.button
          onClick={() => setDescOpen(d => ({ ...d, [item.id]: !d[item.id] }))}
          className="mt-3 w-full flex items-center justify-center gap-2 text-sm text-neutral-700 hover:text-black transition-colors"
          whileTap={{ scale: 0.98 }}
        >
          <motion.div
            animate={{ rotate: descOpen[item.id] ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronDown className="h-4 w-4" />
          </motion.div>
          <span>Description</span>
        </motion.button>
        
        <AnimatePresence initial={false}>
          {descOpen[item.id] && (
            <motion.p
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="text-sm text-neutral-600 overflow-hidden px-1 mt-2"
            >
              {item.description}
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>
    ))}
  </AnimatePresence>
</motion.div>


                            </>
                          )}
                        </div>
                      </motion.section>
                    )}
        
                    {/* Step 3: Order Success */}
                    {step === "orderSuccess" && (
                      <motion.section
                        key="orderSuccess"
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -16 }}
                        transition={{ duration: 0.25 }}
                        className="px-4 pt-16"
                      >
                        <div className="text-center">
                          <div className="h-20 w-20 rounded-full bg-green-100 grid place-items-center mx-auto mb-4">
                            <CheckCircle className="h-10 w-10 text-green-600" />
                          </div>
                          <h2 className="text-2xl font-semibold mb-2">Order Placed! 🎉</h2>
                          <p className="text-neutral-600 mb-1">Your order has been successfully placed.</p>
                          {lastOrderId && (
                            <p className="text-sm text-neutral-500 mb-6">
                              Order ID: #{lastOrderId}
                            </p>
                          )}
                          
                          <div className="grid gap-3 mt-8">
                            <button
                              onClick={resetToMenu}
                              className="px-6 py-3 rounded-2xl bg-black text-white font-medium active:scale-[0.99]"
                            >
                              Order More
                            </button>
                            {/* <button
                              onClick={() => setPage("orders")}
                              className="px-6 py-3 rounded-2xl border border-neutral-300 font-medium active:scale-[0.99]"
                            >
                              View Order Status
                            </button> */}
                          </div>
                        </div>
                      </motion.section>
                    )}
                  </AnimatePresence>
                )}
              </main>
        
             
      )}

      {/* Subscriptions Tab/Section */}
{subscriptionTab && user && (
  <div className="pb-6">
    {/* Show existing subscription if user has one */}
    {activeSub ? (
      <div className="p-4 bg-green-50 border-b border-green-200">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold text-green-800">Active Subscription</h3>
          <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
            Active
          </span>
        </div>
        <p className="text-green-700 text-sm mb-2">
          Active for <b>{activeSub.days}</b> days • {activeSub.slot === "13:00" ? "1pm" : "7pm"}
        </p>
        <p className="text-green-700 text-sm mb-3">
          Your meals: <b>
            {activeSub.food_items?.map(({ itemid }) => {
              const menuItem = menuItems.find(m => String(m.id) === String(itemid));
              return menuItem?.title;
            }).join(', ')}
          </b>
        </p>
        <div className="flex items-center justify-between">
          <p className="text-xs text-green-600">
            Started {activeSub.start_date} • Ends {activeSub.end_date}
          </p>
          <button 
            className="px-4 py-2 rounded-xl border border-red-400 text-red-700 font-semibold bg-red-50 text-sm" 
            onClick={() => handleCancelSub(activeSub.id)}
          >
            Cancel
          </button>
        </div>
        
        {/* Subscription Calendar */}
        <div className="mt-4">
          <SubscriptionCalendar 
            user={user}
            activeSub={activeSub}
            menuItems={menuItems}
          />
        </div>
      </div>
    ) : null}

    {/* New Subscription Creation */}
    <div>
      {/* Subscription Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-green-50 to-green-100 border-b border-green-200">
        <h2 className="text-lg font-bold text-green-800">
          {activeSub ? 'Modify Subscription' : 'Daily Meal Subscription'}
        </h2>
        <p className="text-sm text-green-600">
          {activeSub ? 'Add more meals to your plan' : 'Build your daily meal plan'}
        </p>
      </div>

      {/* Search Bar */}
      <motion.div 
        className="mt-4 mx-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="relative">
          <motion.div 
            className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white border border-green-200 shadow-sm focus-within:border-green-400 focus-within:shadow-md"
            transition={{ duration: 0.2 }}
          >
            <Search className="h-5 w-5 text-green-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for subscription meals..."
              className="flex-1 outline-none bg-transparent text-sm placeholder-green-400"
            />
            {query && (
              <motion.button
                onClick={() => setQuery('')}
                className="h-6 w-6 rounded-full bg-green-100 hover:bg-green-200 grid place-items-center"
                whileTap={{ scale: 0.9 }}
              >
                <X className="h-3 w-3 text-green-600" />
              </motion.button>
            )}
          </motion.div>
        </div>
      </motion.div>

      {/* Categories for Subscription */}
      <motion.div 
        className="mt-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="px-4 mb-2">
          <h3 className="text-lg font-semibold text-neutral-900">Categories</h3>
        </div>
        <div className="overflow-x-auto no-scrollbar">
          <div className="flex gap-4 px-4 pb-2">
            {CATEGORIES.map((cat, index) => {
              const getIcon = (categoryName) => {
                switch(categoryName) {
                  case 'All': return UtensilsCrossed;
                  case 'Italian': return Pizza;
                  case 'Chinese': return Soup;
                  case 'Indian': return Soup;
                  case 'Mexican': return Sandwich;
                  case 'Desserts': return Cake;
                  case 'Beverages': return Coffee;
                  case 'Fast Food': return Hamburger;
                  case 'Vegetarian': return Salad;
                  default: return UtensilsCrossed;
                }
              };
              
              const IconComponent = getIcon(cat);
              
              return (
                <motion.div
                  key={cat}
                  className="flex-shrink-0"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -2, scale: 1.02 }}
                >
                  <button 
                    onClick={() => setCategory(cat)}
                    className={`w-20 h-20 rounded-full border-2 transition-all duration-300 ${
                      category === cat 
                        ? "bg-gradient-to-br from-green-500 to-green-600 border-green-400 text-white shadow-lg scale-105" 
                        : "bg-white border-green-200 text-green-600 hover:border-green-300 hover:shadow-md hover:text-green-700"
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center h-full">
                      <IconComponent 
                        className={`w-6 h-6 mb-1 ${
                          category === cat ? 'text-white' : 'text-green-600'
                        }`}
                      />
                      <span className="text-xs font-medium leading-tight text-center px-1">
                        {cat}
                      </span>
                    </div>
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Subscription Menu Grid */}
      <motion.div 
        className="mt-6 grid grid-cols-1 gap-4 px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <AnimatePresence mode="wait">
          {itemsFiltered.map((item, index) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ 
                duration: 0.3, 
                delay: index * 0.05,
                type: "spring",
                stiffness: 100
              }}
              whileHover={{ y: -4, scale: 1.02 }}
              className="rounded-3xl border border-green-200 bg-white p-4 shadow-sm hover:shadow-xl transition-shadow duration-300"
            >
              <div className="flex gap-4">
                <motion.img 
                  src={item.img} 
                  alt={item.title}
                  className="h-24 w-24 rounded-2xl object-cover object-center flex-shrink-0"
                  loading="lazy"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-lg text-neutral-900 truncate">{item.title}</h3>
                      <p className="text-sm text-neutral-500 mt-1">{item.category}</p>
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-600">
                        <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-medium">
                          {item.calories} kcal
                        </span>
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                          {item.protein}g P
                        </span>
                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                          {item.carbs}g C
                        </span>
                        <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">
                          {item.fats}g F
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="text-xl font-bold text-green-700">₹{item.price}/day</span>
                      {subscriptionCart[item.id] ? (
                        <QtyControl 
                          qty={subscriptionCart[item.id]} 
                          onDec={() => decrementSubscription(item.id)} 
                          onInc={() => incrementSubscription(item.id)} 
                        />
                      ) : (
                        <motion.button
                          onClick={() => incrementSubscription(item.id)}
                          className="px-4 py-2 text-sm rounded-xl bg-gradient-to-r from-green-600 to-green-700 text-white font-medium shadow-md hover:shadow-lg transition-all"
                          whileTap={{ scale: 0.95 }}
                          whileHover={{ scale: 1.05, y: -2 }}
                        >
                          Add to Plan
                        </motion.button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Subscription Cart Summary - Fixed at bottom */}
      <AnimatePresence>
        {subscriptionCartList.length > 0 && (
          <div className="fixed bottom-20 left-0 right-0 z-30">
            <div className="max-w-screen-sm mx-auto px-4">
              <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4 rounded-3xl shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">
                      {subscriptionCartList.length} meals • ₹{subscriptionTotals.price}/day
                    </p>
                    <p className="font-bold text-lg">Daily Meal Plan</p>
                  </div>
                  <button
                    onClick={() => setShowSubscriptionSetup(true)}
                    className="bg-white text-green-700 px-6 py-2 rounded-xl font-bold hover:bg-green-50 transition-colors"
                  >
                    Start Subscription
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  </div>
)}

{/* Subscription Setup Modal */}
<AnimatePresence>
  {showSubscriptionSetup && (
    <motion.div
      className="fixed inset-0 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/40" onClick={() => setShowSubscriptionSetup(false)} />
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 220, damping: 26 }}
        className="absolute bottom-0 left-0 right-0 max-w-screen-sm mx-auto bg-white rounded-t-3xl shadow-2xl"
      >
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-neutral-900">Setup Subscription</h3>
            <button
              onClick={() => setShowSubscriptionSetup(false)}
              className="p-2 rounded-full hover:bg-neutral-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Duration Selection */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-3">
              Subscription Duration
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { days: 7, label: '1 Week', popular: false },
                { days: 15, label: '2 Weeks', popular: true },
                { days: 26, label: '1 Month', popular: false }
              ].map(option => (
                <button
                  key={option.days}
                  onClick={() => setSubscriptionDuration(option.days)}
                  className={`p-4 rounded-xl border-2 text-center relative ${
                    subscriptionDuration === option.days
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  {option.popular && (
                    <span className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                      Popular
                    </span>
                  )}
                  <div className="font-bold text-lg">{option.days} Days</div>
                  <div className="text-sm text-neutral-600">{option.label}</div>
                  <div className="text-sm font-semibold text-green-600 mt-1">
                    ₹{subscriptionTotals.price * option.days}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Time Slot Selection */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-3">
              Delivery Time
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { slot: '13:00', label: 'Lunch', time: '1:00 PM' },
                { slot: '19:00', label: 'Dinner', time: '7:00 PM' }
              ].map(option => (
                <button
                  key={option.slot}
                  onClick={() => setSubscriptionTimeSlot(option.slot)}
                  className={`p-4 rounded-xl border-2 text-center ${
                    subscriptionTimeSlot === option.slot
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <div className="font-bold">{option.label}</div>
                  <div className="text-sm text-neutral-600">{option.time}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-green-50 p-4 rounded-xl">
            <h4 className="font-bold text-green-800 mb-2">Subscription Summary</h4>
            <div className="text-sm space-y-1 text-green-700">
              <p><strong>{subscriptionCartList.length}</strong> meals per day</p>
              <p><strong>₹{subscriptionTotals.price}</strong> per day</p>
              <p><strong>{subscriptionDuration} days</strong> duration</p>
              <p><strong>{subscriptionTimeSlot === '13:00' ? '1:00 PM' : '7:00 PM'}</strong> delivery</p>
              <div className="border-t border-green-200 mt-2 pt-2">
                <p className="font-bold text-lg">Total: ₹{subscriptionTotals.price * subscriptionDuration}</p>
              </div>
            </div>
          </div>

          {/* Confirm Button */}
          <button
            onClick={startSubscription}
            className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-xl font-bold text-lg hover:from-green-700 hover:to-green-800 transition-all"
          >
            Start Subscription - ₹{subscriptionTotals.price * subscriptionDuration}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>


       {/* Login Modal */}
              <AnimatePresence>
                {showLogin && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-2xl p-6 max-w-sm mx-4 w-full">
      <h2 className="text-xl font-bold mb-4">
        {isSignUp ? "Create Account" : "Sign In"}
      </h2>
      
      {/* Google Sign-in Button */}
      <button
        onClick={handleGoogleLogin}
        disabled={isLoggingIn}
        className="w-full flex items-center justify-center gap-3 p-3 border border-gray-300 rounded-xl mb-4 hover:bg-gray-50"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          {/* Google Icon SVG */}
        </svg>
        Continue with Google
      </button>
      
      <div className="text-center mb-4 text-gray-500">or</div>
      
      {/* Email/Password Form */}
      <form onSubmit={handleEmailLogin}>
        <input
          type="email"
          placeholder="Email"
          value={loginData.email}
          onChange={(e) => setLoginData({...loginData, email: e.target.value})}
          className="w-full p-3 border rounded-xl mb-3"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={loginData.password}
          onChange={(e) => setLoginData({...loginData, password: e.target.value})}
          className="w-full p-3 border rounded-xl mb-4"
          required
        />
        
        <button
          type="submit"
          disabled={isLoggingIn}
          className="w-full bg-black text-white p-3 rounded-xl mb-3"
        >
          {isLoggingIn ? "Please wait..." : (isSignUp ? "Create Account" : "Sign In")}
        </button>
      </form>

      
      <button
        onClick={() => setIsSignUp(!isSignUp)}
        className="w-full text-sm text-gray-600"
      >
        {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
      </button>
      
      <button
        onClick={() => setShowLogin(false)}
        className="absolute top-4 right-4"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  </div>
)}

              </AnimatePresence>
        
              {/* Order History Modal */}
              <AnimatePresence>
                {showOrderHistory && (
                  <motion.div
                    className="fixed inset-0 z-50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="absolute inset-0 bg-black/40" onClick={() => setShowOrderHistory(false)} />
                    <motion.div
                      initial={{ y: "100%" }}
                      animate={{ y: 0 }}
                      exit={{ y: "100%" }}
                      transition={{ type: "spring", stiffness: 200, damping: 26 }}
                      className="absolute bottom-0 left-0 right-0 max-w-screen-sm mx-auto bg-white rounded-t-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden"
                    >
                      <div className="p-4 border-b flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Your Orders</h3>
                        <button
                          onClick={() => setShowOrderHistory(false)}
                          className="h-8 w-8 rounded-full grid place-items-center border"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
        
                      <div className="flex-1 overflow-y-auto p-4">
                        {loadingOrders ? (
                          <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-2"></div>
                            <p className="text-sm text-neutral-600">Loading your orders...</p>
                          </div>
                        ) : userOrders.length === 0 ? (
                          <div className="text-center py-12">
                            <div className="h-16 w-16 rounded-full bg-neutral-100 grid place-items-center mx-auto mb-4">
                              📋
                            </div>
                            <p className="text-neutral-600">No orders yet</p>
                            <p className="text-sm text-neutral-500">Your order history will appear here</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {userOrders.map((order) => {
                              const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                              return (
                                <div key={order.id} className="bg-white border border-neutral-200 rounded-2xl p-4">
                                  <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-semibold">Order #{order.id}</h4>
                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                                      <span>{statusConfig.icon}</span>
                                      {statusConfig.label}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center text-sm text-neutral-600">
                                    <span>{new Date(order.created_at).toLocaleDateString('en-IN')}</span>
                                    <span className="font-semibold text-black">₹{order.total_price}</span>
                                  </div>
                                  <p className="text-xs text-neutral-500 mt-1">
                                    {order.items?.length || 0} items • {order.total_calories} kcal
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
        
              {/* Sticky Cart Bar */}
              <AnimatePresence>
                {totals.items > 0 && step === "menu" && user && (
                  <motion.div
                    initial={{ y: 80, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 80, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 270, damping: 24 }}
                    className="fixed bottom-4 left-0 right-0 z-40"
                  >
                    <div className="max-w-screen-sm mx-auto px-4">
                      <button
                        onClick={() => setShowCart(true)}
                        className="w-full rounded-3xl shadow-lg bg-black text-white px-5 py-4 text-sm font-medium flex items-center justify-between active:scale-[0.99]"
                      >
                        <span>{totals.items} item{totals.items > 1 ? "s" : ""} • ₹ {totals.price}</span>
                        <span className="inline-flex items-center gap-2">
                          View Cart <ShoppingCart className="h-5 w-5" />
                        </span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
        
              {/* Cart Drawer */}
              <AnimatePresence>
                {showCart && (
                  <motion.div
                    className="fixed inset-0 z-50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div
                      className="absolute inset-0 bg-black/40"
                      onClick={() => setShowCart(false)}
                    />
        
                    <motion.div
                      role="dialog"
                      aria-modal="true"
                      initial={{ y: "100%" }}
                      animate={{ y: 0 }}
                      exit={{ y: "100%" }}
                      transition={{ type: "spring", stiffness: 200, damping: 26 }}
                      className="absolute bottom-0 left-0 right-0 max-w-screen-sm mx-auto bg-white rounded-t-3xl shadow-2xl
                                flex flex-col max-h-[85vh] overflow-hidden"
                    >
                      <div className="p-4 border-b flex items-center justify-between shrink-0">
                        <h3 className="font-semibold">Your Cart</h3>
                        <button
                          className="h-8 w-8 rounded-full grid place-items-center border"
                          onClick={() => setShowCart(false)}
                          aria-label="Close cart"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
        
                      <div className="flex-1 overflow-y-auto">
                        <div className="p-4 space-y-3">
                          {cartList.length === 0 ? (
                            <p className="text-sm text-neutral-500">Your cart is empty.</p>
                          ) : (
                            cartList.map((item) => (
                              <div key={item.id} className="flex gap-3 items-center">
                                <img src={item.img} alt="" className="h-14 w-14 rounded-xl object-cover" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{item.title}</p>
                                  <p className="text-xs text-neutral-500">₹ {item.price}</p>
                                </div>
                                <QtyControl
                                  qty={cart[item.id]}
                                  onDec={() => decrement(item.id)}
                                  onInc={() => increment(item.id)}
                                />
                              </div>
                            ))
                          )}
                        </div>
        
                        <div className="p-4 border-t bg-neutral-50 space-y-4">
                          {cartView === "items" ? (
                            <>
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className="rounded-2xl bg-white border p-3">
                                  <p className="text-xs text-neutral-500">Calories</p>
                                  <p className="text-lg font-semibold">{totals.calories} kcal</p>
                                </div>
                                <div className="rounded-2xl bg-white border p-3">
                                  <p className="text-xs text-neutral-500">Protein</p>
                                  <p className="text-lg font-semibold">{totals.protein} g</p>
                                </div>
                                <div className="rounded-2xl bg-white border p-3">
                                  <p className="text-xs text-neutral-500">Carbs</p>
                                  <p className="text-lg font-semibold">{totals.carbs} g</p>
                                </div>
                                <div className="rounded-2xl bg-white border p-3">
                                  <p className="text-xs text-neutral-500">Fats</p>
                                  <p className="text-lg font-semibold">{totals.fats} g</p>
                                </div>
                              </div>
        
                              <div className="mt-3 flex items-center justify-between">
                                <p className="text-base font-semibold">Total • ₹ {totals.price}</p>
                                <button
                                  onClick={() => setCartView("checkout")}
                                  className="px-4 py-3 rounded-2xl bg-black text-white text-sm font-medium active:scale-[0.99]"
                                >
                                  Proceed to Checkout
                                </button>
                              </div>
                            </>
                          ) : (
                            <>

                                    // Checkout view
                      <div>
      <div className="flex items-center justify-between mb-3">
        <label className="block font-medium text-neutral-700">Delivery Address</label>
        <button
          onClick={() => setShowAddressForm(true)}
          className="text-sm text-green-600 hover:text-green-700"
        >
          + Add New
        </button>
      </div>
      
      {selectedAddress ? (
        <div className="bg-green-50 border border-green-200 rounded-xl p-3">
          <p className="text-sm font-medium text-gray-900">{selectedAddress.fullAddress}</p>
          <button
            onClick={() => setShowAddressForm(true)}
            className="text-xs text-green-600 hover:text-green-700 mt-1"
          >
            Edit Address
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowAddressForm(true)}
          className="w-full px-3 py-3 border-2 border-dashed border-green-300 rounded-xl text-green-600 hover:bg-green-50 transition-colors"
        >
          + Add Delivery Address
        </button>
      )}
      
    </div>
                              <div className="space-y-5 text-sm">
                                <AnimatePresence>
                                  {showAddressForm && (
                                    <motion.div
                                      className="fixed inset-0 z-60 bg-black/40"
                                      initial={{ opacity: 0 }}
                                      animate={{ opacity: 1 }}
                                      exit={{ opacity: 0 }}
                                      onClick={() => setShowAddressForm(false)}
                                    >
                                      <div className="flex items-center justify-center min-h-screen p-4">
                                        <motion.div
                                          initial={{ scale: 0.95, opacity: 0 }}
                                          animate={{ scale: 1, opacity: 1 }}
                                          exit={{ scale: 0.95, opacity: 0 }}
                                          onClick={(e) => e.stopPropagation()}
                                          className="w-full max-w-md"
                                        >
                                          <AddressForm
                                            onSubmit={(address) => {
                                              setSelectedAddress(address);
                                              setShowAddressForm(false);
                                              // Optionally save to user's address list in database
                                            }}
                                            initialAddress={selectedAddress}
                                          />
                                        </motion.div>
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
        
                                <div>
                                  <label className="block font-medium text-neutral-700 mb-1">Coupon Code</label>
                                  <input
                                    type="text"
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value)}
                                    placeholder="Enter coupon"
                                    className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-black outline-none"
                                  />
                                </div>
        
                                {/* <div>
                                  <p className="font-medium text-neutral-700 mb-1">Delivery</p>
                                  <div className="flex gap-3">
                                    <label className="flex items-center gap-2">
                                      <input 
                                        type="radio" 
                                        name="delivery" 
                                        value="pickup"
                                        checked={deliveryType === "pickup"}
                                        onChange={(e) => setDeliveryType(e.target.value)}
                                      /> Pickup
                                    </label>
                                    <label className="flex items-center gap-2">
                                      <input 
                                        type="radio" 
                                        name="delivery" 
                                        value="delivery"
                                        checked={deliveryType === "delivery"}
                                        onChange={(e) => setDeliveryType(e.target.value)}
                                      /> Home Delivery
                                    </label>
                                  </div>
                                </div> */}
        
                                <div>
                                  <p className="font-medium text-neutral-700 mb-1">Payment</p>
                                  <div className="flex flex-col gap-2">
                                    <label className="flex items-center gap-2">
                                      <input 
                                        type="radio" 
                                        name="payment" 
                                        value="upi"
                                        checked={paymentMethod === "upi"}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                      /> UPI
                                    </label>
                                    <label className="flex items-center gap-2">
                                      <input 
                                        type="radio" 
                                        name="payment" 
                                        value="card"
                                        checked={paymentMethod === "card"}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                      /> Card
                                    </label>
                                    <label className="flex items-center gap-2">
                                      <input 
                                        type="radio" 
                                        name="payment" 
                                        value="cod"
                                        checked={paymentMethod === "cod"}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                      /> Cash on Delivery
                                    </label>
                                  </div>
                                </div>
        
                                <div className="border-t pt-3 text-sm">
                                  <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span>₹ {totals.price}</span>
                                  </div>
                                  <div className="flex justify-between text-green-600">
                                    <span>Discount</span>
                                    <span>- ₹ 0</span>
                                  </div>
                                  <div className="flex justify-between text-base font-semibold mt-1">
                                    <span>Total</span>
                                    <span>₹ {totals.price}</span>
                                  </div>
                                </div>
        
                                <button 
                                  onClick={confirmOrder}
                                  disabled={isConfirming || cartList.length === 0}
                                  className="w-full py-3 bg-black text-white rounded-2xl font-medium active:scale-[0.98] disabled:opacity-50"
                                >
                                  {isConfirming ? (
                                    <div className="flex items-center justify-center gap-2">
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                      Placing Order...
                                    </div>
                                  ) : (
                                    "Confirm Order"
                                  )}
                                </button>
                                <button
                                  onClick={() => setCartView("items")}
                                  className="w-full py-2 text-sm text-neutral-600"
                                >
                                  ← Back to Cart
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
    </div>
  );
}



function SubscriptionModal({ show, menuItems, subscriptionForm, setSubscriptionForm, onClose, onSubmit }) {
  const toggleFoodItem = (id) => {
    const current = subscriptionForm.foodIds || [];
    const isSelected = current.includes(id);
    if (isSelected) {
      setSubscriptionForm({ ...subscriptionForm, foodIds: current.filter(i => i !== id) });
    } else {
      setSubscriptionForm({ ...subscriptionForm, foodIds: [...current, id] });
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
          className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity:1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="bg-white rounded-3xl w-full max-w-md p-6 relative"
            onClick={e => e.stopPropagation()}
          >
            <button onClick={onClose} className="absolute top-4 right-4 rounded-full p-1 hover:bg-gray-100" aria-label="Close modal">
              <X className="w-5 h-5 text-gray-600" />
            </button>

            <h3 className="text-xl font-bold mb-4">Create Subscription</h3>

            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="block font-semibold mb-2">Select Dishes</label>
                <div className="max-h-48 overflow-auto border border-gray-300 rounded-lg p-2 grid grid-cols-2 gap-2">
                  {menuItems.map(item => {
                    const selected = (subscriptionForm.foodIds || []).includes(item.id);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => toggleFoodItem(item.id)}
                        className={`px-3 py-2 rounded-lg border text-left cursor-pointer ${
                          selected
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-gray-900 border-gray-300 hover:bg-blue-50"
                        }`}
                      >
                        {item.title}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-2">Duration</label>
                <select
                  required
                  value={subscriptionForm.days}
                  onChange={e => setSubscriptionForm({ ...subscriptionForm, days: Number(e.target.value) })}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value={7}>7 days</option>
                  <option value={15}>15 days</option>
                  <option value={26}>26 days</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-2">Delivery Time</label>
                <select
                  required
                  value={subscriptionForm.slot}
                  onChange={e => setSubscriptionForm({ ...subscriptionForm, slot: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="13:00">1:00 PM</option>
                  <option value="19:00">7:00 PM</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={!subscriptionForm.foodIds || subscriptionForm.foodIds.length === 0}
                className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl disabled:opacity-60"
              >
                Start Subscription
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}


// Helper for item quantity
function QtyControl({ qty, onInc, onDec }) {
  return (
    <motion.div 
      className="flex items-center gap-3 bg-gradient-to-r from-neutral-100 to-neutral-50 rounded-2xl px-3 py-2 shadow-sm border border-neutral-200"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <motion.button
        onClick={onDec}
        className="h-8 w-8 grid place-items-center rounded-xl bg-white border border-neutral-300 hover:border-red-400 hover:bg-red-50 transition-colors"
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.1 }}
        aria-label="Decrease quantity"
      >
        <Minus className="h-4 w-4 text-red-500" />
      </motion.button>
      
      <motion.span 
        className="w-8 text-center text-lg font-bold text-neutral-800"
        key={qty}
        initial={{ scale: 1.2, color: "#10b981" }}
        animate={{ scale: 1, color: "#374151" }}
        transition={{ duration: 0.2 }}
      >
        {qty}
      </motion.span>
      
      <motion.button
        onClick={onInc}
        className="h-8 w-8 grid place-items-center rounded-xl bg-white border border-neutral-300 hover:border-green-400 hover:bg-green-50 transition-colors"
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.1 }}
        aria-label="Increase quantity"
      >
        <Plus className="h-4 w-4 text-green-500" />
      </motion.button>
    </motion.div>
  );
}


const style = document.createElement("style");
style.textContent = `
  .no-scrollbar::-webkit-scrollbar { display: none; }
  .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
`;
document.head.appendChild(style);
// Add this after your existing CSS
const enhancedStyle = document.createElement('style');
enhancedStyle.textContent = `
  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  
  /* Smooth scrolling for categories */
  .category-scroll {
    scroll-behavior: smooth;
    scroll-snap-type: x mandatory;
  }
  
  /* Enhanced shadows */
  .shadow-elegant {
    box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.1), 0 2px 8px -2px rgba(0, 0, 0, 0.06);
  }
  
  /* Gradient backgrounds */
  .bg-food-gradient {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }

  .line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

`;
document.head.appendChild(enhancedStyle);
