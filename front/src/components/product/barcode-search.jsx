import { useState, useCallback } from 'react';
import { Camera, X, AlertTriangle, Loader2, Check } from 'lucide-react';
import { BarcodeScanner } from '../home/BarcodeScanner';
import api from '../../services/api';

export function BarcodeSearch({ onProductFound, onError }) {
  const [barcodeInput, setBarcodeInput] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState(null);
  const [error, setError] = useState(null);

  const searchBarcode = useCallback(async (barcode) => {
    setIsSearching(true);
    setError(null);
    setSearchResult(null);

    try {
      const results = await api.searchProducts(barcode, 1, { barcode });
      
      if (results.products && results.products.length > 0) {
        const product = results.products[0];
        setSearchResult(product);
        onProductFound?.(product);
      } else {
        const errorMsg = 'No product found with this barcode';
        setError(errorMsg);
        onError?.(errorMsg);
      }
    } catch (err) {
      console.error('Barcode search failed:', err);
      const errorMsg = err.message || 'Failed to search barcode';
      setError(errorMsg);
      onError?.(errorMsg);
    } finally {
      setIsSearching(false);
    }
  }, [onProductFound, onError]);

  const handleBarcodeDetected = useCallback(async (barcode) => {
    setBarcodeInput(barcode);
    await searchBarcode(barcode);
  }, [searchBarcode]);

  const handleManualSearch = async (e) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;
    await searchBarcode(barcodeInput.trim());
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleManualSearch} className="relative">
        <div className="relative flex gap-2">
          <input
            type="text"
            value={barcodeInput}
            onChange={(e) => setBarcodeInput(e.target.value)}
            placeholder="Enter barcode number..."
            className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 
              focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-900"
            pattern="[0-9]*"
            inputMode="numeric"
            disabled={isSearching}
          />
          <button
            type="button"
            onClick={() => setShowScanner(true)}
            className="px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 
              transition-colors flex items-center gap-2"
          >
            <Camera className="w-5 h-5" />
            <span className="hidden sm:inline">Scan</span>
          </button>
          <button
            type="submit"
            disabled={!barcodeInput.trim() || isSearching}
            className="px-6 py-2 bg-primary text-white rounded-lg disabled:opacity-50
              hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            {isSearching ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Searching...
              </>
            ) : (
              'Search'
            )}
          </button>
        </div>
      </form>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 
          rounded-lg flex items-start gap-3 text-red-600 dark:text-red-400"
        >
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {searchResult && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 
          dark:border-green-800 rounded-lg flex items-start gap-3"
        >
          <Check className="w-5 h-5 shrink-0 mt-0.5 text-green-600 dark:text-green-400" />
          <div>
            <p className="font-medium text-green-800 dark:text-green-300">
              Product Found
            </p>
            <p className="text-green-600 dark:text-green-400">
              {searchResult.name || searchResult.product_name}
            </p>
          </div>
        </div>
      )}

      {showScanner && (
        <BarcodeScanner
          onDetected={handleBarcodeDetected}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
}