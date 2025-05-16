// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { Star, ChevronLeft, ChevronRight, Sparkles, ArrowUpRight, Search } from "lucide-react";

const ProductCard = ({ product, onProductSelect, onAnalysisSelect, index }) => {
  const rating = product.healthRating || 3.0;
  
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
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full 
          bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border shadow-sm          ${rating >= 4.5 ? 'border-emerald-400 text-emerald-500' :
            rating >= 4 ? 'border-green-400 text-green-500' :
            rating >= 3 ? 'border-yellow-400 text-yellow-500' :
            'border-orange-400 text-orange-500'}`}
        >
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span className="font-medium text-sm">{rating.toFixed(1)}</span>
        </div>
      </div>

      {/* Product Image */}
      <div className="aspect-square w-full relative overflow-hidden bg-gray-100 dark:bg-gray-800">
        <img
          src={product.image_url || product.imageUrl || '/placeholder.png'}
          alt={product.product_name || product.name}
          className="w-full h-full object-cover transition-transform duration-300 
            group-hover:scale-105"
          onError={(e) => {
            e.target.src = '/placeholder.png';
            e.target.onerror = null;
          }}
        />
      </div>

      {/* Product Info */}
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-medium text-gray-900 dark:text-white mb-1 line-clamp-2">
          {product.product_name || product.name}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {product.brands || product.brand}
        </p>
        
        {/* Action Buttons */}
        <div className="mt-auto flex gap-2">
          <button
            onClick={() => onProductSelect(product)}
            className="flex-1 py-2 px-4 rounded-lg bg-primary/10 hover:bg-primary/20 
              text-primary font-medium transition-colors duration-200"
          >
            Details
          </button>
          <button
            onClick={() => onAnalysisSelect(product)}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 
              dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            <ArrowUpRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
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

  if (!isLoading && (!products || products.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <div className="w-16 h-16 mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <Search className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Products Found</h3>
        <p className="text-gray-500 dark:text-gray-400 max-w-md">
          We couldn't find any products matching your search. Try adjusting your search terms or filters.
        </p>
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