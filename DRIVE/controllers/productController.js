const axios = require('axios');
const Product = require('../models/Product');

function escapeRegExp(string) {
  if (!string) return '';
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

exports.searchProducts = async (req, res) => {
  try {
    const { q: query, page = 1 } = req.query;
    
    // Validate query parameter
    if (!query) {
      return res.status(400).json({
        error: 'Search query is required',
        details: 'Please provide a search term'
      });
    }

    const limit = 10;
    const skip = (page - 1) * limit;
    const sanitizedQuery = escapeRegExp(query);

    // 1. Search local database with projection to include all fields
    const localResults = await Product.find({
      $or: [
        { name: new RegExp(sanitizedQuery, 'i') },
        { brand: new RegExp(sanitizedQuery, 'i') }
      ]
    })
    .select({
      name: 1,
      brand: 1,
      ingredients: 1,
      imageUrl: 1,
      _id: 1,
      barcode: 1
    })
    .skip(skip)
    .limit(limit)
    .lean();

    console.log('Local Results:', localResults); // Debug log

    if (localResults.length > 0) {
      const total = await Product.countDocuments({
        $or: [
          { name: new RegExp(sanitizedQuery, 'i') },
          { brand: new RegExp(sanitizedQuery, 'i') }
        ]
      });

      // Transform results to ensure all fields are present
      const transformedResults = localResults.map(product => ({
        _id: product._id,
        name: product.name || 'Unknown Product',
        brand: product.brand || 'Unknown Brand',
        ingredients: product.ingredients || 'No ingredients information available',
        imageUrl: product.imageUrl || 'https://placehold.co/60x60',
        barcode: product.barcode || 'N/A',
        source: 'database'
      }));

      return res.json({
        success: true,
        products: transformedResults,
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        source: 'database',
        query: query
      });
    }

    // 2. Fallback to Open Food Facts API
    try {
      const response = await axios.get('https://world.openfoodfacts.org/cgi/search.pl', {
        params: {
          search_terms: query,
          page_size: limit,
          page,
          json: 1
        },
        timeout: 5000 // 5 seconds timeout
      });

      const products = response.data.products?.map(p => ({
        _id: p.code,
        name: p.product_name,
        brand: p.brands,
        ingredients: p.ingredients_text,
        imageUrl: p.image_url,
        source: 'openfoodfacts'
      })) || [];

      // 3. Cache new products (async)
      if (products.length > 0) {
        Product.bulkWrite(
          products.map(product => ({
            updateOne: {
              filter: { _id: product._id },
              update: { $set: product },
              upsert: true
            }
          }))
        ).catch(err => console.error('Cache error:', err));
      }

      res.json({
        products,
        currentPage: parseInt(page),
        totalPages: Math.ceil(response.data.count / limit)
      });

    } catch (error) {
      if (error.code === 'ETIMEDOUT') {
        console.error('API request timed out');
        return res.status(504).json({ message: 'External API request timed out' });
      }
      throw error; // Re-throw other errors
    }

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Search failed',
      details: error.message
    });
  }
};