const axios = require('axios');
const mongoose = require('mongoose');
const Product = require('../models/Product');
const calculateHealthRating = require('../utils/healthRating');
const healthRatingCache = require('../utils/cacheService').HealthRatingCache;

// Create an axios instance with custom config
const api = axios.create({
  timeout: 10000, // 10 second timeout
  retry: 2,
  retryDelay: 1000,
});

// Add a retry interceptor
api.interceptors.response.use(undefined, async (err) => {
  const { config } = err;
  if (!config || !config.retry) {
    return Promise.reject(err);
  }
  
  config.retry -= 1;
  if (config.retry === 0) {
    return Promise.reject(err);
  }

  // Add backoff delay
  await new Promise(resolve => setTimeout(resolve, config.retryDelay));
  return api.request(config);
});

function escapeRegExp(string) {
  if (!string) return '';
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

exports.searchProducts = async (req, res) => {
  const limit = 10;
  try {
    const { q: query, page = 1, filters = {}, sortBy = 'relevance' } = req.query;
    console.log('Search request:', { query, page, sortBy, filters });

    // Relaxed validation - allow minimum 1 character
    if (!query || typeof query !== 'string' || query.trim().length === 0)  {
      return res.status(400).json({
        success: false,
        error: 'Please enter a valid search term',
      });
    }

    const skip = (parseInt(page) - 1) *parseInt(limit);
    const sanitizedQuery = escapeRegExp(query.trim());

    // Build base search query
    let searchQuery = {
      $or: [
        { name: new RegExp(sanitizedQuery, 'i') },
        { brand: new RegExp(sanitizedQuery, 'i') },
        { category: new RegExp(sanitizedQuery, 'i') },
        { barcode: new RegExp(sanitizedQuery, 'i') },
      ],
    };

    // Apply filters if provided
    if (typeof filters === 'object') {
      if (filters.brand) {
        searchQuery.brand = new RegExp(filters.brand, 'i');
      }
      if (filters.category && filters.category !== 'all') {
        searchQuery.category = new RegExp(filters.category, 'i');
      }
      if (filters.healthRating > 0) {
        searchQuery.healthRating = { $gte: parseFloat(filters.healthRating) };
      }

      // Handle filter chips (dietary preferences)
      if (filters.dietary && Array.isArray(filters.dietary)) {
        const dietaryFilters = filters.dietary.map(pref => {
          switch (pref) {
            case 'gluten-free':
              return { ingredients: { $not: /wheat|gluten/i } };
            case 'no preservatives':
              return { ingredients: { $not: /preservative|sulfite|nitrite|bha|bht/i } };
            case 'vegan':
              return { ingredients: { $not: /meat|milk|egg|honey|gelatin/i } };
            case 'organic':
              return { $or: [
                { labels: /organic/i },
                { name: /organic/i },
              ] };
            case 'low sugar':
              return { 'nutriments.sugars_100g': { $lt: 5 } };
            case 'high protein':
              return { 'nutriments.proteins_100g': { $gt: 10 } };
            case 'no artificial colors':
              return { ingredients: { $not: /artificial color|food coloring|red 40|yellow 5|blue 1/i } };
            case 'whole grain':
              return { ingredients: /whole grain|whole wheat|whole oat/i };
            case 'dairy-free':
              return { ingredients: { $not: /milk|cream|cheese|yogurt|butter/i } };
            case 'low fat':
              return { 'nutriments.fat_100g': { $lt: 3 } };
            default:
              return {};
          }
        });
        if (dietaryFilters.length > 0) {
          searchQuery.$and = searchQuery.$and || [];
          searchQuery.$and.push(...dietaryFilters);
        }
      }

      if (filters.price) {
        const priceQuery = {};
        switch (filters.price) {
          case 'budget':
            priceQuery.$lte = 50;
            break;
          case 'mid':
            priceQuery.$gt = 50;
            priceQuery.$lte = 200;
            break;
          case 'premium':
            priceQuery.$gt = 200;
            break;
        }
        if (Object.keys(priceQuery).length > 0) {
          searchQuery.price = priceQuery;
        }
      }
      if (filters.certification) {
        searchQuery.labels = new RegExp(filters.certification, 'i');
      }
    }

    // Determine sort order
    let sortOptions = { searchCount: -1, lastFetched: -1 };
    switch (sortBy) {
      case 'health':
        sortOptions = { healthRating: -1, ...sortOptions };
        break;
      case 'popularity':
        sortOptions = { searchCount: -1, healthRating: -1 };
        break;
      case 'price-low':
        sortOptions = { price: 1, ...sortOptions };
        break;
      case 'price-high':
        sortOptions = { price: -1, ...sortOptions };
        break;
      default:
        // Default relevance sorting
        break;
    }

    // Execute search query
    const [localResults, totalCount] = await Promise.all([
      Product.find(searchQuery)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(searchQuery),
    ]);

    // Update search count for retrieved products
    if (localResults.length > 0) {
      const productIds = localResults.map(p => p._id);
      await Product.updateMany(
        { _id: { $in: productIds } },
        { $inc: { searchCount: 1 } },
      );
    }

    // Only fetch from API if local results are insufficient
    let apiProducts = [];
    if (localResults.length < limit) {
      try {
        const apiResponse = await api.get('https://world.openfoodfacts.org/cgi/search.pl', {
          params: {
            search_terms: sanitizedQuery,
            page_size: limit - localResults.length,
            page: 1,
            json: 1,
          },
        });

        apiProducts = (apiResponse.data.products || [])
          .filter(p => !localResults.some(local => local.barcode === p.code))
          .map(p => {
            const healthAnalysis = calculateHealthRating({
              ingredients: p.ingredients_text || '',
              nutriments: p.nutriments,
              nutriscore_grade: p.nutriscore_grade,
            });

            return {
              barcode: p.code,
              name: p.product_name || 'Unknown Product',
              brand: p.brands || 'Unknown Brand',
              imageUrl: p.image_url || p.image_small_url || p.image_thumb_url,
              category: p.categories?.split(',')[0]?.trim(),
              description: p.generic_name || p.product_name,
              genericName: p.generic_name,
              ingredients: p.ingredients_text ? p.ingredients_text.split(',').map(i => i.trim()).filter(Boolean) : [],
              labels: p.labels || '',
              allergens: p.allergens ? p.allergens.split(',').map(a => a.trim()).filter(Boolean) : [],
              nutriments: {
                energy_kcal_100g: p.nutriments?.energy_kcal_100g,
                carbohydrates_100g: p.nutriments?.carbohydrates_100g,
                sugars_100g: p.nutriments?.sugars_100g,
                fat_100g: p.nutriments?.fat_100g,
                saturated_fat_100g: p.nutriments?.saturated_fat_100g,
                proteins_100g: p.nutriments?.proteins_100g,
                fiber_100g: p.nutriments?.fiber_100g,
                salt_100g: p.nutriments?.salt_100g,
              },
              nutriscore_grade: p.nutriscore_grade,
              healthRating: healthAnalysis.score,
              healthAnalysis: healthAnalysis.analysis,
              healthRatingLabel: healthAnalysis.rating,
              healthRatingColor: healthAnalysis.color,
              source: 'api',
              lastFetched: new Date(),
            };
          });

        // Store new API products in background
        if (apiProducts.length > 0) {
          const bulkOps = apiProducts.map(product => ({
            updateOne: {
              filter: { barcode: product.barcode },
              update: { $set: { ...product } },
              upsert: true,
            },
          }));

          try {
            await Product.bulkWrite(bulkOps);
          } catch (error) {
            console.error('Error storing products:', error);
          }
        }
      } catch (error) {
        console.error('API fetch error:', error);
      }
    }

    // Combine and sort all results
    const combinedProducts = [...localResults, ...apiProducts].slice(0, limit);
    
    // Sort combined results based on filters
    const sortedProducts = combinedProducts.sort((a, b) => {
      switch (sortBy) {
        case 'health':
          return b.healthRating - a.healthRating;
        case 'popularity':
          return b.searchCount - a.searchCount;
        case 'price-low':
          return (a.price || 0) - (b.price || 0);
        case 'price-high':
          return (b.price || 0) - (a.price || 0);
        default:
          return b.searchCount - a.searchCount;
      }
    });

    // Calculate pagination
    const totalPages = Math.ceil(Math.max(totalCount, localResults.length + apiProducts.length) / limit);

    res.json({
      success: true,
      products: sortedProducts,
      currentPage: parseInt(page),
      totalPages,
      total: totalCount,
      sources: {
        local: localResults.length,
        api: apiProducts.length,
      },
    });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      error: 'Search failed',
      details: error.message,
    });
  }
};

