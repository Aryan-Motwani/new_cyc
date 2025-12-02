import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, ChevronDown } from 'lucide-react';

// 30 Popular areas in Chhatrapati Sambhajinagar
const CHHATRAPATI_SAMBHAJINAGAR_AREAS = [
  "CIDCO", "Paithan Road", "Garkheda", "Waluj", "Town Center", "Cannaught Place",
  "Nirala Bazaar", "Shahganj", "Gulmandi", "Osmanpura", "Samarth Nagar", "Jalna Road",
  "Beed Bypass", "Airport Road", "Aurangpura", "Mondha", "Himayat Bagh", "Shah Ganj",
  "Padegaon", "Kranti Chowk", "Medical College", "Jawahar Colony", "Shivaji Nagar",
  "Gandhi Nagar", "Millat Colony", "Rauza Bagh", "Begumpura", "Kanchanwadi",
  "Mukundwadi", "Jinsi"
];

const AddressForm = forwardRef(({ 
  onSubmit, 
  initialAddress = null, 
  title = "Delivery Address",
  buttonText = "Save Address" 
}, ref) => {
  const [formData, setFormData] = useState({
    plotNo: initialAddress?.plotNo || '',
    societyName: initialAddress?.societyName || '',
    area: initialAddress?.area || '',
    landmark: initialAddress?.landmark || ''
  });

  const [areaQuery, setAreaQuery] = useState(initialAddress?.area || '');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredAreas, setFilteredAreas] = useState([]);
  const [errors, setErrors] = useState({});
  
  const areaInputRef = useRef(null);
  const suggestionsRef = useRef(null);

  // **EXPOSE getFullAddress METHOD TO PARENT**
  useImperativeHandle(ref, () => ({
    getFullAddress: () => {
      if (!formData.plotNo.trim() || !formData.societyName.trim() || !formData.area) {
        return null; // Return null if required fields are missing
      }
      
      return {
        plotNo: formData.plotNo.trim(),
        societyName: formData.societyName.trim(),
        area: formData.area,
        landmark: formData.landmark.trim() || null,
        fullAddress: `${formData.plotNo.trim()}, ${formData.societyName.trim()}, ${formData.area}${formData.landmark.trim() ? `, Near ${formData.landmark.trim()}` : ''}, Chhatrapati Sambhajinagar, Maharashtra`
      };
    },
    isValid: () => {
      return formData.plotNo.trim() && formData.societyName.trim() && formData.area && 
             CHHATRAPATI_SAMBHAJINAGAR_AREAS.includes(formData.area);
    }
  }));

  // Filter areas based on user input
  useEffect(() => {
    if (areaQuery.length > 0) {
      const filtered = CHHATRAPATI_SAMBHAJINAGAR_AREAS.filter(area =>
        area.toLowerCase().includes(areaQuery.toLowerCase())
      );
      setFilteredAreas(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setFilteredAreas([]);
      setShowSuggestions(false);
    }
  }, [areaQuery]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        areaInputRef.current && 
        !areaInputRef.current.contains(event.target) &&
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAreaSelect = (selectedArea) => {
    setAreaQuery(selectedArea);
    setFormData(prev => ({ ...prev, area: selectedArea }));
    setShowSuggestions(false);
    setErrors(prev => ({ ...prev, area: '' }));
  };

  const handleAreaInput = (e) => {
    const value = e.target.value;
    setAreaQuery(value);
    
    const exactMatch = CHHATRAPATI_SAMBHAJINAGAR_AREAS.find(
      area => area.toLowerCase() === value.toLowerCase()
    );
    
    if (exactMatch) {
      setFormData(prev => ({ ...prev, area: exactMatch }));
    } else {
      setFormData(prev => ({ ...prev, area: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.plotNo.trim()) {
      newErrors.plotNo = 'Plot/Flat number is required';
    }

    if (!formData.societyName.trim()) {
      newErrors.societyName = 'Society name is required';
    }

    if (!formData.area || !CHHATRAPATI_SAMBHAJINAGAR_AREAS.includes(formData.area)) {
      newErrors.area = 'Please select a valid area from suggestions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      const fullAddress = {
        plotNo: formData.plotNo.trim(),
        societyName: formData.societyName.trim(),
        area: formData.area,
        landmark: formData.landmark.trim() || null,
        fullAddress: `${formData.plotNo.trim()}, ${formData.societyName.trim()}, ${formData.area}${formData.landmark.trim() ? `, Near ${formData.landmark.trim()}` : ''}, Chhatrapati Sambhajinagar, Maharashtra`
      };
      
      onSubmit(fullAddress);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-green-200">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 bg-green-100 rounded-2xl flex items-center justify-center">
          <MapPin className="h-5 w-5 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Plot/Flat Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Plot No / Flat No *
          </label>
          <input
            type="text"
            value={formData.plotNo}
            onChange={(e) => handleInputChange('plotNo', e.target.value)}
            placeholder="e.g., A-101, Plot 15, House 23"
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors ${
              errors.plotNo ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.plotNo && (
            <p className="text-red-500 text-sm mt-1">{errors.plotNo}</p>
          )}
        </div>

        {/* Society Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Society / Building Name *
          </label>
          <input
            type="text"
            value={formData.societyName}
            onChange={(e) => handleInputChange('societyName', e.target.value)}
            placeholder="e.g., Sunflower Society, Green Valley Apartments"
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors ${
              errors.societyName ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.societyName && (
            <p className="text-red-500 text-sm mt-1">{errors.societyName}</p>
          )}
        </div>

        {/* Area with Auto-suggestions */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Area *
          </label>
          <div className="relative" ref={areaInputRef}>
            <input
              type="text"
              value={areaQuery}
              onChange={handleAreaInput}
              onFocus={() => areaQuery.length > 0 && setShowSuggestions(true)}
              placeholder="Start typing area name..."
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors pr-10 ${
                errors.area ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            <ChevronDown className={`absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 transition-transform ${
              showSuggestions ? 'rotate-180' : ''
            }`} />
          </div>

          <AnimatePresence>
            {showSuggestions && filteredAreas.length > 0 && (
              <motion.div
                ref={suggestionsRef}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto"
              >
                {filteredAreas.map((area) => (
                  <button
                    key={area}
                    type="button"
                    onClick={() => handleAreaSelect(area)}
                    className="w-full text-left px-4 py-3 hover:bg-green-50 focus:bg-green-50 transition-colors border-b border-gray-100 last:border-b-0"
                  >
                    <span className="text-gray-900">{area}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {errors.area && (
            <p className="text-red-500 text-sm mt-1">{errors.area}</p>
          )}
        </div>

        {/* Landmark (Optional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Landmark (Optional)
          </label>
          <input
            type="text"
            value={formData.landmark}
            onChange={(e) => handleInputChange('landmark', e.target.value)}
            placeholder="e.g., Near City Mall, Opposite Bank"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
          />
        </div>

        {/* Address Preview */}
        {formData.plotNo && formData.societyName && formData.area && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <p className="text-sm text-gray-600 mb-1">Address Preview:</p>
            <p className="text-sm font-medium text-gray-900">
              {formData.plotNo}, {formData.societyName}, {formData.area}
              {formData.landmark && `, Near ${formData.landmark}`}, 
              Chhatrapati Sambhajinagar, Maharashtra
            </p>
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-xl font-medium hover:from-green-700 hover:to-green-800 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all active:scale-[0.99]"
        >
          {buttonText}
        </button>
      </form>
    </div>
  );
});

AddressForm.displayName = 'AddressForm';
export default AddressForm;
