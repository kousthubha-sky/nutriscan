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
    const { q: query, page = 1 } = req.query;
    console.log('Search request:', { query, page });

    // Enhanced validation
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      console.log('Invalid search query:', { query });
      return res.status(400).json({
        success: false,
        error: 'Please enter a valid search term',
        debug: {
          receivedQuery: query,
          queryType: typeof query,
          trimmedLength: query?.trim()?.length
        }
      });
    }

    const limit = 10;
    const skip = (parseInt(page) - 1) * limit;
    const sanitizedQuery = escapeRegExp(query.trim());

    // Additional validation log
    console.log('Processed query:', {
      original: query,
      sanitized: sanitizedQuery,
      page: page,
      limit: limit,
      skip: skip
    });

    // Only proceed with API call if we have a valid query
    if (sanitizedQuery.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Search term must be at least 2 characters long'
      });
    }

    // First, try to get results from local database
    let localResults = await Product.find({
      $or: [
        { name: new RegExp(sanitizedQuery, 'i') },
        { brand: new RegExp(sanitizedQuery, 'i') },
        { category: new RegExp(sanitizedQuery, 'i') }
      ]
    })
    .sort({ searchCount: -1 })
    .skip(skip)
    .limit(limit * 2) // Fetch extra for better coverage
    .lean();

    // Update search count for retrieved products
    if (localResults.length > 0) {
      const productIds = localResults.map(p => p._id);
      await Product.updateMany(
        { _id: { $in: productIds } },
        { $inc: { searchCount: 1 } }
      );
    }

    let apiProducts = [];
    let apiError = null;

    // Try to fetch from API only if we don't have enough local results
    if (localResults.length < limit) {
      try {
        const apiResponse = await api.get('https://world.openfoodfacts.org/cgi/search.pl', {
          params: {
            search_terms: sanitizedQuery,
            page_size: 24,
            page: page,
            json: 1
          }
        });

        console.log('API Response stats:', {
          totalProducts: apiResponse.data.count,
          receivedProducts: apiResponse.data.products?.length,
          page: apiResponse.data.page,
          pageSize: apiResponse.data.page_size
        });

        // Enhanced product mapping
        apiProducts = (apiResponse.data.products || []).map(p => {
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
            ingredients: p.ingredients_text || '',
            labels: p.labels || '',
            allergens: p.allergens || '',
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
            lastFetched: new Date()
          };
        });

      } catch (error) {
        console.error('API fetch error:', error);
        apiError = error;
      }
    }

    // Store new API products in background
    if (apiProducts.length > 0) {
      const bulkOps = apiProducts.map(product => ({
        updateOne: {
          filter: { barcode: product.barcode },
          update: { 
            $set: product,
            $inc: { searchCount: 1 }
          },
          upsert: true
        }
      }));

      try {
        await Product.bulkWrite(bulkOps);
      } catch (error) {
        console.error('Error storing products:', error);
      }
    }

    // Combine and deduplicate results
    const seenBarcodes = new Set();
    const combinedProducts = [
      ...apiProducts,
      ...localResults
    ].filter(p => {
      if (seenBarcodes.has(p.barcode)) return false;
      seenBarcodes.add(p.barcode);
      return true;
    });

    // Return results with offline indicator
    res.json({
      success: true,
      products: combinedProducts.slice(0, limit),
      currentPage: parseInt(page),
      totalPages: Math.ceil(combinedProducts.length / limit),
      total: combinedProducts.length,
      isOfflineResults: apiError !== null && localResults.length > 0,
      sources: {
        local: localResults.length,
        api: apiProducts.length
      }
    });

  } catch (error) {
    console.error('Search error:', {
      message: error.message,
      query: req.query.q,
      stack: error.stack
    });
    
    res.status(500).json({
      success: false,
      error: 'Search failed',
      details: error.message
    });
  }
};