import { Star, ChevronRight, AlertTriangle } from "lucide-react"
import { useState, useEffect } from "react"
import api from "../../services/api"

export function HealthierAlternatives({ product, onAnalysisSelect }) {
  const [alternatives, setAlternatives] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchAlternatives = async () => {
      if (!product) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        // Use a broader search: prefer category, fallback to 'healthy food'
        const searchTerm = product.category || 'healthy food';
        const cacheKey = `healthier-alternatives-${product._id || searchTerm}`;
        const results = await api.searchProducts(searchTerm, 1);
        // Loosen health rating filter: allow alternatives with rating >= product.healthRating - 1
        let healthierAlts = results.products
          .filter(alt =>
            alt._id !== product._id &&
            alt.healthRating >= ((product?.healthRating || 3.0) - 1)
          )
          .sort((a, b) => b.healthRating - a.healthRating)
          .slice(0, 6)
          .map(alt => ({
            ...alt,
            tag: alt.healthRating >= 4.5 ? "Healthiest Choice" :
                 alt.healthRating >= 4.0 ? "Healthy Choice" :
                 "Better Choice"
          }));
        // If still no alternatives, fallback to a generic healthy food search
        if (healthierAlts.length === 0 && searchTerm !== 'healthy food') {
          const fallbackResults = await api.searchProducts('healthy food', 1);
          healthierAlts = fallbackResults.products
            .filter(alt => alt.healthRating >= 3.5)
            .sort((a, b) => b.healthRating - a.healthRating)
            .slice(0, 6)
            .map(alt => ({
              ...alt,
              tag: alt.healthRating >= 4.5 ? "Healthiest Choice" :
                   alt.healthRating >= 4.0 ? "Healthy Choice" :
                   "Better Choice"
            }));
        }
        // Cache the results
        try {
          localStorage.setItem(cacheKey, JSON.stringify({
            data: healthierAlts,
            timestamp: Date.now()
          }));
        } catch (cacheError) {
          console.warn('Failed to cache alternatives:', cacheError);
        }
        setAlternatives(healthierAlts);
      } catch (error) {
        console.error('Failed to fetch alternatives:', error);
        setError(error.message || 'Failed to load alternatives');
        // Try to load from cache if API fails
        try {
          const cacheKey = `healthier-alternatives-${product._id || product.category || 'healthy'}`;
          const cachedData = localStorage.getItem(cacheKey);
          if (cachedData) {
            const { data, timestamp } = JSON.parse(cachedData);
            if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
              setAlternatives(data);
              setError('Showing cached results');
            }
          }
        } catch (cacheError) {
          console.warn('Failed to load from cache:', cacheError);
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchAlternatives();
  }, [product]);

  if (isLoading) {
    return (
      <section id="alternatives" className="py-8 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Healthier Alternatives</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden bg-card p-4">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2" />
                  </div>
                </div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-3" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Show message when no alternatives found
  if (!isLoading && alternatives.length === 0) {
    return (
      <section id="alternatives" className="py-8 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Healthier Alternatives</h2>
          <div className="text-center p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <p className="text-gray-600 dark:text-gray-400">
              {error ? (
                <span className="flex items-center justify-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  {error}
                </span>
              ) : (
                "No healthier alternatives found at the moment."
              )}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="alternatives" className="py-8 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">
          Healthier Alternatives
          {error && (
            <span className="ml-2 text-sm font-normal text-yellow-600 dark:text-yellow-500 flex items-center gap-1">
              <AlertTriangle className="h-4 w-4" />
              {error}
            </span>
          )}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {alternatives.map((alt, index) => (
            <div
              key={alt._id || index}
              className="rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden bg-card hover:border-primary/50 transition-all duration-300"
            >
              <div className="p-4">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 flex items-center justify-center rounded overflow-hidden">
                    <img
                      src={alt.imageUrl || "/placeholder.svg"}
                      alt={alt.name}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.target.src = "/placeholder.svg";
                      }}
                    />
                  </div>

                  <div className="flex-1">
                    <h3 className="font-medium line-clamp-2">{alt.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center">
                        <span className="font-medium text-sm mr-1">
                          {alt.healthRating?.toFixed(1) || "4.0"}
                        </span>
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      </div>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          alt.tag === "Healthiest Choice"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            : alt.tag === "Healthy Choice"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                              : "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
                        }`}
                      >
                        {alt.tag}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 line-clamp-2">
                  {alt.description || `A ${alt.tag.toLowerCase()} with great nutritional value.`}
                </p>
              </div>

              <div className="flex flex-col border-t border-gray-200 dark:border-gray-800">
                <button
                  onClick={() => onAnalysisSelect?.(alt)}
                  className="w-full p-3 bg-primary/10 hover:bg-primary/20 text-primary font-medium transition-colors flex items-center justify-center gap-1"
                >
                  View Analysis
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