exports.getFeaturedProducts = async (req, res) => {
  try {
    const categories = ['oats', 'nuts', 'yogurt', 'fruits', 'vegetables'];
    const results = await Product.find({
      $or: [
        { category: { $in: categories.map(cat => new RegExp(cat, 'i')) } },
        { healthRating: { $gte: 3.0 } },
      ],
    })
      .sort({ healthRating: -1, searchCount: -1 })
      .limit(12)
      .lean();

    res.json({
      success: true,
      products: results,
    });
  } catch (error) {
    console.error('Failed to fetch featured products:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch featured products',
    });
  }
};

exports.getHealthierAlternatives = async (req, res) => {
  try {
    const { category, healthRating = 3.0 } = req.query;
    const productData = req.body;
    
    if (!productData) {
      return res.status(400).json({
        success: false,
        error: 'Missing product data',
      });
    }

    // Generate cache key for alternatives query
    const cacheKey = `alternatives:${category}:${healthRating}:${productData._id}`;
    const cachedAlternatives = healthRatingCache.get({ _id: cacheKey });

    if (cachedAlternatives) {
      return res.json({
        success: true,
        alternatives: cachedAlternatives,
        fromCache: true,
      });
    }

    // Rest of the existing getHealthierAlternatives logic...
    const minHealthRating = parseFloat(healthRating);
    
    // Build base query
    const mainQuery = {
      healthRating: { $gt: Math.max(minHealthRating, productData.healthRating || 3.0) },
    };

    // Add ID exclusion if provided
    if (productData._id) {
      try {
        mainQuery._id = { $ne: new mongoose.Types.ObjectId(productData._id) };
      } catch (error) {
        console.warn('Invalid ObjectId for product exclusion:', productData._id);
      }
    }

    // Add category matching if available
    if (category && category !== 'All Categories') {
      const categoryTerms = category.toLowerCase().split(/[,\s]+/);
      const categoryPatterns = categoryTerms.map(term => new RegExp(term, 'i'));
      mainQuery.category = { $in: categoryPatterns };
    }

    // Add nutritional profile matching if available
    if (productData.nutriments) {
      const nutrientRanges = {};
      const NUTRIENT_TOLERANCE = 0.3; // 30% tolerance for nutrient matching

      // Check key nutrients
      ['proteins_100g', 'fiber_100g', 'sugars_100g', 'fat_100g'].forEach(nutrient => {
        const value = productData.nutriments[nutrient];
        if (value) {
          // For positive nutrients (protein, fiber), look for higher values
          if (nutrient === 'proteins_100g' || nutrient === 'fiber_100g') {
            nutrientRanges[`nutriments.${nutrient}`] = { $gte: value };
          }
          // For negative nutrients (sugars, fat), look for lower values
          else {
            nutrientRanges[`nutriments.${nutrient}`] = { $lte: value };
          }
        }
      });

      // Add nutritional criteria to query
      if (Object.keys(nutrientRanges).length > 0) {
        mainQuery.$or = [
          // Match either by category or by nutritional profile
          { category: mainQuery.category },
          nutrientRanges,
        ];
        delete mainQuery.category; // Remove from main query since it's in $or
      }
    }

    console.log('Finding alternatives with query:', JSON.stringify(mainQuery, null, 2));

    // Find alternatives
    const alternatives = await Product.find(mainQuery)
      .sort({ 
        healthRating: -1,
        'nutriments.proteins_100g': -1,
        'nutriments.fiber_100g': -1,
      })
      .limit(6)
      .lean();

    console.log(`Found ${alternatives.length} alternatives`);

    if (alternatives.length === 0) {
      console.log('No matches found, trying broader search');
      // Try a broader search focusing only on health rating
      const broadQuery = {
        _id: { $ne: productData._id },
        healthRating: { $gt: minHealthRating },
      };

      const broadAlternatives = await Product.find(broadQuery)
        .sort({ healthRating: -1 })
        .limit(6)
        .lean();

      console.log(`Found ${broadAlternatives.length} broad alternatives`);

      if (broadAlternatives.length > 0) {
        const results = broadAlternatives.map(alt => {
          const relevanceScore = calculateRelevanceScore(alt, productData);
          const nutritionalImprovement = calculateNutritionalImprovement(alt, productData);
          
          return {
            ...alt._doc || alt,
            tag: alt.healthRating >= 4.5 ? 'Healthiest Choice' :
              alt.healthRating >= 4.0 ? 'Healthy Choice' :
                'Better Choice',
            relevanceScore,
            nutritionalImprovement,
            description: generateAlternativeDescription(alt, nutritionalImprovement),
          };
        });

        // Cache the results before sending
        healthRatingCache.set({ _id: cacheKey }, results);

        return res.json({
          success: true,
          alternatives: results,
          fromCache: false,
        });
      }
    }

    // Process and return the alternatives with scores
    const results = alternatives.map(alt => {
      const relevanceScore = calculateRelevanceScore(alt, productData);
      const nutritionalImprovement = calculateNutritionalImprovement(alt, productData);
      
      return {
        ...alt._doc || alt,
        tag: alt.healthRating >= 4.5 ? 'Healthiest Choice' :
          alt.healthRating >= 4.0 ? 'Healthy Choice' :
            'Better Choice',
        relevanceScore,
        nutritionalImprovement,
        description: generateAlternativeDescription(alt, nutritionalImprovement),
      };
    });

    // Sort by combined score
    results.sort((a, b) => (
      (b.relevanceScore + b.nutritionalImprovement) - 
      (a.relevanceScore + a.nutritionalImprovement)
    ));

    // Cache the results before sending
    healthRatingCache.set({ _id: cacheKey }, results);

    console.log(`Returning ${results.length} alternatives`);

    res.json({
      success: true,
      alternatives: results,
      fromCache: false,
    });
  } catch (error) {
    console.error('Failed to fetch healthier alternatives:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch healthier alternatives',
      details: error.message,
    });
  }
};

