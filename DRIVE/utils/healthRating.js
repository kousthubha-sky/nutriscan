const INGREDIENT_ANALYSIS = {
  artificial_colors: {
    ingredients: [
      'E102', 'E104', 'E110', 'E122', 'E124', 'E129',
      'tartrazine', 'quinoline yellow', 'sunset yellow',
      'carmoisine', 'ponceau', 'allura red'
    ],
    weight: -0.5,
    reason: 'Artificial colors may cause hyperactivity in children'
  },
  artificial_sweeteners: {
    ingredients: [
      'aspartame', 'sucralose', 'acesulfame', 'saccharin',
      'E951', 'E950', 'E952', 'E954', 'E955', 'E962'
    ],
    weight: -0.3,
    reason: 'Artificial sweeteners may affect gut bacteria and metabolism'
  },
  preservatives: {
    ingredients: [
      'E211', 'E212', 'E220', 'sodium benzoate', 'potassium sorbate',
      'sulfur dioxide', 'nitrite', 'nitrate', 'BHA', 'BHT'
    ],
    weight: -0.4,
    reason: 'Some preservatives may have negative health effects'
  },
  healthy_nutrients: {
    ingredients: [
      'whole grain', 'quinoa', 'chia', 'flax', 'oat', 
      'spinach', 'kale', 'broccoli', 'almonds', 'walnuts'
    ],
    weight: 0.5,
    reason: 'Contains beneficial nutrients and fiber'
  }
};

const NUTRITIONAL_GUIDELINES = {
  proteins_100g: {
    low: 5,
    high: 20,
    weight: 0.4,
    isPositive: true
  },
  fiber_100g: {
    low: 3,
    high: 6,
    weight: 0.4,
    isPositive: true
  },
  sugars_100g: {
    low: 5,
    high: 22.5,
    weight: -0.5,
    isPositive: false
  },
  saturated_fat_100g: {
    low: 1.5,
    high: 5,
    weight: -0.4,
    isPositive: false
  },
  salt_100g: {
    low: 0.3,
    high: 1.5,
    weight: -0.3,
    isPositive: false
  }
};

function analyzeNutrients(nutriments) {
  let score = 3;
  let analysis = [];

  Object.entries(NUTRITIONAL_GUIDELINES).forEach(([nutrient, guidelines]) => {
    const value = parseFloat(nutriments[nutrient]) || 0;
    
    if (guidelines.isPositive) {
      if (value >= guidelines.high) {
        score += guidelines.weight;
        analysis.push(`High in ${nutrient.replace('_100g', '')}: Good source`);
      } else if (value <= guidelines.low) {
        score -= guidelines.weight / 2;
        analysis.push(`Low in ${nutrient.replace('_100g', '')}: Could be better`);
      }
    } else {
      if (value >= guidelines.high) {
        score += guidelines.weight; // negative weight
        analysis.push(`High in ${nutrient.replace('_100g', '')}: Consider reducing`);
      } else if (value <= guidelines.low) {
        score -= guidelines.weight; // negative weight becomes positive
        analysis.push(`Low in ${nutrient.replace('_100g', '')}: Good`);
      }
    }
  });

  return { score, analysis };
}

function analyzeIngredients(ingredientsList) {
  let score = 0;
  let analysis = [];
  const ingredients = ingredientsList.toLowerCase();

  Object.entries(INGREDIENT_ANALYSIS).forEach(([category, data]) => {
    let found = false;
    data.ingredients.forEach(ingredient => {
      if (ingredients.includes(ingredient.toLowerCase())) {
        found = true;
        score += data.weight;
        analysis.push(`Contains ${ingredient}: ${data.reason}`);
      }
    });
  });

  return { score, analysis };
}

function calculateHealthRating(product) {
  try {
    if (!product) return { score: 3, analysis: ['No product data available'] };

    let finalScore = 3;
    let analysis = [];

    // Start with Nutri-Score if available
    if (product.nutriscore_grade) {
      const nutriScoreValues = {
        'a': 5,
        'b': 4,
        'c': 3,
        'd': 2,
        'e': 1
      };
      finalScore = nutriScoreValues[product.nutriscore_grade.toLowerCase()] || 3;
      analysis.push(`Nutri-Score ${product.nutriscore_grade.toUpperCase()}`);
    }

    // Analyze nutrients
    if (product.nutriments) {
      const { score: nutrientScore, analysis: nutrientAnalysis } = analyzeNutrients(product.nutriments);
      finalScore = (finalScore + nutrientScore) / 2;
      analysis = [...analysis, ...nutrientAnalysis];
    }

    // Analyze ingredients
    if (product.ingredients) {
      const { score: ingredientScore, analysis: ingredientAnalysis } = analyzeIngredients(product.ingredients);
      finalScore = (finalScore + ingredientScore);
      analysis = [...analysis, ...ingredientAnalysis];
    }

    // Ensure score stays within 1-5 range
    finalScore = Math.max(1, Math.min(5, Math.round(finalScore * 10) / 10));

    return {
      score: finalScore,
      analysis: analysis,
      rating: finalScore >= 4 ? 'Healthy Choice' :
              finalScore >= 3 ? 'Moderately Healthy' :
              finalScore >= 2 ? 'Less Healthy' : 'Not Recommended',
      color: finalScore >= 4 ? 'green' :
             finalScore >= 3 ? 'yellow' :
             finalScore >= 2 ? 'orange' : 'red'
    };
  } catch (error) {
    console.error('Error calculating health rating:', error);
    return {
      score: 3,
      analysis: ['Error analyzing product'],
      rating: 'Analysis Failed',
      color: 'gray'
    };
  }
}

module.exports = calculateHealthRating;