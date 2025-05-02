import { useState, useCallback, useEffect } from 'react';
import api from '../../services/api';
import ProductSearch from './productSearch';
import ProductGrid from './productGrid';
import ProductDetailsModal from './ProductDetailsModal';
import { FloatingFoodIcons } from '../ui/floating-food-icons';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronDown, 
  Star, 
  Sparkles, 
  ArrowUpRight, 
  Filter, 
  Home as HomeIcon, 
  Leaf, 
  Utensils,
  Tag,
  DollarSign,
  Shield,
  Check,
  AlertTriangle,
  X 
} from "lucide-react";
import { AnalysisSection } from '../product/analysis-section';
import { IngredientAnalysis } from '../product/ingredient-analysis';
import { HealthierAlternatives } from '../product/healthier-alternatives';
import { NutritionalImpact } from '../product/nutritional-impact';
import { ContributeSection } from './ContributeSection';
import { RatingSystem } from '../product/rating-system';
import { MenuBar } from '../ui/menu-bar';
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
      dietaryPreference: '',
      price: '',
      certification: ''
    },
    unfilteredProducts: [] // Store unfiltered products
  });
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedAnalysisProduct, setSelectedAnalysisProduct] = useState(null);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [showAllFeatured, setShowAllFeatured] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [tempFilters, setTempFilters] = useState({
    brand: '',
    healthRating: 0,
    category: '',
    dietaryPreference: '',
    price: '',
    certification: ''
  });

  const applyFilters = useCallback((products, filters) => {
    return products.filter(product => {
      // Brand filter (including more Indian and international brands)
      if (filters.brand && !product.brand?.toLowerCase().includes(filters.brand.toLowerCase())) {
        return false;
      }

      // Health rating filter
      if (filters.healthRating > 0 && product.healthRating < filters.healthRating) {
        return false;
      }

      // Category filter
      if (filters.category && filters.category !== 'all' && product.category?.toLowerCase() !== filters.category.toLowerCase()) {
        return false;
      }

      // Price range filter
      if (filters.price) {
        const price = parseFloat(product.price || 0);
        switch (filters.price) {
          case 'budget':
            if (price > 50) return false;
            break;
          case 'mid':
            if (price < 50 || price > 200) return false;
            break;
          case 'premium':
            if (price < 200) return false;
            break;
        }
      }

      // Certification filter
      if (filters.certification && !product.labels?.toLowerCase().includes(filters.certification.toLowerCase())) {
        return false;
      }

      // Dietary preference filter
      if (filters.dietaryPreference) {
        const ingredients = (product.ingredients || '').toLowerCase();
        switch (filters.dietaryPreference) {
          case 'vegetarian':
            return !ingredients.includes('meat') && !ingredients.includes('chicken') && !ingredients.includes('fish');
          case 'vegan':
            return !ingredients.includes('meat') && !ingredients.includes('milk') && !ingredients.includes('egg');
          case 'gluten-free':
            return !ingredients.includes('wheat') && !ingredients.includes('gluten');
          case 'keto':
            return product.nutriments?.carbohydrates_100g < 10;
          case 'low-sugar':
            return product.nutriments?.sugars_100g < 5;
          case 'organic':
            return product.labels?.toLowerCase().includes('organic');
          default:
            return true;
        }
      }

      return true;
    });
  }, []);

  // Effect to re-apply filters when they change
  useEffect(() => {
    if (state.unfilteredProducts.length > 0) {
      const filteredProducts = applyFilters(state.unfilteredProducts, state.filters);
      setState(prev => ({
        ...prev,
        products: filteredProducts,
        totalPages: Math.ceil(filteredProducts.length / 10)
      }));
    }
  }, [state.filters, state.unfilteredProducts, applyFilters]);

  const handleSearch = useCallback(async (searchResults) => {
    try {
      const results = await api.searchProducts(
        searchResults.query,
        1,
        state.filters,
        'relevance'
      );
      
      setState(prev => ({
        ...prev,
        products: results.products,
        unfilteredProducts: results.products,
        currentPage: results.currentPage,
        totalPages: results.totalPages,
        currentQuery: searchResults.query,
        isLoading: false,
        error: null
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error.message,
        isLoading: false
      }));
    }
  }, [state.filters]);

  const handlePageChange = useCallback(async (newPage) => {
    if (!state.currentQuery) return;

    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const results = await api.searchProducts(state.currentQuery, newPage);
      const filteredProducts = applyFilters(results.products, state.filters);
      setState(prev => ({
        ...prev,
        products: filteredProducts,
        unfilteredProducts: results.products,
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
  }, [state.currentQuery, state.filters, applyFilters]);

  useEffect(() => {
    if (!state.products.length && !state.isLoading) {
      setSelectedAnalysisProduct(null);
    }
  }, [state.products.length, state.isLoading]);

  const handleAnalysisSelect = useCallback((product) => {
    // Reset previous product state
    setSelectedProduct(null);
    setSelectedAnalysisProduct(product);
    
    // Scroll to analysis section with smooth behavior
    const analysisSection = document.getElementById('details');
    if (analysisSection) {
      // Clear any existing smooth scroll animations
      window.scrollTo({
        top: analysisSection.offsetTop - 100,
        behavior: 'instant'
      });
      // Then do the smooth scroll
      window.scrollTo({
        top: analysisSection.offsetTop - 100,
        behavior: 'smooth'
      });
    }
  }, []);

  const handleApplyFilters = async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const results = await api.searchProducts(
        state.currentQuery,
        1,
        tempFilters,
        'relevance'
      );
      
      setState(prev => ({
        ...prev,
        filters: { ...tempFilters },
        products: results.products,
        unfilteredProducts: results.products,
        currentPage: results.currentPage,
        totalPages: results.totalPages,
        isLoading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error.message,
        isLoading: false
      }));
    }
    setShowFilters(false);
  };

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const products = await api.getFeaturedProducts();
        setFeaturedProducts(products);
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
              resetQuery={state.products.length > 0}
            />

            {/* Enhanced Filters Section with Animation */}
            {state.products.length > 0 && (
              <div className="relative">
                <motion.button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Filter className="w-5 h-5 text-primary" />
                  <span className="font-medium text-primary">Filters</span>
                  <ChevronDown 
                    className={`w-5 h-5 text-primary transition-transform duration-200 ${
                      showFilters ? 'rotate-180' : ''
                    }`} 
                  />
                </motion.button>

                <AnimatePresence>
                  {showFilters && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ type: "spring", damping: 20 }}
                      className="absolute top-full mt-2 w-full bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 p-4 space-y-4 z-50"
                    >
                      {/* Brand Filter */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                          <Utensils className="w-4 h-4 text-blue-500" /> Brand
                        </label>
                        <select
                          value={tempFilters.brand}
                          onChange={(e) => setTempFilters(prev => ({
                            ...prev,
                            brand: e.target.value
                          }))}
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary/40"
                        >
                          <option value="">All Brands</option>
                          <option value="amul">Amul</option>
                          <option value="britannia">Britannia</option>
                          <option value="parle">Parle</option>
                          <option value="haldirams">Haldiram's</option>
                          <option value="mtr">MTR</option>
                          <option value="nestle">Nestle</option>
                          <option value="dabur">Dabur</option>
                          <option value="patanjali">Patanjali</option>
                          <option value="mother dairy">Mother Dairy</option>
                          <option value="cadbury">Cadbury</option>
                          <option value="heinz">Heinz</option>
                          <option value="kelloggs">Kellogg's</option>
                          <option value="quaker">Quaker</option>
                          <option value="tropicana">Tropicana</option>
                        </select>
                      </div>

                      {/* Category Filter */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                          <Tag className="w-4 h-4 text-purple-500" /> Category
                        </label>
                        <select
                          value={tempFilters.category}
                          onChange={(e) => setTempFilters(prev => ({
                            ...prev,
                            category: e.target.value
                          }))}
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary/40"
                        >
                          <option value="all">All Categories</option>
                          <option value="dairy">Dairy Products</option>
                          <option value="snacks">Snacks</option>
                          <option value="beverages">Beverages</option>
                          <option value="grains">Grains & Cereals</option>
                          <option value="fruits">Fruits & Vegetables</option>
                          <option value="meat">Meat & Poultry</option>
                          <option value="seafood">Seafood</option>
                          <option value="bakery">Bakery</option>
                          <option value="condiments">Condiments & Sauces</option>
                          <option value="frozen">Frozen Foods</option>
                          <option value="organic">Organic Foods</option>
                        </select>
                      </div>

                      {/* Health Rating Filter */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500" /> Health Rating
                        </label>
                        <select
                          value={tempFilters.healthRating}
                          onChange={(e) => setTempFilters(prev => ({
                            ...prev,
                            healthRating: Number(e.target.value)
                          }))}
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary/40"
                        >
                          <option value="0">All Health Ratings</option>
                          <option value="4.5">4.5+ Stars (Excellent)</option>
                          <option value="4">4+ Stars (Very Good)</option>
                          <option value="3.5">3.5+ Stars (Good)</option>
                          <option value="3">3+ Stars (Average)</option>
                        </select>
                      </div>

                      {/* Price Range Filter */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                          <DollarSign className="w-4 h-4 text-emerald-500" /> Price Range
                        </label>
                        <select
                          value={tempFilters.price}
                          onChange={(e) => setTempFilters(prev => ({
                            ...prev,
                            price: e.target.value
                          }))}
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary/40"
                        >
                          <option value="">All Prices</option>
                          <option value="budget">Budget (Under ₹50)</option>
                          <option value="mid">Mid-Range (₹50-₹200)</option>
                          <option value="premium">Premium (Above ₹200)</option>
                        </select>
                      </div>

                      {/* Dietary Preferences Filter */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                          <Leaf className="w-4 h-4 text-green-500" /> Dietary Preferences
                        </label>
                        <select
                          value={tempFilters.dietaryPreference}
                          onChange={(e) => setTempFilters(prev => ({
                            ...prev,
                            dietaryPreference: e.target.value
                          }))}
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary/40"
                        >
                          <option value="">All Dietary Preferences</option>
                          <option value="vegetarian">Vegetarian</option>
                          <option value="vegan">Vegan</option>
                          <option value="gluten-free">Gluten-Free</option>
                          <option value="keto">Keto-Friendly</option>
                          <option value="low-sugar">Low Sugar</option>
                          <option value="organic">Organic</option>
                        </select>
                      </div>

                      {/* Certification Filter */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                          <Shield className="w-4 h-4 text-indigo-500" /> Certification
                        </label>
                        <select
                          value={tempFilters.certification}
                          onChange={(e) => setTempFilters(prev => ({
                            ...prev,
                            certification: e.target.value
                          }))}
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary/40"
                        >
                          <option value="">All Certifications</option>
                          <option value="fssai">FSSAI Certified</option>
                          <option value="organic">Organic Certified</option>
                          <option value="iso">ISO Certified</option>
                          <option value="haccp">HACCP Certified</option>
                        </select>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-800">
                        <button
                          onClick={() => {
                            setTempFilters({
                              brand: '',
                              healthRating: 0,
                              category: '',
                              dietaryPreference: '',
                              price: '',
                              certification: ''
                            });
                          }}
                          className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                        >
                          Reset
                        </button>
                        <button
                          onClick={handleApplyFilters}
                          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                        >
                          Apply Filters
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

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
                    {featuredProducts.slice(0, showAllFeatured ? undefined : 8).map((product, index) => (
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
                            <span className="text-sm font-medium">{product.healthRating?.toFixed(1) || "N/A"}</span>
                          </div>
                        </div>

                        {/* Product Image */}
                        <div className="aspect-square w-full relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-6">
                          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent 
                            opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          <img
                            src={product.image_url || product.imageUrl || '/placeholder.png'}
                            alt={product.product_name || product.name}
                            className="w-full h-full object-contain transition-transform duration-300 
                              group-hover:scale-105"
                            onError={(e) => {
                              e.target.src = '/placeholder.png';
                              e.target.onerror = null;
                            }}
                          />
                        </div>

                        {/* Product Info */}
                        <div className="p-4 flex flex-col flex-grow">
                          <h3 className="font-medium text-gray-900 dark:text-white mb-1 line-clamp-2">
                            {product.product_name || product.name}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                            {product.brands || product.brand}
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
                  
                  {featuredProducts.length > 8 && (
                    <motion.button
                      onClick={() => setShowAllFeatured(!showAllFeatured)}
                      className="mt-8 mx-auto block px-6 py-2.5 rounded-lg border border-gray-200 
                        dark:border-gray-800 hover:border-primary/50 dark:hover:border-primary/50 
                        transition-colors duration-200 font-medium text-gray-700 dark:text-gray-300
                        hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {showAllFeatured ? 'Show Less' : `View More Products`}
                    </motion.button>
                  )}
                </section>
              </>
            ) : (
              <>
                {/* Back to Home button */}
                <div className="mb-6">
                  <button
                    onClick={() => setState(prev => ({
                      ...prev,
                      products: [],
                      unfilteredProducts: [],
                      currentPage: 1,
                      currentQuery: '',
                      error: null
                    }))}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    Back to Home
                  </button>
                </div>
                
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
          {(featuredProducts.length > 0 || selectedAnalysisProduct) && (
            <div id='details' className="mt-12 space-y-12 scroll-mt-8">
              <AnalysisSection product={selectedAnalysisProduct || featuredProducts[0]} />
              <IngredientAnalysis product={selectedAnalysisProduct || featuredProducts[0]} />
              <NutritionalImpact product={selectedAnalysisProduct || featuredProducts[0]} />
              
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

          <ContributeSection />
          <RatingSystem/>
        </div>
      </div>
    </>
  );
}