import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Save, 
  X, 
  AlertCircle, 
  CheckCircle, 
  RefreshCw,
  Search,
  Filter,
  Image,
  Upload
} from "lucide-react";
import { supabase } from '../createClient';

const CATEGORIES = [
  "House Bowl", "Non Veg", "Wraps Around", "House Salad", "House Healthy Diet Shakes & Smoothies"
];

export default function MenuEdit() {
  // State management
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  
  // Form states
  const [formData, setFormData] = useState({
    title: "",
    category: "Wraps",
    description: "",
    img: "",
    calories: "",
    protein: "",
    carbs: "",
    fats: "",
    price: ""
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  
  // Notification state
  const [notifications, setNotifications] = useState([]);

  // Fetch menu items
  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('Food')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setMenuItems(data || []);
    } catch (err) {
      console.error('Error fetching menu items:', err);
      setError('Failed to load menu items');
    } finally {
      setLoading(false);
    }
  };

  // Initialize data
  useEffect(() => {
    fetchMenuItems();
  }, []);

  // Add notification
  const addNotification = (title, message, type = 'success') => {
    const id = Date.now();
    const notification = { id, title, message, type, timestamp: new Date() };
    setNotifications(prev => [notification, ...prev.slice(0, 4)]);
    
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  // Form validation
  const validateForm = (data) => {
    const errors = {};
    
    if (!data.title.trim()) errors.title = 'Title is required';
    if (!data.description.trim()) errors.description = 'Description is required';
    if (!data.img.trim()) errors.img = 'Image URL is required';
    if (!data.calories || data.calories <= 0) errors.calories = 'Valid calories required';
    if (!data.protein || data.protein < 0) errors.protein = 'Valid protein amount required';
    if (!data.carbs || data.carbs < 0) errors.carbs = 'Valid carbs amount required';
    if (!data.fats || data.fats < 0) errors.fats = 'Valid fats amount required';
    if (!data.price || data.price <= 0) errors.price = 'Valid price required';
    
    return errors;
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: "",
      category: "Wraps",
      description: "",
      img: "",
      calories: "",
      protein: "",
      carbs: "",
      fats: "",
      price: ""
    });
    setFormErrors({});
  };

  // Handle add item
  const handleAddItem = async (e) => {
    e.preventDefault();
    
    const errors = validateForm(formData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setFormLoading(true);
    try {
      const { data, error } = await supabase
        .from('Food')
        .insert([{
          ...formData,
          calories: parseInt(formData.calories),
          protein: parseInt(formData.protein),
          carbs: parseInt(formData.carbs),
          fats: parseInt(formData.fats),
          price: parseInt(formData.price)
        }])
        .select();
      
      if (error) throw error;
      
      setMenuItems(prev => [data[0], ...prev]);
      setShowAddModal(false);
      resetForm();
      addNotification('Success!', 'Menu item added successfully', 'success');
      
    } catch (err) {
      console.error('Error adding item:', err);
      addNotification('Error', 'Failed to add menu item', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  // Handle edit item
  const handleEditItem = async (e) => {
    e.preventDefault();
    
    const errors = validateForm(formData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setFormLoading(true);
    try {
      const { data, error } = await supabase
        .from('Food')
        .update({
          ...formData,
          calories: parseInt(formData.calories),
          protein: parseInt(formData.protein),
          carbs: parseInt(formData.carbs),
          fats: parseInt(formData.fats),
          price: parseInt(formData.price)
        })
        .eq('id', selectedItem.id)
        .select();
      
      if (error) throw error;
      
      setMenuItems(prev => 
        prev.map(item => item.id === selectedItem.id ? data[0] : item)
      );
      setShowEditModal(false);
      setSelectedItem(null);
      resetForm();
      addNotification('Success!', 'Menu item updated successfully', 'success');
      
    } catch (err) {
      console.error('Error updating item:', err);
      addNotification('Error', 'Failed to update menu item', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  // Handle delete item
  const handleDeleteItem = async () => {
    setFormLoading(true);
    try {
      const { error } = await supabase
        .from('Food')
        .delete()
        .eq('id', selectedItem.id);
      
      if (error) throw error;
      
      setMenuItems(prev => prev.filter(item => item.id !== selectedItem.id));
      setShowDeleteModal(false);
      setSelectedItem(null);
      addNotification('Deleted', 'Menu item deleted successfully', 'success');
      
    } catch (err) {
      console.error('Error deleting item:', err);
      addNotification('Error', 'Failed to delete menu item', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  // Open edit modal
  const openEditModal = (item) => {
    setSelectedItem(item);
    setFormData({
      title: item.title,
      category: item.category,
      description: item.description,
      img: item.img,
      calories: item.calories.toString(),
      protein: item.protein.toString(),
      carbs: item.carbs.toString(),
      fats: item.fats.toString(),
      price: item.price.toString()
    });
    setShowEditModal(true);
  };

  // Open delete modal
  const openDeleteModal = (item) => {
    setSelectedItem(item);
    setShowDeleteModal(true);
  };

  // Filter items
  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "All" || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      {/* Notifications */}
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: -50, x: 50 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -50, x: 50 }}
            className={`fixed top-4 right-4 z-50 rounded-2xl p-4 shadow-lg max-w-sm border-2 ${
              notification.type === 'error' 
                ? 'bg-red-50 border-red-200' 
                : 'bg-green-50 border-green-200'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`h-8 w-8 rounded-full grid place-items-center ${
                notification.type === 'error' ? 'bg-red-100' : 'bg-green-100'
              }`}>
                {notification.type === 'error' ? (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                ) : (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                )}
              </div>
              <div className="flex-1">
                <p className={`font-semibold text-sm ${
                  notification.type === 'error' ? 'text-red-800' : 'text-green-800'
                }`}>
                  {notification.title}
                </p>
                <p className={`text-xs mt-1 ${
                  notification.type === 'error' ? 'text-red-700' : 'text-green-700'
                }`}>
                  {notification.message}
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
      <header className="sticky top-0 z-30 backdrop-blur bg-white/90 border-b border-neutral-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Menu Management</h1>
              <p className="text-sm text-neutral-600">Manage your food menu items</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchMenuItems}
                disabled={loading}
                className="h-10 w-10 rounded-2xl border border-neutral-300 bg-white grid place-items-center disabled:opacity-50"
              >
                <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-2xl font-medium"
              >
                <Plus className="h-4 w-4" />
                Add Item
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4">
        {/* Search and Filter */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search menu items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-2xl focus:ring-2 focus:ring-black outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-neutral-500" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-neutral-300 rounded-2xl focus:ring-2 focus:ring-black outline-none"
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Items Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
            <p className="text-neutral-600">Loading menu items...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={fetchMenuItems}
              className="px-4 py-2 bg-red-600 text-white rounded-2xl"
            >
              Try Again
            </button>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-neutral-600 mb-4">No menu items found</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-black text-white rounded-2xl"
            >
              Add First Item
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredItems.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white rounded-3xl border border-neutral-200 p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="relative mb-4">
                    <img
                      src={item.img}
                      alt={item.title}
                      className="w-full h-48 rounded-2xl object-cover"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                      }}
                    />
                    <div className="absolute top-2 right-2 flex gap-2">
                      <button
                        onClick={() => openEditModal(item)}
                        className="h-8 w-8 bg-white/90 backdrop-blur rounded-full grid place-items-center shadow-sm"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => openDeleteModal(item)}
                        className="h-8 w-8 bg-red-50 backdrop-blur rounded-full grid place-items-center shadow-sm"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-lg">{item.title}</h3>
                      <span className="text-lg font-bold">₹{item.price}</span>
                    </div>
                    
                    <p className="text-xs text-neutral-500 bg-neutral-100 px-2 py-1 rounded-full w-fit">
                      {item.category}
                    </p>
                    
                    <p className="text-sm text-neutral-600 line-clamp-2">{item.description}</p>
                    
                    <div className="grid grid-cols-4 gap-2 text-xs text-neutral-600">
                      <div className="text-center">
                        <p className="font-semibold">{item.calories}</p>
                        <p>kcal</p>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold">{item.protein}g</p>
                        <p>Protein</p>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold">{item.carbs}g</p>
                        <p>Carbs</p>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold">{item.fats}g</p>
                        <p>Fats</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {(showAddModal || showEditModal) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">
                  {showAddModal ? 'Add New Menu Item' : 'Edit Menu Item'}
                </h2>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                    setSelectedItem(null);
                    resetForm();
                  }}
                  className="h-8 w-8 rounded-full grid place-items-center border"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={showAddModal ? handleAddItem : handleEditItem} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Title</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-2xl focus:ring-2 focus:ring-black outline-none ${
                        formErrors.title ? 'border-red-300' : 'border-neutral-300'
                      }`}
                      placeholder="Enter item title"
                    />
                    {formErrors.title && <p className="text-red-500 text-xs mt-1">{formErrors.title}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-2xl focus:ring-2 focus:ring-black outline-none"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-2xl focus:ring-2 focus:ring-black outline-none resize-none ${
                      formErrors.description ? 'border-red-300' : 'border-neutral-300'
                    }`}
                    placeholder="Enter item description"
                  />
                  {formErrors.description && <p className="text-red-500 text-xs mt-1">{formErrors.description}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Image URL</label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={formData.img}
                      onChange={(e) => setFormData(prev => ({ ...prev, img: e.target.value }))}
                      className={`flex-1 px-3 py-2 border rounded-2xl focus:ring-2 focus:ring-black outline-none ${
                        formErrors.img ? 'border-red-300' : 'border-neutral-300'
                      }`}
                      placeholder="https://example.com/image.jpg"
                    />
                    <button
                      type="button"
                      className="h-10 w-10 border border-neutral-300 rounded-2xl grid place-items-center"
                    >
                      <Upload className="h-4 w-4" />
                    </button>
                  </div>
                  {formErrors.img && <p className="text-red-500 text-xs mt-1">{formErrors.img}</p>}
                  {formData.img && (
                    <img
                      src={formData.img}
                      alt="Preview"
                      className="mt-2 h-20 w-20 rounded-xl object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Calories</label>
                    <input
                      type="number"
                      value={formData.calories}
                      onChange={(e) => setFormData(prev => ({ ...prev, calories: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-2xl focus:ring-2 focus:ring-black outline-none ${
                        formErrors.calories ? 'border-red-300' : 'border-neutral-300'
                      }`}
                      placeholder="420"
                    />
                    {formErrors.calories && <p className="text-red-500 text-xs mt-1">{formErrors.calories}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Protein (g)</label>
                    <input
                      type="number"
                      value={formData.protein}
                      onChange={(e) => setFormData(prev => ({ ...prev, protein: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-2xl focus:ring-2 focus:ring-black outline-none ${
                        formErrors.protein ? 'border-red-300' : 'border-neutral-300'
                      }`}
                      placeholder="25"
                    />
                    {formErrors.protein && <p className="text-red-500 text-xs mt-1">{formErrors.protein}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Carbs (g)</label>
                    <input
                      type="number"
                      value={formData.carbs}
                      onChange={(e) => setFormData(prev => ({ ...prev, carbs: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-2xl focus:ring-2 focus:ring-black outline-none ${
                        formErrors.carbs ? 'border-red-300' : 'border-neutral-300'
                      }`}
                      placeholder="45"
                    />
                    {formErrors.carbs && <p className="text-red-500 text-xs mt-1">{formErrors.carbs}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Fats (g)</label>
                    <input
                      type="number"
                      value={formData.fats}
                      onChange={(e) => setFormData(prev => ({ ...prev, fats: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-2xl focus:ring-2 focus:ring-black outline-none ${
                        formErrors.fats ? 'border-red-300' : 'border-neutral-300'
                      }`}
                      placeholder="15"
                    />
                    {formErrors.fats && <p className="text-red-500 text-xs mt-1">{formErrors.fats}</p>}
                  </div>
                </div>

                <div className="md:w-1/2">
                  <label className="block text-sm font-medium mb-1">Price (₹)</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-2xl focus:ring-2 focus:ring-black outline-none ${
                      formErrors.price ? 'border-red-300' : 'border-neutral-300'
                    }`}
                    placeholder="299"
                  />
                  {formErrors.price && <p className="text-red-500 text-xs mt-1">{formErrors.price}</p>}
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-2xl font-medium disabled:opacity-50"
                  >
                    {formLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        {showAddModal ? 'Adding...' : 'Updating...'}
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        {showAddModal ? 'Add Item' : 'Update Item'}
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setShowEditModal(false);
                      setSelectedItem(null);
                      resetForm();
                    }}
                    className="px-6 py-3 border border-neutral-300 rounded-2xl font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-3xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="h-16 w-16 bg-red-100 rounded-full grid place-items-center mx-auto mb-4">
                  <Trash2 className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Delete Menu Item</h3>
                <p className="text-neutral-600 mb-2">
                  Are you sure you want to delete "{selectedItem.title}"?
                </p>
                <p className="text-sm text-red-600 mb-6">
                  This action cannot be undone.
                </p>
                
                <div className="flex gap-3">
                  <button
                    onClick={handleDeleteItem}
                    disabled={formLoading}
                    className="flex-1 py-3 bg-red-600 text-white rounded-2xl font-medium disabled:opacity-50"
                  >
                    {formLoading ? 'Deleting...' : 'Delete'}
                  </button>
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setSelectedItem(null);
                    }}
                    className="flex-1 py-3 border border-neutral-300 rounded-2xl font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
