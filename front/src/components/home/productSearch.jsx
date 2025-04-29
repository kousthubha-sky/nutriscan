import { useState, useCallback, useEffect } from 'react';
import api from '../../services/api';
import { Search, Barcode, Camera } from 'lucide-react';
import { BarcodeScanner } from './BarcodeScanner';

export default function ProductSearch({ onSearch, onError, resetQuery, onSearchStart }) {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchMode, setSearchMode] = useState('text'); // 'text' or 'barcode'
  const [showScanner, setShowScanner] = useState(false);

  useEffect(() => {
    if (resetQuery) {
      setQuery('');
    }
  }, [resetQuery]);

  const handleSearch = useCallback(async (e) => {
    e?.preventDefault();
    if (!query.trim() || query.trim().length < 2) return;

    setIsLoading(true);
    onSearchStart?.();
    
    try {
      console.log('Searching for:', query, 'mode:', searchMode);
      let results;
      if (searchMode === 'barcode') {
        // For barcode search, use exact match
        results = await api.searchProducts(query, 1, { barcode: query });
      } else {
        results = await api.searchProducts(query, 1);
      }
      console.log('Search results:', results);
      onSearch(results);
    } catch (err) {
      console.error('Search failed:', err);
      onError?.(err);
    } finally {
      setIsLoading(false);
    }
  }, [query, searchMode, onSearch, onError, onSearchStart]);

  const handleBarcodeDetected = useCallback((barcode) => {
    setQuery(barcode);
    setSearchMode('barcode');
    // Trigger search automatically when barcode is scanned
    setTimeout(() => handleSearch(), 100);
  }, [handleSearch]);

  return (
    <div className="search-container space-y-4">
      {/* Search Mode Tabs */}
      <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg w-fit">
        <button
          type="button"
          onClick={() => setSearchMode('text')}
          className={`px-4 py-2 rounded-md flex items-center gap-2 transition-colors ${
            searchMode === 'text' 
              ? 'bg-white dark:bg-gray-700 shadow-sm' 
              : 'hover:bg-white/50 dark:hover:bg-gray-700/50'
          }`}
        >
          <Search className="w-4 h-4" />
          <span>Text Search</span>
        </button>
        <button
          type="button"
          onClick={() => setSearchMode('barcode')}
          className={`px-4 py-2 rounded-md flex items-center gap-2 transition-colors ${
            searchMode === 'barcode' 
              ? 'bg-white dark:bg-gray-700 shadow-sm' 
              : 'hover:bg-white/50 dark:hover:bg-gray-700/50'
          }`}
        >
          <Barcode className="w-4 h-4" />
          <span>Barcode</span>
        </button>
      </div>

      <form onSubmit={handleSearch} className="flex gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            {searchMode === 'text' ? (
              <Search className="h-5 w-5 text-gray-400" />
            ) : (
              <Barcode className="h-5 w-5 text-gray-400" />
            )}
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchMode === 'text' ? "Search products..." : "Enter barcode number..."}
            className="w-full pl-10 pr-16 py-2 border border-gray-200 dark:border-gray-700 rounded-lg 
              bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary/40 focus:border-transparent"
            disabled={isLoading}
            minLength={searchMode === 'text' ? 2 : 1}
            pattern={searchMode === 'barcode' ? '[0-9]*' : undefined}
            inputMode={searchMode === 'barcode' ? 'numeric' : 'text'}
            required
          />
          {/* Camera button for barcode mode */}
          {searchMode === 'barcode' && (
            <button
              type="button"
              onClick={() => setShowScanner(true)}
              className="absolute inset-y-0 right-3 px-2 flex items-center justify-center
                text-gray-400 hover:text-primary transition-colors"
            >
              <Camera className="w-5 h-5" />
            </button>
          )}
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

      {/* Barcode Scanner Modal */}
      {showScanner && (
        <BarcodeScanner
          onDetected={handleBarcodeDetected}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
}