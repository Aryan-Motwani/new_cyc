import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus } from "lucide-react";
import AddressForm from './AddressForm';
import { supabase } from "../createClient";
import { image } from "framer-motion/client";

let categories = []
async function getFormattedMealOptions() {
  const { data, error } = await supabase
    .from('meal_options')
    .select('*');

  if (error) {
    console.error('Error fetching data:', error);
    return [];
  }

  // Group options by category
  const categories = {};
  data.forEach(option => {
    const {
      category_name: name,
      category_title: title,
      unit,
      base_amount: baseAmount,
      id,
      name: optionName,
      calories,
      protein,
      carbs,
      fat,
      price,
      image_url,
      fiber
    } = option;

    if (!categories[name]) {
      categories[name] = {
        name,
        title,
        unit,
        baseAmount,
        options: []
      };
    }

    categories[name].options.push({
      id,
      name: optionName,
      calories,
      protein,
      carbs,
      fat,
      price,
      image: image_url // Set image to empty string as requested
    });
  });

  // Convert object to array
  return Object.values(categories);
}

// Usage
getFormattedMealOptions().then(formattedArray => {
  categories = formattedArray;
});


export default function MyomMeal({ onBack, setPage, user, supabase }) {
  const [currentCategory, setCurrentCategory] = useState(0);
  const [cart, setCart] = useState([{}]); // Cart is an array of meal objects
  const [currentMealIndex, setCurrentMealIndex] = useState(0);
  const [showCart, setShowCart] = useState(false);
  const [cartView, setCartView] = useState("items");
  const [showQty, setShowQty] = useState(false);
  const [pendingPick, setPendingPick] = useState(null);
  const [pendingQty, setPendingQty] = useState(0);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);

  // const [showSubscriptionSetup, SetshowSubscriptionSetup] = useState(false);
const [subscriptionDays, setSubscriptionDays] = useState(7);
const [timeSlot, setTimeSlot] = useState("Morning");

const [showSubscriptionSetup, setShowSubscriptionSetup] = useState(false);
const [subscriptionDuration, setSubscriptionDuration] = useState(7);
const [subscriptionTimeSlot, setSubscriptionTimeSlot] = useState('13:00');
const [subscriptionCartList, setSubscriptionCartList] = useState([]);
const [subscriptionTotals, setSubscriptionTotals] = useState({ price: 0 });

const startSubscription = async () => {

  const result = handlePayment();

  if (result) {
    console.log("Payment completed ✔");
     const { data, error } = await supabase
    .from('meal_subscriptions')
    .insert([{
      user_id: user.id,
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + subscriptionDuration * 24 * 60 * 60 * 1000).toISOString(),
      time_slot: subscriptionTimeSlot,
      frequency: 5, // or based on user input
      delivery_address: selectedAddress?.fullAddress || '',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }]);

  if (error) {
    console.error('Error saving subscription:', error);
    addNotification("Error", "Failed to save subscription", "error");
  } else {
    addNotification("Success", "Subscription saved successfully", "success");
    setShowSubscriptionSetup(false);
  }
  } else {
    console.log("Payment failed ❌");
    return
  }

 
};


