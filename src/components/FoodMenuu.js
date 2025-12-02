import React, { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Plus, Minus, X, ChevronDown, Search } from "lucide-react";

// --- Sample Menu Data ---
const MENU = [
  {
    id: "m1",
    title: "Peri-Peri Paneer Wrap",
    img: "https://picsum.photos/seed/paneer/200",
    category: "Wraps",
    description:
      "Smoky peri-peri paneer, crunchy lettuce, onions, and mint mayo wrapped in a whole wheat tortilla.",
    calories: 420,
    protein: 22,
    carbs: 48,
    fats: 16,
    price: 249,
  },
  {
    id: "m2",
    title: "Classic Chicken Bowl",
    img: "https://picsum.photos/seed/chicken/200",
    category: "Bowls",
    description:
      "Grilled chicken on herbed brown rice with roasted veggies and tangy house sauce.",
    calories: 520,
    protein: 36,
    carbs: 55,
    fats: 18,
    price: 329,
  },
  {
    id: "m3",
    title: "Veggie Buddha Bowl",
    img: "https://picsum.photos/seed/vegbowl/200",
    category: "Bowls",
    description:
      "Quinoa, chickpeas, avocado, cherry tomato, cucumber, and tahini drizzle.",
    calories: 460,
    protein: 17,
    carbs: 62,
    fats: 14,
    price: 299,
  },
  {
    id: "m4",
    title: "Margherita Square",
    img: "https://picsum.photos/seed/pizza/200",
    category: "Pizzas",
    description:
      "Crispy square pizza with San Marzano tomato, fresh mozzarella, and basil.",
    calories: 610,
    protein: 24,
    carbs: 72,
    fats: 22,
    price: 349,
  },
  {
    id: "m5",
    title: "Grilled Salmon Box",
    img: "https://picsum.photos/seed/salmon/200",
    category: "Mains",
    description:
      "Teriyaki glazed salmon, jasmine rice, sautéed greens, sesame seeds.",
    calories: 540,
    protein: 34,
    carbs: 50,
    fats: 20,
    price: 459,
  },
  {
    id: "m6",
    title: "Protein Pancake Bites",
    img: "https://picsum.photos/seed/pancake/200",
    category: "Snacks",
    description:
      "Mini oat pancakes with whey, maple dip on the side.",
    calories: 300,
    protein: 19,
    carbs: 42,
    fats: 7,
    price: 179,
  },
  {
    id: "m7",
    title: "Hummus & Pita",
    img: "https://picsum.photos/seed/hummus/200",
    category: "Snacks",
    description:
      "Creamy hummus, paprika oil, warm pita triangles.",
    calories: 380,
    protein: 12,
    carbs: 46,
    fats: 14,
    price: 159,
  },
  {
    id: "m8",
    title: "Cold Coffee (No Sugar)",
    img: "https://picsum.photos/seed/coffee/200",
    category: "Drinks",
    description:
      "Slow-brewed coffee shaken with milk and ice. Unsweetened by default.",
    calories: 90,
    protein: 6,
    carbs: 8,
    fats: 3,
    price: 129,
  },
];

const CATEGORIES = ["All", ...Array.from(new Set(MENU.map((m) => m.category)))];

