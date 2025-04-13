import { useState, useCallback, useEffect } from 'react';
import api from '../../services/api';
import ProductSearch from './ProductSearch';
import ProductGrid from './ProductGrid';
import ProductDetailsModal from './ProductDetailsModal';
import { FloatingFoodIcons } from '../ui/floating-food-icons';
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { ChevronDown, Star } from "lucide-react";
import { AnalysisSection } from '../product/analysis-section';
import { IngredientAnalysis } from '../product/ingredient-analysis';
import { HealthierAlternatives } from '../product/healthier-alternatives';
import { NutritionalImpact } from '../product/nutritional-impact';

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
  const [selectedAnalysisProduct, setSelectedAnalysisProduct] = useState(null);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [showAllFeatured, setShowAllFeatured] = useState(false);

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

  const handleAnalysisSelect = useCallback((product) => {
    setSelectedAnalysisProduct(product);
    // Scroll to analysis section with smooth behavior
    const analysisSection = document.getElementById('details');
    if (analysisSection) {
      analysisSection.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const [oatsRes, nutsRes, yogurtRes] = await Promise.all([
          api.searchProducts('oats organic', 1),
          api.searchProducts('nuts butter', 1),
          api.searchProducts('yogurt protein', 1)
        ]);

        const combined = [
          ...(oatsRes.products || []),
          ...(nutsRes.products || []),
          ...(yogurtRes.products || [])
        ].filter(p => p.healthRating >= 3.0);

        setFeaturedProducts(combined.slice(0, 12));
      } catch (error) {
        console.error('Failed to fetch featured products:', error);
      }
    };
    fetchFeaturedProducts();
  }, []);

  return (
    <>
      {/* Add floating food icons as background */}
      <FloatingFoodIcons />
      
      <div className="p-10 relative z-10">
        <div className="max-w-[1920px] mx-auto px-4"> {/* Increased max width and added padding */}
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

          {/* Conditionally render dashboard or search results */}
          {state.products.length === 0 && !state.isLoading ? (
            <>
              {/* Featured Products Dashboard */}
              <section className="mt-12 mb-8">
                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                  Healthy Picks
                </h2>
                
                <div id='featured-product' className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8"> {/* Increased gap */}
                  {featuredProducts.slice(0, showAllFeatured ? undefined : 10).map((product, index) => (
                    <motion.div
                      id='featured-product-card'
                      key={product._id || product.code}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="w-full transparent dark:transparent rounded-lg shadow-sm hover:shadow-md transition-all group"
                    >
                      <div className="relative pt-[100%]"> {/* Create 1:1 aspect ratio container */}
                        <div className="absolute inset-0 p-4">
                          <img
                            src={product.image_url || product.imageUrl || '/placeholder.png'}
                            alt={product.product_name || product.name}
                            className="w-full h-full object-contain transition-transform group-hover:scale-1.05"
                            onError={(e) => {
                              e.target.src = '/placeholder.png';
                              e.target.onerror = null;
                            }}
                          />
                          <div className="absolute top-2 right-2 bg-white/90 dark:bg-gray-800/90 px-2 py-1 rounded-full flex items-center gap-1 text-sm font-medium">
                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                            <span>{(product.healthRating || 3.0).toFixed(1)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 min-h-[2.5rem]">
                          {product.product_name || product.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {product.brands || product.brand || 'Unknown Brand'}
                        </p>
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => setSelectedProduct(product)}
                            className="w-1/2 px-3 py-1.5 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90 transition-colors"
                          >
                            View Details
                          </button>
                          <button
                            onClick={() => setSelectedAnalysisProduct(product)}
                            className="w-1/2 px-3 py-1.5 text-sm font-medium text-primary border border-primary rounded-md hover:bg-primary/10 transition-colors"
                          >
                            View Analysis
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {featuredProducts.length > 10 && (
                  <div className="text-center mt-8">
                    <button
                      onClick={() => setShowAllFeatured(!showAllFeatured)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors"
                    >
                      {showAllFeatured ? 'Show Less' : 'View More'}
                      <ChevronDown 
                        className={`w-4 h-4 transition-transform ${showAllFeatured ? 'rotate-180' : ''}`}
                      />
                    </button>
                  </div>
                )}
              </section>
            </>
          ) : (
            <>
              {/* Error message */}
              {state.error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-600">{state.error}</p>
                </div>
              )}

              {/* Product grid with search results */}
              <div className="mt-8">
                <ProductGrid 
                  products={state.products}
                  isLoading={state.isLoading}
                  currentPage={state.currentPage}
                  totalPages={state.totalPages}
                  onPageChange={handlePageChange}
                  onProductSelect={setSelectedProduct}
                  onAnalysisSelect={handleAnalysisSelect}
                />
              </div>
            </>
          )}

          {/* Product details modal */}
          {selectedProduct && (
            <ProductDetailsModal
              product={selectedProduct}
              onClose={() => setSelectedProduct(null)}
              user={user}
            />
          )}

          {/* Static Analysis Section */}
          {featuredProducts.length > 0 && (
            <div id='details' className="mt-12 space-y-12 scroll-mt-8">
              <AnalysisSection product={selectedAnalysisProduct || featuredProducts[9]} />
              <IngredientAnalysis product={selectedAnalysisProduct || featuredProducts[9]}/>
              <NutritionalImpact product={selectedAnalysisProduct || featuredProducts[9]} />
            </div>
          )}
          
          {/* Add Healthier Alternatives Section */}
          <section className="w-full max-w-7xl mx-auto py-12">
            <h2 className="text-3xl font-bold mb-8">Recommended Healthy Products</h2>
            <HealthierAlternatives 
              product={{
                healthRating: 4.0,
                category: "All Categories"
              }} 
            />
          </section>
          
        </div>
      </div>
    </>
  );
}