const saveSubscription = async () => {
  // Insert subscription into meal_subscriptions table
  const { data, error } = await supabase
    .from('meal_subscriptions')
    .insert([{
      user_id: user.id,
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + subscriptionDays * 24 * 60 * 60 * 1000).toISOString(),
      time_slot: timeSlot,
      frequency: 5, // or based on user input
      delivery_address: selectedAddress?.fullAddress || '',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }]);

  if (error) {
    console.error('Error saving subscription:', error);
    addNotification("Error", "Failed to save subscription", "error");
  } else {
    addNotification("Success", "Subscription saved successfully", "success");
    setShowSubscriptionSetup(false);
  }
};




  const addNotification = (title, message, type = 'success') => {
    const id = Date.now();
    const newNotification = { id, title, message, type };
    setNotifications(prev => [...prev, newNotification]);
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 4000);
  };
  
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

  useEffect(() => {
    const open = showCart || showQty;
    if (open) {
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
    } else {
      document.body.style.overflow = "";
      document.body.style.touchAction = "manipulation";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.touchAction = "manipulation";
    };
  }, [showCart, showQty]);

  const handleOptionTap = (categoryIndex, option) => {
    const cat = categories[categoryIndex];
    setPendingPick({ categoryIndex, option });
    setPendingQty(cat.baseAmount);
    setShowQty(true);
  };

  const confirmQuantity = () => {
    if (!pendingPick) return;
    const { categoryIndex, option } = pendingPick;
    const cat = categories[categoryIndex];
    const qtyClean = Math.max(1, Number(pendingQty) || cat.baseAmount);
    setCart(prev => {
      const newCart = [...prev];
      newCart[currentMealIndex] = {
        ...newCart[currentMealIndex],
        [cat.name]: { option, qty: qtyClean }
      };
      return newCart;
    });
    setShowQty(false);
    setPendingPick(null);
    if (categoryIndex < categories.length - 1) {
      setTimeout(() => setCurrentCategory(categoryIndex + 1), 200);
    }
  };

  const addMeal = () => {
    setCart(prev => [...prev, {}]);
    setCurrentMealIndex(prev => prev + 1);
  };

  const switchMeal = (index) => {
    setCurrentMealIndex(index);
  };

  const totals = useMemo(() => {
    let calories = 0, protein = 0, carbs = 0, fat = 0
    , price = 0, items = 0;
    cart.forEach(meal => {
      for (const cat of categories) {
        const row = meal[cat.name];
        if (!row) continue;
        const { option, qty } = row;
        const factor = qty / cat.baseAmount;
        calories += option.calories * factor;
        protein += option.protein * factor;
        carbs += option.carbs * factor;
        fat += option.fat * factor;
        price += option.price * factor;
        items++;
      }
    });
    return {
      calories: Math.round(calories),
      protein: Math.round(protein),
      carbs: Math.round(carbs),
      fats: Math.round(fat),
      price: Math.round(price),
      items
    };
  }, [cart]);

  const itemMacros = (mealIndex, catName) => {
    const cat = categories.find(c => c.name === catName);
    const row = cart[mealIndex][catName];
    if (!row) return { cals:0, p:0, c:0, f:0
      , price:0, qty:0, unit:cat.unit };
    const factor = row.qty / cat.baseAmount;
    return {
      cals: Math.round(row.option.calories * factor),
      p: Math.round(row.option.protein * factor),
      c: Math.round(row.option.carbs * factor),
      f: Math.round(row.option.fat * factor),
      price: Math.round(row.option.price * factor),
      qty: row.qty,
      unit: cat.unit
    };
  };

  const handleConfirmOrder = async () => {
    if (!user) {
      addNotification("Error", "Please login first", "error");
      return;
    }
    if (cart.every(meal => Object.keys(meal).length === 0)) {
      addNotification("Error", "Your cart is empty", "error");
      return;
    }

    const result = handlePayment();

  if (result) {
    console.log("Payment completed ✔");
    setIsPlacingOrder(true);
    try {
      const orderItems = [];
      cart.forEach((meal, mealIndex) => {
        categories.forEach(cat => {
          const row = meal[cat.name];
          if (row) {
            const macros = itemMacros(mealIndex, cat.name);
            orderItems.push({
              item_id: row.option.id,
              title: row.option.name,
              category: cat.name,
              qty: row.qty,
              unit: cat.unit,
              price: macros.price,
              calories: macros.cals,
              protein: macros.p,
              carbs: macros.c,
              fats: macros.f,
            });
          }
        });
      });
      const orderData = {
        user_id: user.id,
        items: orderItems,
        total_price: totals.price,
        delivery_address: 'pickup',
        status: 'pending',
        phone: user.phone || '',
        created_at: new Date().toISOString()
      };
      if (supabase) {
        const { data, error } = await supabase
          .from('orders')
          .insert([orderData])
          .select()
          .single();
        if (error) throw error;
      }
      addNotification("Order Placed! 🎉", `Your custom meal order for ₹${totals.price} has been placed successfully!`);
      setCart([{}]);
      setCurrentMealIndex(0);
      setShowCart(false);
      setTimeout(() => {
        if (onBack) onBack();
        else if (setPage) setPage("menu");
        else window.history.back();
      }, 1500);
    } catch (error) {
      console.error('Error placing order:', error);
      addNotification("Error", "Failed to place order. Please try again.", "error");
    } finally {
      setIsPlacingOrder(false);
    }
  } else {
    console.log("Payment failed ❌");
    return
  }

    
  };

  const handleBackButton = () => {
    if (onBack) onBack();
    else if (setPage) setPage("menu");
    else window.history.back();
  };

  return (
    <div className="pb-28 bg-gradient-to-br from-green-50 via-white to-green-50 min-h-screen">
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map(notification => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className={`p-4 rounded-xl shadow-lg max-w-sm ${
              notification.type === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
            }`}
          >
            <h4 className="font-semibold">{notification.title}</h4>
            <p className="text-sm opacity-90">{notification.message}</p>
          </motion.div>
        ))}
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handleBackButton}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-green-200 hover:bg-green-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm font-medium text-green-700">Back to Menu</span>
          </button>
          <h1 className="text-lg font-bold text-neutral-900">Build Your Meal</h1>
          <div className="w-20"></div>
        </div>

        {/* Meal selector */}
        <div className="flex gap-2 mb-4 overflow-x-auto">
          {cart.map((_, index) => (
            <button
              key={index}
              onClick={() => switchMeal(index)}
              className={`px-4 py-2 text-sm rounded-xl whitespace-nowrap transition-colors ${
                index === currentMealIndex
                  ? "bg-gradient-to-r from-green-600 to-green-700 text-white"
                  : "bg-green-100 text-green-700 hover:bg-green-200"
              }`}
            >
              Meal {index + 1}
            </button>
          ))}
          <button
            onClick={addMeal}
            className="px-4 py-2 text-sm rounded-xl bg-green-100 text-green-700 hover:bg-green-200"
          >
            + Add Meal
          </button>
        </div>

        {/* Category navigation */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 no-scrollbar">
          {categories.map((cat, i) => (
            <button
              key={cat.name}
              onClick={() => setCurrentCategory(i)}
              className={`px-4 py-2 text-sm rounded-xl whitespace-nowrap transition-colors ${
                i === currentCategory
                  ? "bg-gradient-to-r from-green-600 to-green-700 text-white"
                  : "bg-green-100 text-green-700 hover:bg-green-200"
              }`}
            >
              {cat.name.toUpperCase()}
            </button>
          ))}
        </div>

        <h2 className="text-lg font-semibold text-center mb-3">
          {categories[currentCategory].title}
        </h2>

        {/* Meal options grid */}
        <div className="grid grid-cols-2 gap-4 overflow-y-auto max-h-[420px] pr-2 no-scrollbar">
          {categories[currentCategory].options.map((opt) => {
            const cat = categories[currentCategory];
            const isSelected = cart[currentMealIndex][cat.name]?.option?.id === opt.id;
            const row = cart[currentMealIndex][cat.name];
            return (
              <div
                key={opt.id}
                className={`bg-white rounded-xl border shadow-sm p-3 cursor-pointer active:scale-[0.99] transition ${
                  isSelected ? "border-green-500 ring-2 ring-green-200" : "border-neutral-200 hover:border-green-300"
                }`}
                onClick={() => handleOptionTap(currentCategory, opt)}
              >
                <img
                  src={opt.image}
                  alt={opt.name}
                  className="w-full h-24 object-cover rounded-lg mb-2"
                />
                <h3 className="font-medium text-center truncate">{opt.name}</h3>
                <p className="text-xs text-neutral-600 text-center">
                  per {cat.baseAmount}{cat.unit}: {opt.calories} cal • {opt.protein}g P
                </p>
                <p className="text-xs text-green-700 text-center">₹{opt.price}</p>
                {isSelected && (
                  <div className="mt-2 text-center text-xs text-green-700 bg-green-50 py-1 rounded-lg">
                    Selected: {row.qty}{cat.unit}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40">
        <div className="max-w-screen-sm mx-auto px-4 pb-[env(safe-area-inset-bottom)]">
          <div className="w-full rounded-3xl bg-gradient-to-r from-green-600 to-green-700 text-white px-5 py-4 text-sm font-medium flex items-center justify-between shadow-lg">
            <span>₹ {totals.price}</span>
            <button
              onClick={() => { setShowCart(true); setCartView("items"); }}
              className="rounded-xl border border-white/20 px-3 py-1.5 active:scale-95 hover:bg-white/10 transition-all"
            >
              View Cart ({totals.items})
            </button>
          </div>
        </div>
      </div>

      {/* Quantity Drawer */}
      <AnimatePresence>
        {showQty && pendingPick && (
          <motion.div
            className="fixed inset-0 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/40" onClick={() => setShowQty(false)} />
            <motion.div
              role="dialog"
              aria-modal="true"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 220, damping: 26 }}
              className="absolute bottom-0 left-0 right-0 max-w-screen-sm mx-auto bg-white rounded-t-3xl shadow-2xl"
              style={{ maxHeight: "80vh" }}
            >
              <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-white rounded-t-3xl">
                <h3 className="font-semibold">Choose Quantity</h3>
                <button
                  className="h-8 w-8 rounded-full grid place-items-center border"
                  onClick={() => setShowQty(false)}
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-4 space-y-4 overflow-y-auto" style={{ maxHeight: "calc(80vh - 64px)" }}>
                {(() => {
                  const cat = categories[pendingPick.categoryIndex];
                  const unit = cat.unit;
                  const base = cat.baseAmount;
                  const quick = [base, base * 2, base * 3];
                  return (
                    <>
                      <div className="flex items-center gap-3">
                        <img
                          src={pendingPick.option.image}
                          alt={pendingPick.option.name}
                          className="h-16 w-16 rounded-xl object-cover"
                        />
                        <div>
                          <p className="font-medium">{pendingPick.option.name}</p>
                          <p className="text-xs text-neutral-600">
                            per {base}{unit}: {pendingPick.option.calories} cal • {pendingPick.option.protein}g P • {pendingPick.option.carbs}g C • {pendingPick.option.fat}g F
                          </p>
                          <p className="text-xs text-green-700">₹{pendingPick.option.price}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {quick.map(q => (
                          <button
                            key={q}
                            onClick={() => setPendingQty(q)}
                            className={`px-3 py-2 rounded-2xl border text-sm transition-colors ${
                              pendingQty === q
                                ? "bg-green-600 text-white border-green-600"
                                : "bg-white border-green-300 text-green-700 hover:bg-green-50"
                            }`}
                          >
                            {q}{unit}
                          </button>
                        ))}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Custom quantity ({unit})</label>
                        <input
                          type="number"
                          min={1}
                          step={unit === "g" ? 10 : 1}
                          value={pendingQty}
                          onChange={(e) => setPendingQty(Number(e.target.value))}
                          className="w-full px-3 py-2 border border-green-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                        />
                        <p className="mt-1 text-xs text-neutral-500">
                          Tip: {unit === "g" ? `go in multiples of ${base}${unit} for easier adjustments` : "use whole numbers"}
                        </p>
                      </div>
                    </>
                  );
                })()}
              </div>
              <div className="p-4 border-t bg-green-50 sticky bottom-0 rounded-b-3xl">
                <button
                  onClick={confirmQuantity}
                  className="w-full py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-2xl font-medium active:scale-[0.98]"
                >
                  Add to Meal
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart Drawer */}
     {/* Cart Drawer */}
<AnimatePresence>
  {showCart && (
    <motion.div
      className="fixed inset-0 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/40" onClick={() => setShowCart(false)} />
      <motion.div
        role="dialog"
        aria-modal="true"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 220, damping: 26 }}
        className="absolute bottom-0 left-0 right-0 max-w-screen-sm mx-auto bg-white rounded-t-3xl shadow-2xl flex flex-col"
        style={{ maxHeight: "90vh" }}
      >
        <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-white rounded-t-3xl">
          <h3 className="font-semibold">{cartView === "items" ? "Your Cart" : "Checkout"}</h3>
          <button
            className="h-8 w-8 rounded-full grid place-items-center border"
            onClick={() => setShowCart(false)}
            aria-label="Close cart"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="overflow-y-auto" style={{ maxHeight: "calc(90vh - 64px - 148px)" }}>
          {cartView === "items" ? (
            <div className="p-4 space-y-3">
                    {cart.every(meal => Object.keys(meal).length === 0) ? (
                      <p className="text-sm text-neutral-500">Your cart is empty.</p>
                    ) : (
                      cart.map((meal, mealIndex) => (
                        <div key={mealIndex} className="mb-4">
                          <h4 className="text-sm font-medium text-neutral-700">Meal {mealIndex + 1}</h4>
                          {Object.keys(meal).map(catName => {
                            const row = meal[catName];
                            const macros = itemMacros(mealIndex, catName);
                            return (
                              <div key={catName} className="flex gap-3 items-center rounded-2xl border border-green-200 p-3 bg-green-50 mt-2">
                                <img src={row.option.image} alt="" className="h-14 w-14 rounded-xl object-cover" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{row.option.name}</p>
                                  <p className="text-xs text-neutral-500">
                                    {macros.qty}{macros.unit} • {macros.cals} kcal • {macros.p}g P • {macros.c}g C • {macros.f}g F
                                  </p>
                                  <p className="text-xs text-green-700 mt-1 font-medium">₹ {macros.price}</p>
                                </div>
                                <div className="flex items-center gap-2 bg-white rounded-xl px-2 py-1 border border-green-300">
                                  <button
                                    onClick={() => {
                                      const step = categories.find(c => c.name === catName).baseAmount;
                                      if ((row.qty - step) < step) {
                                        setCart(prev => {
                                          const newCart = [...prev];
                                          const { [catName]: _, ...rest } = newCart[mealIndex];
                                          newCart[mealIndex] = rest;
                                          return newCart;
                                        });
                                      } else {
                                        setCart(prev => {
                                          const newCart = [...prev];
                                          const nextQty = Math.max(step, row.qty - step);
                                          newCart[mealIndex] = {
                                            ...newCart[mealIndex],
                                            [catName]: { ...row, qty: nextQty }
                                          };
                                          return newCart;
                                        });
                                      }
                                    }}
                                    className="h-7 w-7 grid place-items-center rounded-lg border border-green-300 hover:bg-red-50 active:scale-95"
                                    aria-label="Decrease"
                                  >
                                    <Minus className="h-4 w-4 text-red-500" />
                                  </button>
                                  <span className="w-14 text-center text-sm font-medium text-green-800">
                                    {row.qty}{categories.find(c => c.name === catName).unit}
                                  </span>
                                  <button
                                    onClick={() => {
                                      const step = categories.find(c => c.name === catName).baseAmount;
                                      setCart(prev => {
                                        const newCart = [...prev];
                                        const nextQty = row.qty + step;
                                        newCart[mealIndex] = {
                                          ...newCart[mealIndex],
                                          [catName]: { ...row, qty: nextQty }
                                        };
                                        return newCart;
                                      });
                                    }}
                                    className="h-7 w-7 grid place-items-center rounded-lg border border-green-300 hover:bg-green-50 active:scale-95"
                                    aria-label="Increase"
                                  >
                                    <Plus className="h-4 w-4 text-green-500" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ))
                    )}
                  </div>
          ) : (
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
                )}
        </div>
        <div className="p-4 border-t bg-green-50 space-y-4 sticky bottom-0 rounded-b-3xl">
          {cartView === "items" ? (
            <>
              <div className="mt-1 flex items-center justify-between">
                <p className="text-base font-semibold">Total • ₹ {totals.price}</p>
                <button onClick={handleConfirmOrder} className="px-4 py-3 rounded-2xl bg-gradient-to-r from-green-600 to-green-700 text-white text-sm font-medium">
                  Proceed to Checkout
                </button>
                <button onClick={() => setShowSubscriptionSetup(true)} className="px-4 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-medium">
                  Save as Subscription
                </button>
              </div>
            </>
          ) : (
            <>
              <button
                onClick={handleConfirmOrder}
                disabled={isPlacingOrder || cart.every(meal => Object.keys(meal).length === 0)}
                className="w-full py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-2xl font-medium active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isPlacingOrder ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Placing Order...
                  </>
                ) : (
                  `Confirm Order • ₹${totals.price}`
                )}
              </button>
              <button
                onClick={() => setCartView("items")}
                className="w-full py-2 text-sm text-green-600 hover:text-green-700"
              >
                ← Back to Cart
              </button>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>

{/* Subscription Modal */}
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
                    ₹{totals.price * option.days}
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
              <p><strong>{1}</strong> meals per day</p>
              <p><strong>₹{totals.price}</strong> per day</p>
              <p><strong>{subscriptionDuration} days</strong> duration</p>
              <p><strong>{subscriptionTimeSlot === '13:00' ? '1:00 PM' : '7:00 PM'}</strong> delivery</p>
              <div className="border-t border-green-200 mt-2 pt-2">
                <p className="font-bold text-lg">Total: ₹{totals.price * subscriptionDuration}</p>
              </div>
            </div>
          </div>

          {/* Confirm Button */}
          <button
            onClick={startSubscription}
            className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-xl font-bold text-lg hover:from-green-700 hover:to-green-800 transition-all"
          >
            Start Subscription - ₹{totals.price * subscriptionDuration}
          </button>
        </div>
      </motion.div>
    </motion.div>
  

)}
</AnimatePresence>



      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
}