export default function FoodOrderingApp() {
  const [step, setStep] = useState("menu"); // 'info' | 'menu'
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState({}); // id -> qty
  const [showCart, setShowCart] = useState(false);
  const [descOpen, setDescOpen] = useState({}); // id -> bool
  const [cartView, setCartView] = useState("items"); // "items" | "checkout"


  // Prevent double-tap zoom on mobile & set viewport
  useEffect(() => {
    const meta = document.querySelector('meta[name="viewport"]');
    if (meta) {
      meta.setAttribute(
        "content",
        "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
      );
    } else {
      const m = document.createElement("meta");
      m.name = "viewport";
      m.content =
        "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover";
      document.head.appendChild(m);
    }
    document.body.style.touchAction = "manipulation";
  }, []);

  const itemsFiltered = useMemo(() => {
    const byCategory = category === "All" ? MENU : MENU.filter((i) => i.category === category);
    if (!query.trim()) return byCategory;
    const q = query.toLowerCase();
    return byCategory.filter(
      (i) =>
        i.title.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q)
    );
  }, [category, query]);

  const cartList = useMemo(() => MENU.filter((i) => cart[i.id] > 0), [cart]);

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
  const decrement = (id) =>
    setCart((c) => {
      const next = { ...c, [id]: Math.max((c[id] || 0) - 1, 0) };
      if (next[id] === 0) delete next[id];
      return next;
    });

  const canContinue = name.trim().length >= 2 && /^\+?\d{8,15}$/.test(phone.replace(/\s/g, ""));

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 selection:bg-black selection:text-white">
      {/* Header */}
      <header className="sticky top-0 z-30 backdrop-blur bg-white/70 border-b border-neutral-200">
        <div className="max-w-screen-sm mx-auto px-4 py-3 flex items-center gap-3">
          <div className="h-9 w-9 rounded-2xl bg-black text-white grid place-items-center font-bold">CY</div>
          <div className="flex-1">
            <h1 className="text-lg font-semibold leading-tight">CountYourCalorie</h1>
            <p className="text-xs text-neutral-500">Healthy, tasty & fast</p>
          </div>
          <button
            className="relative"
            onClick={() => setShowCart(true)}
            aria-label="Open cart"
          >
            <ShoppingCart className="h-6 w-6" />
            {totals.items > 0 && (
              <span className="absolute -top-1 -right-1 h-5 min-w-5 px-1 rounded-full bg-black text-white text-xs grid place-items-center">
                {totals.items}
              </span>
            )}
          </button>
        </div>
      </header>

      <main className="max-w-screen-sm mx-auto pb-28">
        {/* Step 1: Info */}
        <AnimatePresence mode="wait">
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
                    <span className="text-[11px] text-neutral-500">We’ll contact you about your order if needed.</span>
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
              {/* Greeting & Search */}
              <div className="px-4 pt-4">
                <h2 className="text-lg font-semibold">Hey {name.split(" ")[0] || "there"} 👋</h2>
                <p className="text-sm text-neutral-600">What are you craving today?</p>

                <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-2xl border bg-white">
                  <Search className="h-5 w-5" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search dishes, categories..."
                    className="flex-1 outline-none bg-transparent text-sm"
                  />
                </div>
              </div>

              {/* Categories */}
              {/* <div className="px-4 mt-4 overflow-x-auto no-scrollbar">
                <div className="flex gap-2 w-max">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`px-3 py-2 rounded-2xl border text-sm whitespace-nowrap transition active:scale-[0.98] ${
                        category === cat ? "bg-black text-white border-black" : "bg-white border-neutral-300"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div> */}

              {/* Categories Row */}
<div className="px-4 mt-4 overflow-x-auto no-scrollbar">
  <div className="flex gap-4 w-max">
    {CATEGORIES.map((cat) => (
      <button
        key={cat}
        onClick={() => setCategory(cat)}
        className={`flex flex-col items-center text-sm ${
          category === cat ? "text-black font-semibold" : "text-neutral-500"
        }`}
      >
        <div className={`h-12 w-12 rounded-full flex items-center justify-center border ${
          category === cat ? "border-black bg-black text-white" : "border-neutral-300"
        }`}>
          🍴
        </div>
        <span className="mt-1">{cat}</span>
      </button>
    ))}
  </div>
</div>

{/* Filters Row */}
<div className="px-4 mt-3 flex gap-2 overflow-x-auto no-scrollbar">
  {["Under 30 mins", "New to you", "Great Offers"].map((f) => (
    <button
      key={f}
      className="px-4 py-2 rounded-full border border-neutral-300 bg-white text-sm whitespace-nowrap"
    >
      {f}
    </button>
  ))}
</div>

