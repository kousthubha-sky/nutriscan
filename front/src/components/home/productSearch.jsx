import { useState, useCallback } from 'react';
import api from '../../services/api';

export default function ProductSearch({ onSearch, onError }) {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = useCallback(async (e) => {
    e.preventDefault();
    if (!query.trim() || query.trim().length < 2) return;

    setIsLoading(true);
    try {
      console.log('Searching for:', query);
      const results = await api.searchProducts(query, 1);
      console.log('Search results:', results);
      onSearch(results);
    } catch (err) {
      console.error('Search failed:', err);
      onError?.(err);
    } finally {
      setIsLoading(false);
    }
  }, [query, onSearch, onError]);

  return (
    <div className="search-container mb-6">
      <form onSubmit={handleSearch} className="flex gap-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products..."
          className="flex-1 p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
          disabled={isLoading}
          minLength={2}
          required
        />
        <button 
          type="submit" 
          disabled={isLoading || !query.trim()}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-blue-300 
            hover:bg-blue-600 transition-colors duration-200"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Searching...
            </span>
          ) : (
            'Search'
          )}
        </button>
      </form>
    </div>
  );
}