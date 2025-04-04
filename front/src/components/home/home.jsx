import { useState, useCallback } from 'react';
import ProductSearch from './productSearch';
import ProductGrid from './productGrid';
import api from '../../services/api';

export default function Home({ user }) {
  const [state, setState] = useState({
    products: [],
    currentPage: 1,
    totalPages: 1,
    currentQuery: '',
    isLoading: false
  });

  const handleSearch = useCallback(async (results) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      const searchResults = await api.searchProducts(results.query, 1);
      setState({
        products: searchResults.products || [],
        currentPage: 1,
        totalPages: searchResults.totalPages || 1,
        currentQuery: results.query || '',
        isLoading: false
      });
    } catch (error) {
      console.error('Search error:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const handlePageChange = async (newPage) => {
    if (newPage < 1 || newPage > state.totalPages) return;
    
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const results = await api.searchProducts(state.currentQuery, newPage);
      setState(prev => ({
        ...prev,
        products: results.products,
        currentPage: newPage,
        totalPages: results.totalPages,
        isLoading: false
      }));
    } catch (error) {
      console.error('Pagination error:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">
        Welcome, {user?.username || 'Guest'}!
      </h1>
      
      <ProductSearch onSearch={handleSearch} />
      
      <ProductGrid 
        products={state.products} 
        isLoading={state.isLoading}
        currentPage={state.currentPage}
        totalPages={state.totalPages}
        onPageChange={handlePageChange}
      />
      
      {state.products.length > 0 && (
        <div className="pagination-controls">
          <button
            onClick={() => handlePageChange(state.currentPage - 1)}
            disabled={state.currentPage <= 1 || state.isLoading}
            className={`page-btn ${state.isLoading ? 'loading' : ''}`}
          >
            Previous
          </button>
          <span className="page-info">
            Page {state.currentPage} of {state.totalPages}
          </span>
          <button
            onClick={() => handlePageChange(state.currentPage + 1)}
            disabled={state.currentPage >= state.totalPages || state.isLoading}
            className={`page-btn ${state.isLoading ? 'loading' : ''}`}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}