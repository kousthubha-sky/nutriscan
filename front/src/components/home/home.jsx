import { useState, useCallback } from 'react';
import api from '../../services/api';
import ProductSearch from './ProductSearch';
import ProductGrid from './ProductGrid';
import ProductDetailsModal from './ProductDetailsModal';

export default function Home({ user }) {
  const [state, setState] = useState({
    products: [],
    isLoading: false,
    currentPage: 1,
    totalPages: 1,
    currentQuery: '',
    error: null
  });
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleSearch = useCallback(async (searchResults) => {
    setState(prev => ({
      ...prev,
      products: searchResults.products,
      currentPage: searchResults.currentPage,
      totalPages: searchResults.totalPages,
      currentQuery: searchResults.query,
      isLoading: false,
      error: null
    }));
  }, []);

  const handlePageChange = useCallback(async (newPage) => {
    if (!state.currentQuery) return;

    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const results = await api.searchProducts(state.currentQuery, newPage);
      setState(prev => ({
        ...prev,
        products: results.products,
        currentPage: results.currentPage,
        totalPages: results.totalPages,
        isLoading: false
      }));
    } catch (error) {
      console.error('Page change failed:', error);
      setState(prev => ({
        ...prev,
        error: error.message,
        isLoading: false
      }));
    }
  }, [state.currentQuery]);

  return (
    <div className="p-4">
      <div className="max-w-7xl mx-auto">
        {/* Welcome message with user info */}
        <div className="mb-6">
          {user ? (
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Welcome back, {user.username}!
              </h1>
              
            </div>
          ) : (
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Welcome to NutriScan
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Please <a href="/login" className="text-primary hover:underline">log in</a> or <a href="/signup" className="text-primary hover:underline">sign up</a> to save your searches and preferences.
              </p>
            </div>
          )}
        </div>

        {/* Search functionality */}
        <ProductSearch 
          onSearch={handleSearch}
          onSearchStart={() => setState(prev => ({ ...prev, isLoading: true }))}
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
          onPageChange={handlePageChange}
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