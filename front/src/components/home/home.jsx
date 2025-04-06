import { useState, useCallback } from 'react';
import ProductSearch from './ProductSearch';
import ProductGrid from './ProductGrid';
import ProductDetailsModal from './ProductDetailsModal';

export default function Home({ user }) {
  const [state, setState] = useState({
    products: [],
    isLoading: false,
    currentPage: 1,
    totalPages: 1,
    error: null
  });
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleSearch = useCallback(async (results) => {
    console.log('Search results:', results);
    setState(prev => ({
      ...prev,
      products: results.products || [],
      currentPage: results.currentPage || 1,
      totalPages: results.totalPages || 1,
      isLoading: false,
      error: null
    }));
  }, []);

  const handleError = useCallback((error) => {
    console.error('Search error:', error);
    setState(prev => ({
      ...prev,
      error: error.message || 'An error occurred',
      isLoading: false
    }));
  }, []);

  return (
    <div className="p-4">
      <div className="max-w-7xl mx-auto">
        {/* Welcome message with user info */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome, {user?.username || 'Guest'}!
          </h1>
          {!user && (
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Please log in to save your searches and preferences.
            </p>
          )}
        </div>

        {/* Search functionality */}
        <ProductSearch 
          onSearch={handleSearch} 
          onError={handleError}
        />

        {/* Error message */}
        {state.error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600">{state.error}</p>
          </div>
        )}

        {/* Product grid */}
        <ProductGrid 
          products={state.products}
          isLoading={state.isLoading}
          currentPage={state.currentPage}
          totalPages={state.totalPages}
          onProductSelect={setSelectedProduct}
        />

        {/* Product details modal */}
        {selectedProduct && (
          <ProductDetailsModal
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            user={user} // Pass user to modal
          />
        )}
      </div>
    </div>
  );
}