// Helper function to calculate nutritional improvement
function calculateNutritionalImprovement(alternative, originalProduct) {
  if (!originalProduct?.nutriments) return 0;
  
  let improvement = 0;
  const nutrients = {
    proteins_100g: { weight: 0.3, preferHigher: true },
    fiber_100g: { weight: 0.3, preferHigher: true },
    sugars_100g: { weight: 0.2, preferHigher: false },
    fat_100g: { weight: 0.2, preferHigher: false },
  };

  Object.entries(nutrients).forEach(([nutrient, { weight, preferHigher }]) => {
    const original = originalProduct.nutriments[nutrient] || 0;
    const alternative_value = alternative.nutriments?.[nutrient] || 0;
    
    if (preferHigher) {
      improvement += (alternative_value > original) ? weight : 0;
    } else {
      improvement += (alternative_value < original) ? weight : 0;
    }
  });

  return improvement;
}

// Helper function to generate alternative description
function generateAlternativeDescription(alternative, improvement) {
  const improvements = [];
  
  if (alternative.nutriments?.proteins_100g > 5) {
    improvements.push('higher in protein');
  }
  if (alternative.nutriments?.fiber_100g > 3) {
    improvements.push('rich in fiber');
  }
  if (alternative.nutriments?.sugars_100g < 5) {
    improvements.push('lower in sugar');
  }
  
  if (improvements.length > 0) {
    return `A healthier alternative that's ${improvements.join(', ')}.`;
  }
  
  return `A better choice with a health rating of ${alternative.healthRating.toFixed(1)}.`;
}

