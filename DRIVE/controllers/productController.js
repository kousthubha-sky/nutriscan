const axios = require('axios');
const Product = require('../models/Product');
const calculateHealthRating = require('../utils/healthRating');

// Create an axios instance with custom config
const api = axios.create({
  timeout: 10000, // 10 second timeout
  retry: 2,
  retryDelay: 1000
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
  try {
    const { q: query, page = 1, limit = 24, sortBy = 'relevance', filters = {} } = req.query;
    console.log('Search request:', { query, page, sortBy, filters });

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please enter a valid search term'
      });
    }

    const skip = (parseInt(page) - 1) * limit;
    const sanitizedQuery = escapeRegExp(query.trim());

    // Build base search query
    let searchQuery = {
      $or: [
        { name: new RegExp(sanitizedQuery, 'i') },
        { brand: new RegExp(sanitizedQuery, 'i') },
        { category: new RegExp(sanitizedQuery, 'i') },
        { barcode: new RegExp(sanitizedQuery, 'i') }
      ]
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
      if (filters.dietaryPreference) {
        switch (filters.dietaryPreference) {
          case 'vegetarian':
            searchQuery.ingredients = { $not: /meat|chicken|fish/i };
            break;
          case 'vegan':
            searchQuery.ingredients = { $not: /meat|milk|egg|honey/i };
            break;
          case 'gluten-free':
            searchQuery.ingredients = { $not: /wheat|gluten/i };
            break;
          case 'keto':
            searchQuery['nutriments.carbohydrates_100g'] = { $lt: 10 };
            break;
          case 'low-sugar':
            searchQuery['nutriments.sugars_100g'] = { $lt: 5 };
            break;
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
      Product.countDocuments(searchQuery)
    ]);

    // Update search count for retrieved products
    if (localResults.length > 0) {
      const productIds = localResults.map(p => p._id);
      await Product.updateMany(
        { _id: { $in: productIds } },
        { $inc: { searchCount: 1 } }
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
            json: 1
          }
        });

        apiProducts = (apiResponse.data.products || [])
          .filter(p => !localResults.some(local => local.barcode === p.code))
          .map(p => {
            const healthAnalysis = calculateHealthRating({
              ingredients: p.ingredients_text || '',
              nutriments: p.nutriments,
              nutriscore_grade: p.nutriscore_grade
            });

            return {
              barcode: p.code,
              name: p.product_name || 'Unknown Product',
              brand: p.brands || 'Unknown Brand',
              imageUrl: p.image_url || p.image_small_url || p.image_thumb_url,
              category: p.categories?.split(',')[0]?.trim(),
              description: p.generic_name || p.product_name,
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
                salt_100g: p.nutriments?.salt_100g
              },
              nutriscore_grade: p.nutriscore_grade,
              healthRating: healthAnalysis.score,
              healthAnalysis: healthAnalysis.analysis,
              healthRatingLabel: healthAnalysis.rating,
              healthRatingColor: healthAnalysis.color,
              source: 'api',
              lastFetched: new Date()
            };
          });

        // Store new API products in background
        if (apiProducts.length > 0) {
          const bulkOps = apiProducts.map(product => ({
            updateOne: {
              filter: { barcode: product.barcode },
              update: { $set: { ...product } },
              upsert: true
            }
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
        api: apiProducts.length
      }
    });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      error: 'Search failed',
      details: error.message
    });
  }
};

exports.getFeaturedProducts = async (req, res) => {
  try {
    const categories = ['oats', 'nuts', 'yogurt', 'fruits', 'vegetables'];
    const results = await Product.find({
      $or: [
        { category: { $in: categories.map(cat => new RegExp(cat, 'i')) } },
        { healthRating: { $gte: 3.0 } }
      ]
    })
    .sort({ healthRating: -1, searchCount: -1 })
    .limit(12)
    .lean();

    res.json({
      success: true,
      products: results
    });
  } catch (error) {
    console.error('Failed to fetch featured products:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch featured products'
    });
  }
};

