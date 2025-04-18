import { useState, useCallback, useEffect } from 'react';
import api from '../../services/api';
import { Search } from 'lucide-react';

export default function ProductSearch({ onSearch, onError, resetQuery, onSearchStart }) {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (resetQuery) {
      setQuery('');
    }
  }, [resetQuery]);

  const handleSearch = useCallback(async (e) => {
    e.preventDefault();
    if (!query.trim() || query.trim().length < 2) return;

    setIsLoading(true);
    onSearchStart?.();
    
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
  }, [query, onSearch, onError, onSearchStart]);

  return (
    <div className="search-container">
      <form onSubmit={handleSearch} className="flex gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg 
              bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary/40 focus:border-transparent"
            disabled={isLoading}
            minLength={2}
            required
          />
        </div>
        <button 
          type="submit" 
          disabled={isLoading || !query.trim()}
          className="px-6 py-2 bg-primary text-white rounded-lg disabled:opacity-50
            hover:bg-primary/90 transition-colors duration-200 min-w-[120px]"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
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