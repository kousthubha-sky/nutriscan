import { useState, useCallback } from 'react';
import ProductSearch from './productSearch';
import ProductGrid from './productGrid';

export default function Home({ user }) {
  const [state, setState] = useState({
    products: [],
    currentPage: 1,
    totalPages: 1
  });

  const handleSearch = useCallback((results) => {
    console.log('Search Results:', results); // Debug log
    setState({
      products: results.products || [],
      currentPage: results.currentPage || 1,
      totalPages: results.totalPages || 1
    });
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">
        Welcome, {user?.username || 'Guest'}!
      </h1>
      
      <ProductSearch onSearch={handleSearch} />
      
      <ProductGrid 
        products={state.products} 
        isLoading={false}
      />
      
      {state.products.length > 0 && (
        <div className="flex justify-center mt-6 gap-2">
          <button
            onClick={() => handleSearch({ 
              ...state, 
              currentPage: Math.max(1, state.currentPage - 1)
            })}
            disabled={state.currentPage === 1}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2">
            Page {state.currentPage} of {state.totalPages}
          </span>
          <button
            onClick={() => handleSearch({
              ...state,
              currentPage: state.currentPage + 1
            })}
            disabled={state.currentPage >= state.totalPages}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}