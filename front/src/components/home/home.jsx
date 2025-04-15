import { useState, useCallback, useEffect } from 'react';
import api from '../../services/api';
import ProductSearch from './ProductSearch';
import ProductGrid from './ProductGrid';
import ProductDetailsModal from './ProductDetailsModal';
import { FloatingFoodIcons } from '../ui/floating-food-icons';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Star, Sparkles, ArrowUpRight, Filter, Home as HomeIcon, Leaf, Utensils } from "lucide-react";
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
    error: null,
    filters: {
      brand: '',
      healthRating: 0,
      category: '',
      dietaryPreference: ''
    }
  });
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedAnalysisProduct, setSelectedAnalysisProduct] = useState(null);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [showAllFeatured, setShowAllFeatured] = useState(false);

  const handleResetSearch = () => {
    setState(prev => ({
      ...prev,
      products: [],
      currentQuery: '',
      currentPage: 1,
      totalPages: 1,
      error: null,
      filters: {
        brand: '',
        healthRating: 0,
        category: '',
        dietaryPreference: ''
      }
    }));
  };

  const applyFilters = useCallback((products) => {
    return products.filter(product => {
      // Brand filter (including Indian brands)
      if (state.filters.brand && !product.brand?.toLowerCase().includes(state.filters.brand.toLowerCase())) {
        return false;
      }

      // Health rating filter
      if (state.filters.healthRating > 0 && product.healthRating < state.filters.healthRating) {
        return false;
      }

      // Category filter
      if (state.filters.category && product.category?.toLowerCase() !== state.filters.category.toLowerCase()) {
        return false;
      }

      // Dietary preference filter
      if (state.filters.dietaryPreference) {
        const ingredients = (product.ingredients || '').toLowerCase();
        switch (state.filters.dietaryPreference) {
          case 'vegetarian':
            return !ingredients.includes('meat') && !ingredients.includes('chicken') && !ingredients.includes('fish');
          case 'vegan':
            return !ingredients.includes('meat') && !ingredients.includes('milk') && !ingredients.includes('egg');
          case 'gluten-free':
            return !ingredients.includes('wheat') && !ingredients.includes('gluten');
          default:
            return true;
        }
      }

      return true;
    });
  }, [state.filters]);

  const handleSearch = useCallback(async (searchResults) => {
    const filteredProducts = applyFilters(searchResults.products);
    setState(prev => ({
      ...prev,
      products: filteredProducts,
      currentPage: searchResults.currentPage,
      totalPages: Math.ceil(filteredProducts.length / 10), // Adjust total pages based on filtered results
      currentQuery: searchResults.query,
      isLoading: false,
      error: null
    }));
  }, [applyFilters]);

  const handlePageChange = useCallback(async (newPage) => {
    if (!state.currentQuery) return;

    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const results = await api.searchProducts(state.currentQuery, newPage);
      const filteredProducts = applyFilters(results.products);
      setState(prev => ({
        ...prev,
        products: filteredProducts,
        currentPage: newPage,
        totalPages: Math.ceil(filteredProducts.length / 10),
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
  }, [state.currentQuery, applyFilters]);

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
      
      <div className="p-10 pl-10 relative z-10">
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
          <div className="space-y-4">
            <ProductSearch 
              onSearch={handleSearch}
              onSearchStart={() => setState(prev => ({ ...prev, isLoading: true }))}
            />

            {/* Redesigned Filters Section with Animation */}
            <AnimatePresence>
            {state.products.length > 0 && (
              <motion.div
                key="filters-bar"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, type: "spring" }}
                className="bg-gradient-to-r from-primary/10 to-blue-100 dark:from-primary/20 dark:to-gray-900/40 shadow-lg p-6 rounded-2xl border-primary/20 flex flex-wrap gap-4 items-center mb-2"
              >
                {/* Back to Home Button with Animation */}
                <motion.button
                  whileHover={{ scale: 1.08, backgroundColor: "#22c55e" }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleResetSearch}
                  className="flex items-center gap-2 px-5 py-2 text-base font-semibold text-white bg-primary rounded-full shadow-md hover:bg-neutral-600 transition-all duration-200 border-2 border-primary/60"
                >
                  <HomeIcon className="w-5 h-5" />
                  Back to Home
                </motion.button>

                <div className="flex items-center gap-2 text-primary font-bold text-lg">
                  <Filter className="w-5 h-5" />
                  Filters
                </div>

                {/* Brand Filter */}
                <div className="flex flex-col items-start">
                  <label className="text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
                    <Utensils className="w-4 h-4 text-blue-500" /> Brand
                  </label>
                  <select
                    value={state.filters.brand}
                    onChange={(e) => setState(prev => ({
                      ...prev,
                      filters: { ...prev.filters, brand: e.target.value }
                    }))}
                    className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm focus:ring-2 focus:ring-primary/40"
                  >
                    <option value="">All Brands</option>
                    <option value="amul">Amul</option>
                    <option value="britannia">Britannia</option>
                    <option value="parle">Parle</option>
                    <option value="haldirams">Haldiram's</option>
                    <option value="mtr">MTR</option>
                  </select>
                </div>

                {/* Health Rating Filter */}
                <div className="flex flex-col items-start">
                  <label className="text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500" /> Health
                  </label>
                  <select
                    value={state.filters.healthRating}
                    onChange={(e) => setState(prev => ({
                      ...prev,
                      filters: { ...prev.filters, healthRating: Number(e.target.value) }
                    }))}
                    className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm focus:ring-2 focus:ring-primary/40"
                  >
                    <option value="0">All Health Ratings</option>
                    <option value="4">4+ Stars</option>
                    <option value="3">3+ Stars</option>
                    <option value="2">2+ Stars</option>
                  </select>
                </div>

                {/* Dietary Preferences Filter */}
                <div className="flex flex-col items-start">
                  <label className="text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
                    <Leaf className="w-4 h-4 text-green-500" /> Diet
                  </label>
                  <select
                    value={state.filters.dietaryPreference}
                    onChange={(e) => setState(prev => ({
                      ...prev,
                      filters: { ...prev.filters, dietaryPreference: e.target.value }
                    }))}
                    className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm focus:ring-2 focus:ring-primary/40"
                  >
                    <option value="">All Dietary Preferences</option>
                    <option value="vegetarian">Vegetarian</option>
                    <option value="vegan">Vegan</option>
                    <option value="gluten-free">Gluten-Free</option>
                  </select>
                </div>
              </motion.div>
            )}
            </AnimatePresence>

            {/* Conditionally render dashboard or search results */}
            {state.products.length === 0 && !state.isLoading ? (
              <>
                {/* Featured Products Dashboard */}
                <section className="mt-12 mb-8">
                  <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-primary" />
                    Healthy Picks
                  </h2>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {featuredProducts.slice(0, showAllFeatured ? undefined : 10).map((product, index) => (
                      <motion.div
                        key={product._id || product.code}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="group relative bg-white dark:bg-gray-900 rounded-2xl overflow-hidden
                          border border-gray-200 dark:border-gray-800 hover:border-primary/50 
                          dark:hover:border-primary/50 transition-all duration-300
                          hover:shadow-lg hover:shadow-primary/5 flex flex-col"
                      >
                        {/* Health Rating Badge */}
                        <div className="absolute top-3 right-3 z-10">
                          <div className={`flex items-center gap-1 px-2 py-1 rounded-full 
                            bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border 
                            ${product.healthRating >= 4 ? 'border-green-500 text-green-500' :
                              product.healthRating >= 3 ? 'border-yellow-500 text-yellow-500' :
                              'border-red-500 text-red-500'}`}>
                            <Star className="w-4 h-4" fill="currentColor" />
                            <span className="text-sm font-medium">{product.healthRating.toFixed(1)}</span>
                          </div>
                        </div>

                        {/* Product Image */}
                        <div className="aspect-square w-full relative overflow-hidden bg-gray-100 dark:bg-gray-800">
                          <img
                            src={product.imageUrl || 'default-product-image.jpg'}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>

                        {/* Product Info */}
                        <div className="p-4 flex flex-col flex-grow">
                          <h3 className="font-medium text-gray-900 dark:text-white mb-1 line-clamp-2">
                            {product.name}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                            {product.brand}
                          </p>
                          
                          {/* Action Buttons */}
                          <div className="mt-auto flex gap-2">
                            <button
                              onClick={() => setSelectedProduct(product)}
                              className="flex-1 py-2 px-4 rounded-lg bg-primary/10 hover:bg-primary/20 
                                text-primary font-medium transition-colors duration-200"
                            >
                              Details
                            </button>
                            <button
                              onClick={() => handleAnalysisSelect(product)}
                              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 
                                dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors duration-200"
                            >
                              <ArrowUpRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  
                  {featuredProducts.length > 10 && (
                    <button
                      onClick={() => setShowAllFeatured(!showAllFeatured)}
                      className="mt-6 mx-auto block px-6 py-2 rounded-lg border border-gray-200 
                        dark:border-gray-800 hover:border-primary/50 dark:hover:border-primary/50 
                        transition-colors duration-200"
                    >
                      {showAllFeatured ? 'Show Less' : 'Show More'}
                    </button>
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
          </div>

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
              product={selectedAnalysisProduct || {
                healthRating: 4.0,
                category: "All Categories"
              }}
              onAnalysisSelect={handleAnalysisSelect}
            />
          </section>
          
        </div>
      </div>
    </>
  );
}