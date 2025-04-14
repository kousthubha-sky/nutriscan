// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { Star, ChevronLeft, ChevronRight, Sparkles, ArrowUpRight } from "lucide-react";

const ProductCard = ({ product, onProductSelect, onAnalysisSelect, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group relative bg-white dark:bg-gray-900 rounded-2xl overflow-hidden
        border border-gray-200 dark:border-gray-800 hover:border-primary/50 
        dark:hover:border-primary/50 transition-all duration-300
        hover:shadow-lg hover:shadow-primary/5 flex flex-col"
    >
      {/* Health Rating Badge */}
      <div className="absolute top-3 right-3 z-10">
        <div className="flex items-center gap-1 px-2 py-1 rounded-full 
          bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border 
          border-gray-200 dark:border-gray-800 shadow-sm">
          <Star className={`w-4 h-4 ${
            product.healthRating >= 4 ? 'text-yellow-400 fill-yellow-400' :
            product.healthRating >= 3 ? 'text-green-400 fill-green-400' :
            'text-orange-400 fill-orange-400'
          }`} />
          <span className="text-sm font-medium">{product.healthRating?.toFixed(1) || "N/A"}</span>
        </div>
      </div>

      {/* Product Image */}
      <div className="aspect-square p-4 bg-gradient-to-br from-gray-50 to-gray-100 
        dark:from-gray-800 dark:to-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent 
          opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <img
          src={product.image_url || product.imageUrl || '/placeholder.png'}
          alt={product.product_name || product.name}
          className="w-full h-full object-contain transition-transform duration-300
            group-hover:scale-105"
          onError={(e) => {
            e.target.src = '/placeholder.png';
            e.target.onerror = null;
          }}
        />
      </div>

      {/* Product Info */}
      <div className="flex-1 p-4 space-y-4">
        <div>
          <h3 className="font-medium mb-1 line-clamp-2 leading-tight">
            {product.product_name || product.name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
            {product.brands || product.brand || 'Unknown Brand'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={() => onProductSelect(product)}
            className="flex-1 px-3 py-2 text-sm font-medium text-white bg-primary 
              rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
          >
            Details
            <ArrowUpRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => onAnalysisSelect(product)}
            className="flex-1 px-3 py-2 text-sm font-medium text-primary border 
              border-primary rounded-lg hover:bg-primary/10 transition-colors"
          >
            Analysis
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default function ProductGrid({ 
  products, 
  isLoading, 
  currentPage, 
  totalPages, 
  onPageChange,
  onProductSelect,
  onAnalysisSelect 
}) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-square rounded-2xl bg-gray-200 dark:bg-gray-800 mb-4" />
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded mb-2 w-3/4" />
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
        {products.map((product, index) => (
          <ProductCard
            key={product._id || index}
            product={product}
            index={index}
            onProductSelect={onProductSelect}
            onAnalysisSelect={onAnalysisSelect}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 py-6 border-t 
          border-gray-200 dark:border-gray-800">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 
              transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <span className="text-sm">
            Page {currentPage} of {totalPages}
          </span>
          
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 
              transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}