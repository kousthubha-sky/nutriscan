import { X, Star } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { NutritionFacts } from '../product/NutritionFacts';

function HealthRating({ product }) {
  const rating = product.healthRating || 3;
  // Removed unused variable 'hasHalfStar'

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
    setTimeout(onClose, 300); // Match animation duration
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

  if (!product) return null;

  const getImageUrl = (product) => {
    return product.image_url || product.imageUrl || '/placeholder.png';
  };

  return (
    <div 
      className={`modal-overlay ${isClosing ? 'closing' : ''}`}
      onClick={handleClose}
    >
      <div 
        className={`modal-container ${isClosing ? 'closing' : ''}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 className="text-xl font-bold">Product Details</h2>
          <button className="modal-close-btn" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-content">
          <div className="modal-product-grid">
            <div className="modal-image-container">
              <img
                src={getImageUrl(product)}
                alt={product.product_name || product.name}
                className="product-detail-image"
                onError={(e) => {
                  e.target.src = '/placeholder.png';
                  e.target.onerror = null;
                }}
              />
            </div>

            <div className="product-details">
              <h3 className="text-xl font-bold mb-2">
                {product.product_name || product.name}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {product.brands || product.brand || 'N/A'}
              </p>

              <HealthRating product={product} />

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
            </div>

            {/* Add Nutrition Facts */}
            <NutritionFacts 
              nutriments={product.nutriments} 
              serving_size={product.serving_size} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}