// Helper function to calculate relevance score
function calculateRelevanceScore(alternative, originalProduct) {
  if (!originalProduct) return 1;
  
  let score = 1;
  
  // Category match bonus
  if (alternative.category && originalProduct.category) {
    if (alternative.category.toLowerCase() === originalProduct.category.toLowerCase()) {
      score += 0.5;
    }
  }
  
  // Nutritional profile similarity
  if (alternative.nutriments && originalProduct.nutriments) {
    const nutrients = ['proteins_100g', 'fiber_100g', 'sugars_100g', 'fat_100g'];
    nutrients.forEach(nutrient => {
      const altValue = alternative.nutriments[nutrient] || 0;
      const origValue = originalProduct.nutriments[nutrient] || 0;
      const diff = Math.abs(altValue - origValue);
      
      // Add bonus for similar nutritional values
      if (diff <= 2) score += 0.1;
      
      // Add bonus for better nutritional values
      if ((nutrient.includes('protein') || nutrient.includes('fiber')) && altValue > origValue) {
        score += 0.1;
      }
      if ((nutrient.includes('sugar') || nutrient.includes('fat')) && altValue < origValue) {
        score += 0.1;
      }
    });
  }
  
  // Special ingredients matching
  if (alternative.ingredients && originalProduct.ingredients) {
    // Handle different ingredient formats (string or array)
    const getIngredientsString = (ingredients) => {
      if (typeof ingredients === 'string') return ingredients;
      if (Array.isArray(ingredients)) {
        return ingredients
          .map(ing => typeof ing === 'object' ? ing.text || ing.name || '' : ing)
          .join(' ');
      }
      return '';
    };

    const altIngredients = getIngredientsString(alternative.ingredients).toLowerCase();
    const origIngredients = getIngredientsString(originalProduct.ingredients).toLowerCase();
    
    // Common healthy ingredients bonus
    const healthyIngredients = ['whole grain', 'oats', 'quinoa', 'nuts', 'seeds'];
    healthyIngredients.forEach(ingredient => {
      if (altIngredients.includes(ingredient)) {
        score += 0.1;
      }
    });
  }
  
  return Math.min(2, score);
}

