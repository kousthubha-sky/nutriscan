const express = require('express');
const { searchProducts, getFeaturedProducts, getHealthierAlternatives } = require('../controllers/productController');
const router = express.Router();

router.get('/search', searchProducts);
router.get('/featured', getFeaturedProducts);
router.post('/alternatives', getHealthierAlternatives);

module.exports = router;