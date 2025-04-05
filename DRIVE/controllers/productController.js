const axios = require('axios');
const Product = require('../models/Product');
const calculateHealthRating = require('../utils/healthRating');

function escapeRegExp(string) {
  if (!string) return '';
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

exports.searchProducts = async (req, res) => {
  try {
    const { q: query, page = 1 } = req.query;
    console.log('Search request:', { query, page });

    if (!query) {
      return res.status(400).json({
        error: 'Search query is required'
      });
    }

    const limit = 10;
    const skip = (parseInt(page) - 1) * limit;
    const sanitizedQuery = escapeRegExp(query);

    // Fetch from API first
    const apiResponse = await axios.get('https://world.openfoodfacts.org/cgi/search.pl', {
      params: {
        search_terms: query,
        page_size: 24, // Fetch more to ensure we have enough after deduplication
        page: page,
        json: 1
      }
    });

    // Convert API results
    const apiProducts = (apiResponse.data.products || []).map(p => ({
      barcode: p.code,
      name: p.product_name || 'Unknown Product',
      brand: p.brands || 'Unknown Brand',
      imageUrl: p.image_url || p.image_small_url || p.image_thumb_url,
      ingredients: p.ingredients_text || '',
      source: 'api',
      healthRating: calculateHealthRating({
        ingredients: p.ingredients_text || ''
      }),
      nutriments: {
        energy_kcal_100g: p.nutriments?.energy_kcal_100g,
        carbohydrates_100g: p.nutriments?.carbohydrates_100g,
        sugars_100g: p.nutriments?.sugars_100g,
        fat_100g: p.nutriments?.fat_100g,
        saturated_fat_100g: p.nutriments?.saturated_fat_100g,
        proteins_100g: p.nutriments?.proteins_100g,
        fiber_100g: p.nutriments?.fiber_100g,
        salt_100g: p.nutriments?.salt_100g,
        sodium_100g: p.nutriments?.sodium_100g
      },
      serving_size: p.serving_size || '100g'
    }));

    // Get local results
    const localResults = await Product.find({
      $or: [
        { name: new RegExp(sanitizedQuery, 'i') },
        { brand: new RegExp(sanitizedQuery, 'i') }
      ]
    })
    .select('barcode name brand imageUrl ingredients')
    .lean();

    // Store new API products
    const existingBarcodes = new Set(localResults.map(p => p.barcode));
    const newProducts = apiProducts.filter(p => !existingBarcodes.has(p.barcode));

    if (newProducts.length > 0) {
      try {
        await Product.insertMany(newProducts, { ordered: false });
        console.log(`Stored ${newProducts.length} new products`);
      } catch (err) {
        console.error('Error storing new products:', err);
      }
    }

    // Combine results, prioritizing API results for freshness
    const combinedProducts = [
      ...apiProducts,
      ...localResults.filter(local => 
        !apiProducts.some(api => api.barcode === local.barcode)
      )
    ];

    // Paginate results
    const startIndex = 0; // Always start from beginning since API already handles pagination
    const endIndex = limit;
    const paginatedProducts = combinedProducts.slice(startIndex, endIndex);

    res.json({
      success: true,
      products: paginatedProducts,
      currentPage: parseInt(page),
      totalPages: Math.ceil(apiResponse.data.count / limit),
      total: apiResponse.data.count,
      sources: {
        api: apiProducts.length,
        local: localResults.length,
        new: newProducts.length
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