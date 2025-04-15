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
      return res.status(400).json({
        success: false,
        error: 'Please enter a valid search term'
      });
    }

    const limit = 24; // Increased limit for better results
    const skip = (parseInt(page) - 1) * limit;
    const sanitizedQuery = escapeRegExp(query.trim());

    // Always fetch from API first to get fresh results
    let apiProducts = [];
    let apiError = null;
    let apiTotalCount = 0;
    let apiResponse = null;
    
    try {
      apiResponse = await api.get('https://world.openfoodfacts.org/cgi/search.pl', {
        params: {
          search_terms: sanitizedQuery,
          page_size: limit,
          page: page,
          json: 1
        }
      });

      apiTotalCount = apiResponse.data.count || 0;

      // Enhanced product mapping for API results
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
          source: 'api'
        };
      });

    } catch (error) {
      console.error('API fetch error:', error);
      apiError = error;
    }

    // Get results from local database
    const localResults = await Product.find({
      $or: [
        { name: new RegExp(sanitizedQuery, 'i') },
        { brand: new RegExp(sanitizedQuery, 'i') },
        { category: new RegExp(sanitizedQuery, 'i') }
      ]
    })
    .sort({ searchCount: -1 })
    .limit(limit)
    .lean();

    // Update search count for retrieved products
    if (localResults.length > 0) {
      const productIds = localResults.map(p => p._id);
      await Product.updateMany(
        { _id: { $in: productIds } },
        { $inc: { searchCount: 1 } }
      );
    }

    // Mark local results
    localResults.forEach(product => {
      product.source = 'local';
    });

    // Store new API products in background
    if (apiProducts.length > 0) {
      const bulkOps = apiProducts.map(product => ({
        updateOne: {
          filter: { barcode: product.barcode },
          update: { 
            $set: { ...product, lastFetched: new Date() },
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

    // Combine and deduplicate results, ensuring a mix of both sources
    const seenBarcodes = new Set();
    let combinedProducts = [];
    
    // Helper to add unique products
    const addUniqueProducts = (products) => {
      products.forEach(p => {
        if (!seenBarcodes.has(p.barcode)) {
          seenBarcodes.add(p.barcode);
          combinedProducts.push(p);
        }
      });
    };

    // Add API products first as they're fresher
    addUniqueProducts(apiProducts);
    
    // Then add local results that aren't duplicates
    addUniqueProducts(localResults);

    // Calculate pagination
    const totalLocalResults = await Product.countDocuments({
      $or: [
        { name: new RegExp(sanitizedQuery, 'i') },
        { brand: new RegExp(sanitizedQuery, 'i') },
        { category: new RegExp(sanitizedQuery, 'i') }
      ]
    });

    const totalResults = Math.max(apiTotalCount, totalLocalResults);
    const totalPages = Math.max(1, Math.ceil(totalResults / limit));

    // Slice for current page
    const startIdx = (page - 1) * limit;
    const endIdx = startIdx + limit;
    const paginatedResults = combinedProducts.slice(startIdx, endIdx);

    // Return results with source information
    res.json({
      success: true,
      products: paginatedResults,
      currentPage: parseInt(page),
      totalPages: totalPages,
      total: totalResults,
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