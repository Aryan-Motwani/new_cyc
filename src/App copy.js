import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import FoodMenu from "./components/FoodMenu.js";
import MyomMeal from "./components/MyomMeal.js";

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [page, setPage] = useState("menu");

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false); // hide splash after 3s (1s fade + 2s display)
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <AnimatePresence>
        {showSplash && (
          <motion.div
            key="splash"
            className="flex items-center justify-center h-screen bg-white"
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
        <>
          {page === "menu" && <FoodMenu setPage={setPage} />}
          {page === "myom" && <MyomMeal />}
        </>
      )}
    </div>
  );
}

export default App;
