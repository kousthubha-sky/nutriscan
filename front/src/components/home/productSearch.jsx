import { useState, useCallback, useEffect } from 'react';
import api from '../../services/api';
import { Search, Barcode, Camera, X, Plus } from 'lucide-react';
import { BarcodeScanner } from './BarcodeScanner';

export default function ProductSearch({ onSearch, onError, resetQuery, onSearchStart, onAddFilter, activeFilters = [], onRemoveFilter }) {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchMode, setSearchMode] = useState('text');
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
    <div className="search-container ">
      {/* Search Mode Tabs */}
      <div className="flex gap-2 p-1 bg-gray-100 dark:bg-black rounded-lg w-fit">
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

      {/* Filter Chips Section - Always visible */}
      <div className="flex flex-wrap gap-2 items-center min-h-[2.5rem]">
        {activeFilters.map((filter, index) => (
          <div
            key={index}
            className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium group hover:bg-primary/20 transition-colors"
          >
            <span>{filter}</span>
            <button
              onClick={() => onRemoveFilter(filter)}
              className="p-0.5 rounded-full hover:bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
        
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
            className="w-full pl-10 pr-16 py-2 border  dark:border-gray-700 rounded-lg 
              bg-white dark:bg-transparent focus:ring-2 focus:ring-primary/40 focus:border-transparent"
            disabled={isLoading}
            minLength={searchMode === 'text' ? 2 : 1}
            pattern={searchMode === 'barcode' ? '[0-9]*' : undefined}
            inputMode={searchMode === 'barcode' ? 'numeric' : 'text'}
            required
          />
          {searchMode === 'barcode' && (
            <button
              type="button"
              onClick={() => setShowScanner(true)}
              className="absolute inset-y-0 right-3 h-9 px-4 mt-0.5 flex items-center justify-center
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
        <button
          onClick={onAddFilter}
          className="flex items-center gap-1 px-3 py-1.5 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-full text-sm font-medium text-gray-600 dark:text-gray-300 hover:border-primary hover:text-primary transition-colors"
        >
          <Plus className="w-3 h-3" />
          Add filter
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