// Add Indian brands list
const INDIAN_BRANDS = [
  'amul', 'britannia', 'parle', 'haldirams', 'mtr', 'dabur', 
  'patanjali', 'mother dairy', 'tata', 'itc', 'nestle india', 
  'himalaya', 'fortune', 'bikaji', 'vadilal', 'everest', 
  'lijjat', 'bikano', 'aashirvaad', 'godrej',
];

exports.getIndianProducts = async (req, res) => {
  try {
    const { page = 1, limit = 12 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = {
      $or: [
        { brand: { $in: INDIAN_BRANDS.map(brand => new RegExp(brand, 'i')) } },
        { category: { $in: ['indian', 'masala', 'curry', 'spices'].map(cat => new RegExp(cat, 'i')) } },
      ],
    };

    const [products, total] = await Promise.all([
      Product.find(query)
        .sort({ healthRating: -1, searchCount: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Product.countDocuments(query),
    ]);

    res.json({
      success: true,
      products,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      total,
    });
  } catch (error) {
    console.error('Failed to fetch Indian products:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch Indian products',
    });
  }
};

// Update health ratings for products with caching
async function updateHealthRatings() {
  try {
    const batchSize = 50;
    const updateInterval = 24 * 60 * 60 * 1000;
    const priorityUpdateInterval = 12 * 60 * 60 * 1000;
    
    const productsToUpdate = await Product.find({
      $or: [
        { lastFetched: { $lt: new Date(Date.now() - updateInterval) } },
        { 
          $or: [
            { healthRating: { $exists: false } },
            { healthRating: null },
            { healthRating: 3.0 },
          ],
          lastFetched: { $lt: new Date(Date.now() - priorityUpdateInterval) },
        },
        {
          $and: [
            { healthRating: { $exists: true } },
            { healthAnalysis: { $exists: false } },
          ],
        },
      ],
    })
      .sort({ lastFetched: 1 })
      .limit(batchSize);

    let updatedCount = 0;
    let errorCount = 0;
    let cacheHits = 0;
    const updateResults = {
      success: [],
      failures: [],
      cacheStats: null,
    };

    for (const product of productsToUpdate) {
      try {
        // Check cache first
        let healthAnalysis = healthRatingCache.get(product);
        let usedCache = false;

        if (!healthAnalysis) {
          // Calculate new health rating if not in cache
          const processedIngredients = Array.isArray(product.ingredients) 
            ? product.ingredients.join(', ') 
            : typeof product.ingredients === 'string' 
              ? product.ingredients 
              : '';

          healthAnalysis = calculateHealthRating({
            ingredients: processedIngredients,
            nutriments: product.nutriments || {},
            nutriscore_grade: product.nutriscore_grade,
            name: product.name,
            category: product.category,
          });

          // Cache the result
          healthRatingCache.set(product, healthAnalysis);
        } else {
          usedCache = true;
          cacheHits++;
        }

        // Check if rating has changed significantly
        const ratingChanged = !product.healthRating || 
          Math.abs(product.healthRating - healthAnalysis.score) >= 0.5;

        // Update product with new rating
        await Product.updateOne(
          { _id: product._id },
          {
            $set: {
              healthRating: healthAnalysis.score,
              healthAnalysis: healthAnalysis.analysis,
              healthRatingLabel: healthAnalysis.rating,
              healthRatingColor: healthAnalysis.color,
              confidence: healthAnalysis.confidence,
              dataCompleteness: healthAnalysis.dataCompleteness,
              lastFetched: new Date(),
              ratingChanged: ratingChanged,
              lastSignificantUpdate: ratingChanged ? new Date() : product.lastSignificantUpdate,
              cacheHit: usedCache,
            },
          },
        );

        updateResults.success.push({
          id: product._id,
          oldScore: product.healthRating,
          newScore: healthAnalysis.score,
          changed: ratingChanged,
          fromCache: usedCache,
        });
        updatedCount++;
      } catch (error) {
        console.error(`Error updating health rating for product ${product._id}:`, error);
        updateResults.failures.push({
          id: product._id,
          error: error.message,
        });
        errorCount++;
      }
    }

    // Get cache statistics
    updateResults.cacheStats = healthRatingCache.getStats();

    console.log(`Updated health ratings for ${updatedCount} products (${cacheHits} cache hits) with ${errorCount} errors`);
    console.log('Update results:', JSON.stringify(updateResults, null, 2));
    
    return {
      success: true,
      updatedCount,
      errorCount,
      cacheHits,
      results: updateResults,
    };
  } catch (error) {
    console.error('Error in health rating update process:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// Add cache cleanup on interval
setInterval(() => {
  const stats = healthRatingCache.getStats();
  if (stats.expiredEntries > 0) {
    console.log(`Clearing ${stats.expiredEntries} expired cache entries`);
    // Clear expired entries by forcing a get() on all entries
    // This will trigger the expiration check and cleanup
    [...healthRatingCache.cache.keys()].forEach(key => healthRatingCache.get({ _id: key }));
  }
}, 60 * 60 * 1000); // Run every hour

// Run health rating updates every 6 hours
setInterval(updateHealthRatings, 6 * 60 * 60 * 1000);

// Run initial update
updateHealthRatings();
