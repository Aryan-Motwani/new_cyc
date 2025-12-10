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
import RazorpayPayment from "./Razorpay";


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
  accepted: { label: "Accepted", color: "bg-blue-100 text-blue-800", icon: "✅" },
  out_for_delivery: { label: "Out for Delivery", color: "bg-purple-100 text-purple-800", icon: "🚚" },
  delivered: { label: "Delivered", color: "bg-green-100 text-green-800", icon: "📦" },
  food_ready: { label: "Food Ready", color: "bg-green-100 text-green-800", icon: "📦" },
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

  let discount_total = 0;

  // payment
  const handlePayment = () => {
  return new Promise((resolve) => {
    // Load Razorpay script dynamically
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      const options = {
        key: "rzp_live_RnqOet70XAGj0P",
        amount: totals.price * 100,
        currency: "INR",
        name: "Your Meal",
        description: "Custom Meal Order",
        handler: function (response) {
          console.log("Payment Success", response);
          resolve(true);       // ⬅ return true on success
        },
        prefill: {
          name: "Customer Name",
          email: "customer@example.com",
          contact: "9999999999",
        },
        theme: { color: "#F37254" },
      };

      const rzp = new window.Razorpay(options);

      // ⬅ return false if user closes payment window or payment fails
      rzp.on("payment.failed", function (response) {
        console.log("Payment Failed", response);
        resolve(false);
      });

      rzp.open();
    };
  });
};

  
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

  // const result = await handlePayment();

  // if (result) {
  //   console.log("Payment completed ✔");
  // } else {
  //   console.log("Payment failed ❌");
  //   return
  // }

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
                "email": "",
                "name": name,
                "address": "",
                "phone": phone,
                "latitude": "34.11752681212772",
                "longitude": "74.72949172653219"
                }
            },
            "Order": {
                "details": {
                "orderID": data[0].id,
                "preorder_date": "2025-12-12",
                "preorder_time": "15:50:00",
                "delivery_time" : "2025-12-17T12:00:00",
                "service_charge": "0",
                "sc_tax_amount": "0",
                "delivery_charges": "0",
                "dc_tax_percentage": "0",
                "dc_tax_amount": "0",
                "dc_gst_details": [
                   
                ],
                "packing_charges": "0",
                "pc_tax_amount": "0",
                "pc_tax_percentage": "0",
                "pc_gst_details": [
                    
                ],
                "order_type": "H",
                "ondc_bap" : "buyerAppName",
                "advanced_order": "N",
                "urgent_order": false,
                "urgent_time" : 20,
                "payment_type": "COD",
                "table_no": "",
                "no_of_persons": "0",
                "discount_total": discount_total,
                "tax_total": "",
                "discount_type": "F",
                "total": totals.price - discount_total,
                "description": "",
                "created_on": "2022-01-01 15:49:00",
                "enable_delivery": 1,
                "min_prep_time": 20,
                "callback_url": "https://yparjubvkbeytnffqnpv.supabase.co/functions/v1/api-callback",
                'Authorization': 'Bearer 7ffd7e6da67afa84c712fd9ff8a304b6efe97f5e',
                "collect_cash": "",
                "otp": ""
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
      ],
      item_discount: discount,
      price: item.price.toFixed(2),
      final_price: finalPrice,
      quantity: cart[item.id] || 1,
      description: '',
      variation_name: "less spicy",
      "AddonItem": {
                      "details": [
                        
                        {
                          "id": "1150813",
                          "name": "Cheese",
                          "group_name": "Extra Cheese",
                          "price": "10",
                          "group_id": 135707,
                          "quantity": "1"
                        }
                      ]
                    }
      
    };
  })
},

            "Tax": {
                
            },
            "Discount": {
                "details": [
               
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
        'Content-Type': 'application/json',
        'Authorization' : 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlwYXJqdWJ2a2JleXRuZmZxbnB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MTQzODcsImV4cCI6MjA3MzQ5MDM4N30.u_-ZLFNbdOv16-igoCblhu_sAWn-nF-1F2wAPybMReQ'
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
  const byCategory =
    category === "All" ? menuItems : menuItems.filter((i) => i.category === category);

  if (!query.trim()) return byCategory.sort((a, b) => a.price - b.price);

  const q = query.toLowerCase();
  return byCategory
    .filter(
      (i) =>
        i.title.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q)
    )
    .sort((a, b) => a.price - b.price); // sort after filtering
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
        img: "data:image/jpeg;base64,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", 
        title: "🥗 Healthy Bowls", 
        subtitle: "🍴 Order now and save big" 
      },
      { 
        img: "data:image/jpeg;base64,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", 
        title: "🥤 Guilt-Free Smoothies", 
        subtitle: "Have a drink without any guilt" 
      },
      { 
        img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR0nkS69PXA38pGRL2Tc8NJvq-pIyTR7HTleQ&s", 
        title: "🥗 Tasty Salads", 
        subtitle: "Taste and Health, Both Check ✅" 
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
                              const statusConfig = STATUS_CONFIG[order.status.toLowerCase().split(" ").join("_")] || STATUS_CONFIG.pending;
                              return (
                                <div key={order.id} className="bg-white border border-neutral-200 rounded-2xl p-4">
                                  <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-semibold">Order #{order.id} {order.status}</h4>
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

                                    
                      <div>
      {/* <div className="flex items-center justify-between mb-3">
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
      )} */}
      
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
        
                                {/* <div>
                                  <label className="block font-medium text-neutral-700 mb-1">Coupon Code</label>
                                  <input
                                    type="text"
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value)}
                                    placeholder="Enter coupon"
                                    className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-black outline-none"
                                  />
                                </div> */}
        
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
        
                                {/* <div>
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
                                </div> */}
        
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
