import { X, Star } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { NutritionFacts } from '../product/NutritionFacts';
import { IngredientAnalysis } from '../product/ingredient-analysis';

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

  return (
    <div 
      className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 
        transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`}
      onClick={handleClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className={`bg-white dark:bg-gray-800 rounded-lg w-11/12 max-w-4xl max-h-[90vh] 
          overflow-y-auto transform transition-all duration-300
          ${isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b 
          dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Product Details</h2>
          <button 
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full 
              transition-colors"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 
                dark:bg-gray-700">
                <img
                  src={getImageUrl(product)}
                  alt={product.product_name || product.name}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.target.src = '/placeholder.png';
                    e.target.onerror = null;
                  }}
                />
              </div>
              
              <HealthRating product={product} />
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-bold mb-2">
                {product.product_name || product.name}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {product.brands || product.brand || 'N/A'}
              </p>

              {product.ingredients && (
                <div className="mb-4">
                  <h4 className="font-semibold mb-1">Ingredients:</h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    {product.ingredients}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <p><span className="font-semibold">Product Code:</span> {product._id || product.code}</p>
                {product.category && (
                  <p><span className="font-semibold">Category:</span> {product.category}</p>
                )}
              </div>

              <NutritionFacts 
                nutriments={product.nutriments} 
                serving_size={product.serving_size} 
              />

              <IngredientAnalysis product={product} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}