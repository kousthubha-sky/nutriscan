import { X } from "lucide-react";
import { useState, useEffect, useCallback } from "react";

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
          </div>
        </div>
      </div>
    </div>
  );
}