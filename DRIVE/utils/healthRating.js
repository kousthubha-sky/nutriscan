const INGREDIENTS_ANALYSIS = {
  harmful: {
    ingredients: [  // Changed from 'additives' to 'ingredients' for consistency
      'E102', 'E104', 'E110', 'E124',
      'E621', 'E622', 'E623',
      'BHA', 'BHT',
      'hydrogenated',
      'high fructose',
      'artificial'
    ],
    weight: -0.5
  },
  concerning: {
    ingredients: [
      'sugar',
      'palm oil',
      'modified starch',
      'syrup',
      'concentrate'
    ],
    weight: -0.3
  },
  healthy: {
    ingredients: [
      'whole grain',
      'organic',
      'quinoa',
      'fiber',
      'vitamin',
      'protein'
    ],
    weight: 0.4
  }
};

function calculateNutritionalContent(product) {
  try {
    if (!product.nutriments) return 0;
    
    let score = 0;
    const n = product.nutriments;

    // Safe number conversion with fallback
    const getNumber = (value) => {
      const num = parseFloat(value);
      return isNaN(num) ? 0 : num;
    };

    // Analyze basic nutritional values with safe checks
    if (getNumber(n.proteins_100g) > 5) score += 0.3;
    if (getNumber(n.fiber_100g) > 3) score += 0.3;
    if (getNumber(n.sugars_100g) > 10) score -= 0.3;
    if (getNumber(n.saturated_fat_100g) > 5) score -= 0.3;
    if (getNumber(n.sodium_100g) > 0.4) score -= 0.2;

    return score;
  } catch (error) {
    console.error('Error in nutritional analysis:', error);
    return 0;
  }
}

function calculateHealthRating(product) {
  try {
    if (!product) return 3;
    
    // Start with Nutri-Score if available
    if (product.nutriscore_grade) {
      const nutriScoreValues = {
        'a': 5,
        'b': 4,
        'c': 3,
        'd': 2,
        'e': 1
      };
      return nutriScoreValues[product.nutriscore_grade.toLowerCase()] || 3;
    }

    // Fallback to ingredients analysis if no Nutri-Score
    if (!product.ingredients) return 3;

    let score = 3; // Start with neutral score
    const ingredients = String(product.ingredients).toLowerCase();

    // Safely check ingredients
    Object.entries(INGREDIENTS_ANALYSIS).forEach(([category, data]) => {
      if (data && Array.isArray(data.ingredients)) {
        data.ingredients.forEach(ingredient => {
          if (ingredients.includes(ingredient.toLowerCase())) {
            score += data.weight;
          }
        });
      }
    });

    // Ensure score stays within 1-5 range and round to 1 decimal
    return Math.max(1, Math.min(5, Math.round(score * 10) / 10));
  } catch (error) {
    console.error('Error calculating health rating:', error);
    return 3; // Return default score on error
  }
}

module.exports = calculateHealthRating;