{/* Recommended Section */}
<div className="mt-6 px-4">
  <h3 className="text-base font-semibold mb-3">Recommended for you</h3>
  <div className="flex gap-3 overflow-x-auto no-scrollbar">
    {MENU.slice(0, 5).map((item) => (
      <div
        key={item.id}
        className="min-w-[160px] bg-white rounded-2xl border shadow-sm overflow-hidden"
      >
        <img src={item.img} alt={item.title} className="h-28 w-full object-cover" />
        <div className="p-2">
          <h4 className="font-medium text-sm truncate">{item.title}</h4>
          <p className="text-xs text-neutral-500">{item.category}</p>
          <p className="text-sm font-semibold mt-1">₹ {item.price}</p>
        </div>
      </div>
    ))}
  </div>
</div>


            </motion.section>
          )}
        </AnimatePresence>
      </main>

      {/* Sticky Cart Bar */}
      <AnimatePresence>
        {totals.items > 0 && (
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
      {/* Background overlay */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => setShowCart(false)}
      />

      {/* Drawer */}
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
        {/* Header */}
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

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Items */}
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

          {/* Totals / Checkout */}
          <div className="p-4 border-t bg-neutral-50 space-y-4">
            {cartView === "items" ? (
              <>
                {/* Nutrition */}
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

                {/* Total + Proceed */}
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
                {/* Checkout Page */}
                <div className="space-y-5 text-sm">
                  {/* Address Selector */}
                  <div>
                    <label className="block font-medium text-neutral-700 mb-1">Delivery Address</label>
                    <select className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-black outline-none">
                      <option>Home - 123 Street, City</option>
                      <option>Office - 456 Avenue, City</option>
                      <option>Add new address...</option>
                    </select>
                  </div>

                  {/* Coupon */}
                  <div>
                    <label className="block font-medium text-neutral-700 mb-1">Coupon Code</label>
                    <input
                      type="text"
                      placeholder="Enter coupon"
                      className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-black outline-none"
                    />
                  </div>

                  {/* Delivery */}
                  <div>
                    <p className="font-medium text-neutral-700 mb-1">Delivery</p>
                    <div className="flex gap-3">
                      <label className="flex items-center gap-2">
                        <input type="radio" name="delivery" defaultChecked /> Pickup
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="radio" name="delivery" /> Home Delivery
                      </label>
                    </div>
                  </div>

                  {/* Payment */}
                  <div>
                    <p className="font-medium text-neutral-700 mb-1">Payment</p>
                    <div className="flex flex-col gap-2">
                      <label className="flex items-center gap-2">
                        <input type="radio" name="payment" defaultChecked /> UPI
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="radio" name="payment" /> Card
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="radio" name="payment" /> Cash on Delivery
                      </label>
                    </div>
                  </div>

                  {/* Price Summary */}
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

                  {/* Confirm */}
                  <button className="w-full py-3 bg-black text-white rounded-2xl font-medium active:scale-[0.98]">
                    Confirm Order
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


      {/* Safe area bottom padding for mobile */}
      <div className="h-6" />
    </div>
  );
}

function QtyControl({ qty, onInc, onDec }) {
  return (
    <div className="flex items-center gap-2 bg-neutral-100 rounded-xl px-2 py-1">
      <button
        onClick={onDec}
        className="h-7 w-7 grid place-items-center rounded-lg border border-neutral-300 active:scale-95"
        aria-label="Decrease"
      >
        <Minus className="h-4 w-4" />
      </button>
      <span className="w-6 text-center text-sm font-medium">{qty}</span>
      <button
        onClick={onInc}
        className="h-7 w-7 grid place-items-center rounded-lg border border-neutral-300 active:scale-95"
        aria-label="Increase"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}

// Small helper to hide horizontal scrollbar visuals on category row
const style = document.createElement("style");
style.textContent = `
  .no-scrollbar::-webkit-scrollbar { display: none; }
  .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
`;
document.head.appendChild(style);