exports.getHealthierAlternatives = async (req, res) => {
  try {
    console.log('Received alternatives request:', { query: req.query, body: req.body });
    
    const { category, healthRating = 3.0 } = req.query;
    const minHealthRating = parseFloat(healthRating);
    const productData = req.body;
    
    if (!productData) {
      console.log('Missing product data');
      return res.status(400).json({
        success: false,
        error: 'Product data is required'
      });
    }

    // Build sophisticated query
    const mainQuery = {
      // Exclude the current product
      ...(productData._id && { _id: { $ne: productData._id } }),
      // Base health rating criteria
      healthRating: { $gt: minHealthRating }
    };
    
    console.log('Built query:', mainQuery);
    
    // Category matching with related categories
    if (category && category !== 'All Categories') {
      const categoryTerms = category.toLowerCase().split(/[,\s]+/);
      const relatedCategories = categoryTerms.flatMap(term => [
        new RegExp(term, 'i'),
        new RegExp(`${term}.*`, 'i'),
        new RegExp(`.*${term}`, 'i')
      ]);
      
      // Create nutritional profile matcher
      const nutrientRanges = {};
      if (productData.nutriments) {
        const NUTRIENT_TOLERANCE = 0.2; // 20% tolerance
        ['proteins_100g', 'fiber_100g', 'sugars_100g', 'fat_100g'].forEach(nutrient => {
          const value = productData.nutriments[nutrient];
          if (value) {
            nutrientRanges[`nutriments.${nutrient}`] = {
              $gte: value * (1 - NUTRIENT_TOLERANCE),
              $lte: value * (1 + NUTRIENT_TOLERANCE)
            };
          }
        });
      }

      // Combine category and nutritional matching
      mainQuery.$or = [
        { category: { $in: relatedCategories } },
        ...Object.entries(nutrientRanges).map(([nutrient, range]) => ({ [nutrient]: range }))
      ];
    }

    console.log('Finding alternatives with query:', JSON.stringify(mainQuery, null, 2));

    // Find alternatives with sophisticated sorting
    const alternatives = await Product.find(mainQuery)
      .sort({ 
        healthRating: -1,
        searchCount: -1,
        'nutriments.proteins_100g': -1,
        'nutriments.fiber_100g': -1
      })
      .limit(6)
      .lean();

    console.log(`Found ${alternatives.length} initial alternatives`);

    if (!alternatives.length) {
      console.log('No strict matches found, trying broader search');
      // If no alternatives found with strict criteria, try a broader search
      const broadQuery = {
        _id: { $ne: productData._id },
        healthRating: { $gt: minHealthRating }
      };

      const broadAlternatives = await Product.find(broadQuery)
        .sort({ healthRating: -1 })
        .limit(6)
        .lean();

      console.log(`Found ${broadAlternatives.length} broad alternatives`);

      if (broadAlternatives.length) {
        const results = broadAlternatives.map(alt => {
          const relevanceScore = calculateRelevanceScore(alt, productData);
          const nutritionalImprovement = calculateNutritionalImprovement(alt, productData);
          
          return {
            ...alt,
            tag: alt.healthRating >= 4.5 ? "Healthiest Choice" :
                 alt.healthRating >= 4.0 ? "Healthy Choice" :
                 "Better Choice",
            relevanceScore,
            nutritionalImprovement,
            description: generateAlternativeDescription(alt, nutritionalImprovement)
          };
        });

        return res.json({
          success: true,
          alternatives: results
        });
      }
    }

    // Calculate similarity scores and enhance results
    const results = alternatives.map(alt => {
      const relevanceScore = calculateRelevanceScore(alt, productData);
      const nutritionalImprovement = calculateNutritionalImprovement(alt, productData);
      
      return {
        ...alt,
        tag: alt.healthRating >= 4.5 ? "Healthiest Choice" :
             alt.healthRating >= 4.0 ? "Healthy Choice" :
             "Better Choice",
        relevanceScore,
        nutritionalImprovement,
        description: generateAlternativeDescription(alt, nutritionalImprovement)
      };
    });

    // Sort by relevance and improvement
    results.sort((a, b) => (
      (b.relevanceScore + b.nutritionalImprovement) - 
      (a.relevanceScore + a.nutritionalImprovement)
    ));

    console.log(`Returning ${results.length} alternatives`);

    res.json({
      success: true,
      alternatives: results
    });
  } catch (error) {
    console.error('Failed to fetch healthier alternatives:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch healthier alternatives',
      details: error.message
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
    fat_100g: { weight: 0.2, preferHigher: false }
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
    const altIngredients = alternative.ingredients.toLowerCase();
    const origIngredients = originalProduct.ingredients.toLowerCase();
    
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
  'lijjat', 'bikano', 'aashirvaad', 'godrej'
];

exports.getIndianProducts = async (req, res) => {
  try {
    const { page = 1, limit = 12 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = {
      $or: [
        { brand: { $in: INDIAN_BRANDS.map(brand => new RegExp(brand, 'i')) } },
        { category: { $in: ['indian', 'masala', 'curry', 'spices'].map(cat => new RegExp(cat, 'i')) } }
      ]
    };

    const [products, total] = await Promise.all([
      Product.find(query)
        .sort({ healthRating: -1, searchCount: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Product.countDocuments(query)
    ]);

    res.json({
      success: true,
      products,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      total
    });
  } catch (error) {
    console.error('Failed to fetch Indian products:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch Indian products'
    });
  }
};

// Update health ratings for products
async function updateHealthRatings() {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const productsToUpdate = await Product.find({
      $or: [
        { lastFetched: { $lt: thirtyDaysAgo } },
        { healthRating: { $exists: false } },
        { healthRating: null }
      ]
    }).limit(100);

    for (const product of productsToUpdate) {
      const healthAnalysis = calculateHealthRating({
        ingredients: Array.isArray(product.ingredients) ? product.ingredients.join(', ') : product.ingredients,
        nutriments: product.nutriments,
        nutriscore_grade: product.nutriscore_grade,
        name: product.name,
        category: product.category
      });

      await Product.updateOne(
        { _id: product._id },
        {
          $set: {
            healthRating: healthAnalysis.score,
            healthAnalysis: healthAnalysis.analysis,
            healthRatingLabel: healthAnalysis.rating,
            healthRatingColor: healthAnalysis.color,
            lastFetched: new Date()
          }
        }
      );
    }

    console.log(`Updated health ratings for ${productsToUpdate.length} products`);
  } catch (error) {
    console.error('Error updating health ratings:', error);
  }
}

// Run health rating updates every 12 hours
setInterval(updateHealthRatings, 12 * 60 * 60 * 1000);

// Run initial update
updateHealthRatings();