import { X, Star, Sparkles, Clock, Tag, Box, Scale, Shield, ChevronDown } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { NutritionFacts } from '../product/NutritionFacts';
import { IngredientAnalysis } from '../product/ingredient-analysis';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";

function HealthRating({ product }) {
  const rating = product.healthRating || 3;

  const getNutriScoreColor = (grade) => {
    switch (grade?.toLowerCase()) {
      case 'a': return 'bg-green-600';
      case 'b': return 'bg-green-400';
      case 'c': return 'bg-yellow-400';
      case 'd': return 'bg-orange-400';
      case 'e': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="flex flex-col gap-2 mb-4">
      <div className="flex items-center gap-4">
        {/* Nutri-Score Badge */}
        {product.nutriscore_grade && (
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full ${getNutriScoreColor(product.nutriscore_grade)} 
              text-white font-bold flex items-center justify-center uppercase`}>
              {product.nutriscore_grade}
            </div>
            <span className="text-sm font-medium">Nutri-Score</span>
          </div>
        )}

        {/* Star Rating */}
        <div className="flex items-center gap-2">
          <Star className={`h-6 w-6 ${rating >= 4 ? 'fill-yellow-400 text-yellow-400' : 
            rating >= 3 ? 'fill-green-400 text-green-400' : 
            'fill-orange-400 text-orange-400'}`} />
          <span className="font-medium">{rating.toFixed(1)}</span>/5.0<br />
          <span className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 
            px-2 py-1 rounded text-sm">Health Rating</span>
        </div>
      </div>

      {/* Rating Description */}
      <p className="text-sm text-gray-600 dark:text-gray-400">
        {rating >= 4 ? 'Excellent nutritional value' :
         rating >= 3 ? 'Good nutritional value' :
         rating >= 2 ? 'Average nutritional value' :
         'Poor nutritional value'}
      </p>
    </div>
  );
}

export default function ProductDetailsModal({ product, onClose }) {
  const [isClosing, setIsClosing] = useState(false);
  const [expandedSection, setExpandedSection] = useState("details");

  const handleClose = useCallback(() => {
    setIsClosing(true);
    const timer = setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300);
    return () => clearTimeout(timer);
  }, [onClose]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [handleClose]);

  // Prevent scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  if (!product) return null;

  const getImageUrl = (product) => {
    return product.image_url || product.imageUrl || '/placeholder.png';
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 300
      }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: 20,
      transition: {
        duration: 0.2
      }
    }
  };

  const sectionVariants = {
    collapsed: { height: 0, opacity: 0 },
    expanded: { height: "auto", opacity: 1 }
  };

  return (
    <AnimatePresence>
      {!isClosing && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={handleClose}
          aria-modal="true"
          role="dialog"
        >
          <motion.div 
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-white dark:bg-gray-900 rounded-2xl w-11/12 max-w-4xl max-h-[90vh] 
              flex flex-col overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-800"
            onClick={e => e.stopPropagation()}
          >
            {/* Header - Sticky */}
            <div className="sticky top-0 bg-white/95 dark:bg-gray-900/95 border-b 
              border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between
              backdrop-blur-md z-10">
              <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-primary-foreground 
                  bg-clip-text text-transparent">Product Details</h2>
              </div>
              <button 
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full 
                  transition-all duration-200 hover:rotate-90"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto">
              <div className="divide-y divide-gray-200 dark:divide-gray-800">
                {/* Product Overview */}
                <div className="p-6">
                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Left Column - Image and Health Rating */}
                    <div className="space-y-6">
                      <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br 
                          from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900
                          p-6 relative group"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent 
                          opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <img
                          src={getImageUrl(product)}
                          alt={product.product_name || product.name}
                          className="w-full h-full object-contain transition-transform duration-300
                            group-hover:scale-105"
                          onError={(e) => {
                            e.target.src = '/placeholder.png';
                            e.target.onerror = null;
                          }}
                        />
                      </motion.div>
                      
                      <HealthRating product={product} />
                    </div>

                    {/* Right Column - Product Details */}
                    <div className="space-y-6">
                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        <h3 className="text-2xl font-bold mb-2 leading-tight">
                          {product.product_name || product.name}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                          <Tag className="w-4 h-4" />
                          {product.brands || product.brand || 'N/A'}
                        </p>
                      </motion.div>

                      <motion.div 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="grid grid-cols-2 gap-4"
                      >
                        <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 space-y-2">
                          <div className="flex items-center gap-2 text-primary">
                            <Box className="w-4 h-4" />
                            <span className="text-sm font-medium">Product Code</span>
                          </div>
                          <p className="text-sm">
                            {product.barcode || product.code || 'N/A'}
                          </p>
                        </div>
                        {product.category && (
                          <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 space-y-2">
                            <div className="flex items-center gap-2 text-primary">
                              <Tag className="w-4 h-4" />
                              <span className="text-sm font-medium">Category</span>
                            </div>
                            <p className="text-sm">{product.category}</p>
                          </div>
                        )}
                      </motion.div>

                      {product.ingredients && (
                        <motion.div
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.5 }}
                          className="rounded-xl border border-gray-200 dark:border-gray-800 p-4"
                        >
                          <div className="flex items-center gap-2 mb-2 text-primary">
                            <Scale className="w-4 h-4" />
                            <h4 className="font-medium">Ingredients</h4>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                            {product.ingredients}
                          </p>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expandable Sections */}
                <div className="p-6 space-y-6">
                  {/* Nutrition Facts Section */}
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden"
                  >
                    <button 
                      onClick={() => setExpandedSection(expandedSection === "nutrition" ? "" : "nutrition")}
                      className="w-full px-4 py-3 flex items-center justify-between 
                        hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <div className="flex items-center gap-2 text-primary">
                        <Shield className="w-5 h-5" />
                        <span className="font-medium">Nutrition Facts</span>
                      </div>
                      <ChevronDown 
                        className={`w-5 h-5 transition-transform duration-200 
                          ${expandedSection === "nutrition" ? "rotate-180" : ""}`}
                      />
                    </button>
                    
                    <motion.div
                      variants={sectionVariants}
                      initial="collapsed"
                      animate={expandedSection === "nutrition" ? "expanded" : "collapsed"}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                        <div className="max-h-[60vh] overflow-y-auto scrollbar-thin 
                          scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 
                          scrollbar-track-transparent pr-2">
                          <NutritionFacts 
                            nutriments={product.nutriments} 
                            serving_size={product.serving_size} 
                          />
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>

                  {/* Ingredient Analysis Section */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden"
                  >
                    <button 
                      onClick={() => setExpandedSection(expandedSection === "analysis" ? "" : "analysis")}
                      className="w-full px-4 py-3 flex items-center justify-between 
                        hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <div className="flex items-center gap-2 text-primary">
                        <Sparkles className="w-5 h-5" />
                        <span className="font-medium">Ingredient Analysis</span>
                      </div>
                      <ChevronDown 
                        className={`w-5 h-5 transition-transform duration-200 
                          ${expandedSection === "analysis" ? "rotate-180" : ""}`}
                      />
                    </button>
                    
                    <motion.div
                      variants={sectionVariants}
                      initial="collapsed"
                      animate={expandedSection === "analysis" ? "expanded" : "collapsed"}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                        <IngredientAnalysis product={product} />
                      </div>
                    </motion.div>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}