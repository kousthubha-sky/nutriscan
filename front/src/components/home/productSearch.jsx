import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../shared/LoadingSpinner';

export default function ProductSearch({ onSearch }) {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const performSearch = useCallback(async (page = 1) => {
    if (!query.trim()) {
      onSearch({ products: [], currentPage: 1, totalPages: 1 });
      return;
    }
    
    setIsLoading(true);
    setError(null);
    try {
      const results = await api.searchProducts(query, page);
      onSearch(results);
    } catch (err) {
      setError(err.message || 'Failed to search products');
      onSearch({ products: [], currentPage: 1, totalPages: 1 });
    } finally {
      setIsLoading(false);
    }
  }, [query, onSearch]);

  useEffect(() => {
    const handler = setTimeout(() => {
      performSearch();
    }, 500);

    return () => clearTimeout(handler);
  }, [query, performSearch]);

  return (
    <div className="mb-6">
      <form onSubmit={(e) => {
        e.preventDefault();
        performSearch();
      }}>
        <div class="search" className="flex gap-6">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products..."
            className="flex-1 p-2 border rounded"
          />
          <button 
            type="submit" 
            disabled={isLoading}
            className="px-4 py-2  bg-blue-500 text-white rounded disabled:bg-blue-300"
          >
            Search
          </button>
        </div>
      </form>
      
      {isLoading && <LoadingSpinner />}
      {error && <p className="mt-2 text-red-500">{error}</p>}
    </div>
  );
}