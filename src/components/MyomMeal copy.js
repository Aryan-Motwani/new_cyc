import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus } from "lucide-react";
import AddressForm from './AddressForm';

const categories = [
  {
    name: "Protein",
    title: "Select a main protein",
    unit: "g",
    baseAmount: 100,
    options: [
      { id: 1, name: "Low fat grilled cottage cheese steak", calories: 77, protein: 20, carbs: 10, fat: 15, image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSojq2zBshtsAXKS1QwI9zrVvlIFMTpN-tcYw&s", price: 130 },
      { id: 2, name: "Soya chunks/beans", calories: 90, protein: 7, carbs: 0, fat: 5, image: "https://foodfolksandfun.net/wp-content/uploads/2021/06/Best-Way-To-Grill-Chicken-Breasts.jpg", price: 80 },
      { id: 3, name: "Grilled tofu edemame", calories: 77, protein: 20, carbs: 10, fat: 15, image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSojq2zBshtsAXKS1QwI9zrVvlIFMTpN-tcYw&s", price: 140 },
    ],
  },
  {
    name: "Carbs",
    title: "Select Carbs",
    unit: "g",
    baseAmount: 50,
    options: [
      { id: 4, name: "Steamed white rice", calories: 130, protein: 1, carbs: 10, fat: 0, image: "https://thescattymum.com/wp-content/uploads/2023/05/how-to-make-carrot-sticks-1200.jpg", price: 80 },
      { id: 5, name: "Steamed brown rice", calories: 109, protein: 2, carbs: 9, fat: 15, image: "https://www.yummymummykitchen.com/wp-content/uploads/2021/01/how-to-cut-avocado-03-720x540.jpg", price: 90 },
      { id: 6, name: "Soya noodles", calories: 115, protein: 1, carbs: 9, fat: 0, image: "https://www.shutterstock.com/image-photo/falling-sliced-red-hot-chili-600nw-2176842815.jpg", price: 230 },
      { id: 7, name: "Soba noodles", calories: 99, protein: 1, carbs: 9, fat: 0, image: "https://www.shutterstock.com/image-photo/falling-sliced-red-hot-chili-600nw-2176842815.jpg", price: 250 },
      { id: 8, name: "Quinoa", calories: 120, protein: 1, carbs: 9, fat: 0, image: "https://www.shutterstock.com/image-photo/falling-sliced-red-hot-chili-600nw-2176842815.jpg", price: 150 },
      { id: 9, name: "Whole wheat pasta", calories: 124, protein: 1, carbs: 9, fat: 0, image: "https://www.shutterstock.com/image-photo/falling-sliced-red-hot-chili-600nw-2176842815.jpg", price: 160 },
      { id: 10, name: "Shirataki Noodles", calories: 119, protein: 1, carbs: 9, fat: 0, image: "https://www.shutterstock.com/image-photo/falling-sliced-red-hot-chili-600nw-2176842815.jpg", price: 150 },
    ],
  },
  {
    name: "GRAVIES / SAUCES",
    title: "Select a sauce",
    unit: "tsp",
    baseAmount: 1,
    options: [
      { id: 11, name: "Makhni", calories: 141, protein: 7, carbs: 2.5, fat: 11, image: "https://easyfamilyrecipes.com/wp-content/uploads/2021/02/Homemade-BBQ-Sauce-Recipe.jpg", price: 80 },
      { id: 12, name: "Tomato basil sauce", calories: 79, protein: 13, carbs: 1.8, fat: 2.5, image: "https://www.thebutterhalf.com/wp-content/uploads/2023/02/Chili-Sauce-6-500x500.jpg", price: 80 },
      { id: 13, name: "Chilli garlic gravy", calories: 139, protein: 14, carbs: 3, fat: 9, image: "https://www.thebutterhalf.com/wp-content/uploads/2023/02/Chili-Sauce-6-500x500.jpg", price: 80 },
      { id: 14, name: "Palak gravy", calories: 152, protein: 10, carbs: 4.5, fat: 11, image: "https://www.thebutterhalf.com/wp-content/uploads/2023/02/Chili-Sauce-6-500x500.jpg", price: 80 },
    ],
  },
  {
    name: "Extras",
    title: "Select extras",
    unit: "",
    baseAmount: 1,
    options: [
      { id: 19, name: "Egg", calories: 70, protein: 6, carbs: 1, fat: 5, image: "https://www.foodtasticmom.com/wp-content/uploads/2016/10/easyeggs-feature.jpg", price: 80 },
      { id: 20, name: "Cheese Slice", calories: 110, protein: 7, carbs: 1, fat: 9, image: "https://superbutcher.com.au/cdn/shop/files/62172-1-1540_1080x.jpg?v=1708927106", price: 80 },
    ],
  },
  {
    name: "Fiber",
    title: "Select Fiber",
    unit: "",
    baseAmount: 1,
    options: [
      { id: 21, name: "Egg", calories: 70, protein: 6, carbs: 1, fat: 5, image: "https://www.foodtasticmom.com/wp-content/uploads/2016/10/easyeggs-feature.jpg", price: 80 },
      { id: 22, name: "Cheese Slice", calories: 110, protein: 7, carbs: 1, fat: 9, image: "https://superbutcher.com.au/cdn/shop/files/62172-1-1540_1080x.jpg?v=1708927106", price: 80 },
    ],
  },
];

export default function MyomMeal({ onBack, setPage, user, supabase }) {
  const [currentCategory, setCurrentCategory] = useState(0);
  const [cart, setCart] = useState({});
  const [showCart, setShowCart] = useState(false);
  const [cartView, setCartView] = useState("items");
  const [showQty, setShowQty] = useState(false);
  const [pendingPick, setPendingPick] = useState(null);
  const [pendingQty, setPendingQty] = useState(0);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);

  const addNotification = (title, message, type = 'success') => {
    const id = Date.now();
    const newNotification = { id, title, message, type };
    setNotifications(prev => [...prev, newNotification]);
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 4000);
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
    setCart(prev => ({
      ...prev,
      [cat.name]: { option, qty: qtyClean }
    }));
    setShowQty(false);
    setPendingPick(null);
    if (categoryIndex < categories.length - 1) {
      setTimeout(() => setCurrentCategory(categoryIndex + 1), 200);
    }
  };

  const adjustCartQty = (catName, deltaSign) => {
    setCart(prev => {
      const row = prev[catName];
      if (!row) return prev;
      const cat = categories.find(c => c.name === catName);
      const step = cat.baseAmount;
      const nextQty = Math.max(step, (row.qty || step) + deltaSign * step);
      return { ...prev, [catName]: { ...row, qty: nextQty } };
    });
  };

  const removeFromCart = (catName) => {
    setCart(prev => {
      const { [catName]: _, ...rest } = prev;
      return rest;
    });
  };

  const totals = useMemo(() => {
    let calories = 0, protein = 0, carbs = 0, fat = 0, price = 0;
    for (const cat of categories) {
      const row = cart[cat.name];
      if (!row) continue;
      const { option, qty } = row;
      const factor = qty / cat.baseAmount;
      calories += option.calories * factor;
      protein += option.protein * factor;
      carbs += option.carbs * factor;
      fat += option.fat * factor;
      price += option.price * factor; // Use item's own price
    }
    return {
      calories: Math.round(calories),
      protein: Math.round(protein),
      carbs: Math.round(carbs),
      fats: Math.round(fat),
      price: Math.round(price),
      items: Object.keys(cart).length
    };
  }, [cart]);

  const itemMacros = (catName) => {
    const cat = categories.find(c => c.name === catName);
    const row = cart[catName];
    if (!row) return { cals:0, p:0, c:0, f:0, price:0, qty:0, unit:cat.unit };
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
    if (Object.keys(cart).length === 0) {
      addNotification("Error", "Your cart is empty", "error");
      return;
    }
    setIsPlacingOrder(true);
    try {
      const orderItems = categories
        .filter(cat => cart[cat.name])
        .map(cat => {
          const row = cart[cat.name];
          const macros = itemMacros(cat.name);
          return {
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
          };
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
      setCart({});
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

        {/* Mobile-friendly horizontal category navigation */}
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
              {cat.name}
            </button>
          ))}
        </div>

        <h2 className="text-lg font-semibold text-center mb-3">
          {categories[currentCategory].title}
        </h2>

        {/* Vertical scroll + 2 items per row */}
<div className="grid grid-cols-2 gap-4 overflow-y-auto max-h-[420px] pr-2 no-scrollbar">
  {categories[currentCategory].options.map((opt) => {
    const cat = categories[currentCategory];
    const isSelected = cart[cat.name]?.option?.id === opt.id;
    const row = cart[cat.name];
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
                    {Object.keys(cart).length === 0 ? (
                      <p className="text-sm text-neutral-500">Your cart is empty.</p>
                    ) : (
                      categories.map(cat => {
                        const row = cart[cat.name];
                        if (!row) return null;
                        const macros = itemMacros(cat.name);
                        return (
                          <div key={cat.name} className="flex gap-3 items-center rounded-2xl border border-green-200 p-3 bg-green-50">
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
                                  const step = cat.baseAmount;
                                  if ((row.qty - step) < step) return removeFromCart(cat.name);
                                  adjustCartQty(cat.name, -1);
                                }}
                                className="h-7 w-7 grid place-items-center rounded-lg border border-green-300 hover:bg-red-50 active:scale-95"
                                aria-label="Decrease"
                              >
                                <Minus className="h-4 w-4 text-red-500" />
                              </button>
                              <span className="w-14 text-center text-sm font-medium text-green-800">
                                {row.qty}{cat.unit}
                              </span>
                              <button
                                onClick={() => adjustCartQty(cat.name, 1)}
                                className="h-7 w-7 grid place-items-center rounded-lg border border-green-300 hover:bg-green-50 active:scale-95"
                                aria-label="Increase"
                              >
                                <Plus className="h-4 w-4 text-green-500" />
                              </button>
                            </div>
                          </div>
                        );
                      })
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
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="rounded-2xl bg-white border border-green-200 p-3">
                        <p className="text-xs text-green-600">Calories</p>
                        <p className="text-lg font-semibold text-green-800">{totals.calories} kcal</p>
                      </div>
                      <div className="rounded-2xl bg-white border border-green-200 p-3">
                        <p className="text-xs text-green-600">Protein</p>
                        <p className="text-lg font-semibold text-green-800">{totals.protein} g</p>
                      </div>
                      <div className="rounded-2xl bg-white border border-green-200 p-3">
                        <p className="text-xs text-green-600">Carbs</p>
                        <p className="text-lg font-semibold text-green-800">{totals.carbs} g</p>
                      </div>
                      <div className="rounded-2xl bg-white border border-green-200 p-3">
                        <p className="text-xs text-green-600">Fats</p>
                        <p className="text-lg font-semibold text-green-800">{totals.fats} g</p>
                      </div>
                    </div>
                    <div className="mt-1 flex items-center justify-between">
                      <p className="text-base font-semibold">Total • ₹ {totals.price}</p>
                      <button
                        disabled={totals.items === 0}
                        onClick={() => setCartView("checkout")}
                        className="px-4 py-3 rounded-2xl bg-gradient-to-r from-green-600 to-green-700 text-white text-sm font-medium active:scale-[0.99] disabled:opacity-50"
                      >
                        Proceed to Checkout
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleConfirmOrder}
                      disabled={isPlacingOrder || Object.keys(cart).length === 0}
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
                          }}
                          initialAddress={selectedAddress}
                        />
                      </motion.div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
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
