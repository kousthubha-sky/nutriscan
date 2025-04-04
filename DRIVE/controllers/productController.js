const axios = require('axios');
const Product = require('../models/Product');

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

    // Search local database
    const [results, total] = await Promise.all([
      Product.find({
        $or: [
          { name: new RegExp(sanitizedQuery, 'i') },
          { brand: new RegExp(sanitizedQuery, 'i') }
        ]
      })
      .select('name brand imageUrl ingredients')
      .skip(skip)
      .limit(limit)
      .lean(),
      
      Product.countDocuments({
        $or: [
          { name: new RegExp(sanitizedQuery, 'i') },
          { brand: new RegExp(sanitizedQuery, 'i') }
        ]
      })
    ]);

    console.log('Search results:', {
      count: results.length,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });

    if (results.length > 0) {
      return res.json({
        success: true,
        products: results,
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        total
      });
    }

    // Fallback to external API if no local results
    const response = await axios.get('https://world.openfoodfacts.org/cgi/search.pl', {
      params: {
        search_terms: query,
        page_size: limit,
        page: page,
        json: 1
      }
    });

    const products = response.data.products?.map(p => ({
      _id: p.code,
      name: p.product_name,
      brand: p.brands,
      imageUrl: p.image_url,
      ingredients: p.ingredients_text
    })) || [];

    res.json({
      success: true,
      products,
      currentPage: parseInt(page),
      totalPages: Math.ceil(response.data.count / limit),
      total: response.data.count
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