import React, { useMemo } from "react";
import { ShoppingCart, Plus, Minus, X, ChevronDown, Search } from "lucide-react";
// import MENU from "./menuData"; // 👈 export your MENU from a separate file if needed
import { MENU } from "./menuData";   // ✅ named import, not default


export default function CartPage({ cart, setCart, setPage }) {
  const cartList = MENU.filter((i) => cart[i.id] > 0);

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

  return (
    <div className="max-w-screen-sm mx-auto p-4">
      <h2 className="text-xl font-semibold mb-4">Your Cart</h2>

      {cartList.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          {cartList.map((item) => (
            <div key={item.id} className="flex items-center gap-3 border-b py-2">
              <img src={item.img} alt={item.title} className="h-16 w-16 rounded-xl object-cover" />
              <div className="flex-1">
                <p className="font-medium">{item.title}</p>
                <p className="text-sm text-neutral-500">₹ {item.price} × {cart[item.id]}</p>
              </div>
              <p className="font-semibold">₹ {item.price * cart[item.id]}</p>
            </div>
          ))}

          <div className="mt-4 p-4 rounded-xl bg-gray-100">
            <p><strong>Total Calories:</strong> {totals.calories} kcal</p>
            <p><strong>Protein:</strong> {totals.protein} g</p>
            <p><strong>Carbs:</strong> {totals.carbs} g</p>
            <p><strong>Fats:</strong> {totals.fats} g</p>
            <p className="mt-2 text-lg font-bold">Grand Total: ₹ {totals.price}</p>
          </div>

          <div className="mt-4">
            <input 
              placeholder="Coupon Code"
              className="w-full px-3 py-2 border rounded-lg mb-3"
            />
            <button className="w-full bg-black text-white py-3 rounded-lg">
              Proceed to Payment
            </button>
          </div>
        </>
      )}

      <button onClick={() => setPage("menu")} className="mt-4 underline text-sm">
        ← Back to Menu
      </button>
    </div>
  );
}
