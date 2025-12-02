import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from "./components/firebase"; // Import your Firebase auth
import FoodMenu from "./components/FoodMenu.js";
import MyomMeal from "./components/MyomMeal.js";
import OrdersPage from "./components/Orders.js";
import MenuEdit from "./components/MenuEdit.js";
import { supabase } from "./createClient"; // Import supabase

// Internal router for setPage-based navigation
function InternalPages({ page, setPage, user, setUser }) {
  switch (page) {
    case "menu":
      return <FoodMenu setPage={setPage} user={user} setUser={setUser} supabase={supabase} />;
    case "myom":
      return <MyomMeal onBack={() => setPage("menu")} setPage={setPage} user={user} supabase={supabase} />;
    default:
      return <Navigate to="/" replace />;
  }
}

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [page, setPage] = useState("menu");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Firebase Auth State Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const userData = {
          id: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
          phone: firebaseUser.phoneNumber || null
        };
        setUser(userData);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 30);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Router>
        <AnimatePresence>
          {showSplash && (
            <motion.div
              key="splash"
              className="flex items-center justify-center h-screen bg-white fixed inset-0 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <img
                src="https://raw.githubusercontent.com/Aryan-Motwani/food/refs/heads/main/WhatsApp%20Image%20sdsd-modified.png"
                alt="Logo"
                className="w-80 h-80 object-contain"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {!showSplash && (
          <Routes>
            <Route path="/admin" element={<MenuEdit setPage={setPage} />} />
            <Route path="/orders" element={<OrdersPage setPage={setPage} />} />
            <Route 
              path="/*" 
              element={<InternalPages page={page} setPage={setPage} user={user} setUser={setUser} />} 
            />
          </Routes>
        )}
      </Router>
    </div>
  );
}

export default App;
