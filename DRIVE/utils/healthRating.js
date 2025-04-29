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
  },
  processed_grains: {
    ingredients: [
      'refined flour', 'maida', 'corn flour', 'rice flour', 'wheat flour',
      'enriched flour', 'bleached flour', 'modified starch'
    ],
    weight: -0.3,
    reason: 'Refined grains have lower nutritional value compared to whole grains'
  },
  snack_additives: {
    ingredients: [
      'msg', 'monosodium glutamate', 'maltodextrin', 'hydrolyzed', 
      'flavor enhancer', 'artificial flavor', 'natural flavor',
      'E621', 'E631', 'E627'
    ],
    weight: -0.4,
    reason: 'Contains flavor enhancers and additives common in processed snacks'
  },
  processed_oils: {
    ingredients: [
      'palm oil', 'hydrogenated', 'partially hydrogenated', 
      'vegetable oil', 'interesterified', 'shortening'
    ],
    weight: -0.4,
    reason: 'Contains processed oils that may have trans fats or inflammatory properties'
  },
  healthy_grains: {
    ingredients: [
      'whole wheat', 'whole grain', 'multigrain', 'ragi', 'millet',
      'quinoa', 'oats', 'barley', 'brown rice'
    ],
    weight: 0.4,
    reason: 'Contains whole grains with higher nutritional value'
  },
  spices_herbs: {
    ingredients: [
      'turmeric', 'ginger', 'garlic', 'black pepper', 'cumin',
      'coriander', 'cardamom', 'cinnamon', 'basil'
    ],
    weight: 0.3,
    reason: 'Contains natural spices with potential health benefits'
  },
  healthy_proteins: {
    ingredients: [
      'whey protein', 'soy protein', 'pea protein', 'egg white',
      'milk protein', 'casein', 'protein isolate', 'quinoa protein'
    ],
    weight: 0.4,
    reason: 'Contains quality protein sources'
  },
  healthy_fats: {
    ingredients: [
      'olive oil', 'avocado oil', 'coconut oil', 'peanut', 'almond',
      'cashew', 'sunflower seeds', 'pumpkin seeds', 'chia seeds'
    ],
    weight: 0.3,
    reason: 'Contains healthy fats and omega fatty acids'
  },
  fortified_nutrients: {
    ingredients: [
      'vitamin d', 'vitamin b12', 'folate', 'iron', 'calcium',
      'zinc', 'magnesium', 'potassium', 'dha', 'epa'
    ],
    weight: 0.3,
    reason: 'Fortified with essential nutrients'
  },
  probiotics: {
    ingredients: [
      'lactobacillus', 'bifidobacterium', 'probiotics', 'live cultures',
      'fermented', 'cultured', 'yogurt cultures'
    ],
    weight: 0.3,
    reason: 'Contains beneficial probiotics'
  }
};

const PRODUCT_CATEGORIES = {
  beverages: {
    keywords: ['drink', 'beverage', 'juice', 'smoothie', 'shake', 'tea', 'coffee', 'water'],
    nutritionalFocus: ['sugar', 'caffeine', 'artificial_sweeteners'],
    scoreAdjustment: 0.9 // Slightly stricter scoring for beverages
  },
  spreads: {
    keywords: ['butter', 'spread', 'paste', 'jam', 'margarine', 'nutella'],
    nutritionalFocus: ['fats', 'sugar', 'protein'],
    scoreAdjustment: 1.0
  },
  dairy: {
    keywords: ['milk', 'yogurt', 'cheese', 'curd', 'cream', 'dairy'],
    nutritionalFocus: ['protein', 'calcium', 'fats'],
    scoreAdjustment: 1.1
  },
  protein_supplements: {
    keywords: ['protein', 'supplement', 'whey', 'mass gainer', 'protein powder'],
    nutritionalFocus: ['protein', 'vitamins', 'minerals'],
    scoreAdjustment: 1.2
  },
  breakfast_cereals: {
    keywords: ['cereal', 'muesli', 'granola', 'oats', 'porridge'],
    nutritionalFocus: ['fiber', 'sugar', 'whole_grains'],
    scoreAdjustment: 1.0
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
  },
  trans_fat_100g: {
    low: 0.1,
    high: 0.5,
    weight: -0.6,
    isPositive: false
  },
  sodium_100g: {
    low: 120,
    high: 500,
    weight: -0.4,
    isPositive: false
  },
  calcium_100g: {
    low: 120,
    high: 240,
    weight: 0.3,
    isPositive: true
  },
  vitamin_d_100g: {
    low: 1,
    high: 2.5,
    weight: 0.3,
    isPositive: true
  },
  potassium_100g: {
    low: 300,
    high: 600,
    weight: 0.3,
    isPositive: true
  },
  calories_100g: {
    low: 50,
    high: 300,
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

const SNACK_CATEGORIES = [
  'snacks', 'chips', 'crisps', 'crackers', 'cookies',
  'biscuits', 'namkeen', 'kurkure', 'extruded snacks'
];

function detectProductCategory(product) {
  if (!product.name && !product.category) return null;
  
  const productText = `${product.name} ${product.category}`.toLowerCase();
  
  for (const [category, data] of Object.entries(PRODUCT_CATEGORIES)) {
    if (data.keywords.some(keyword => productText.includes(keyword))) {
      return { category, ...data };
    }
  }
  
  return null;
}

function calculateHealthRating(product) {
  try {
    if (!product) return { score: 3, analysis: ['No product data available'] };

    let finalScore = 3;
    let analysis = [];
    
    // Detect product category for specialized analysis
    const productCategory = detectProductCategory(product);
    let categoryMultiplier = productCategory?.scoreAdjustment || 1;

    // Start with Nutri-Score if available
    if (product.nutriscore_grade) {
      const nutriScoreValues = { 'a': 5, 'b': 4, 'c': 3, 'd': 2, 'e': 1 };
      finalScore = nutriScoreValues[product.nutriscore_grade.toLowerCase()] || 3;
      analysis.push(`Nutri-Score ${product.nutriscore_grade.toUpperCase()}`);
    }

    // Analyze nutrients with category-specific focus
    if (product.nutriments) {
      const { score: nutrientScore, analysis: nutrientAnalysis } = analyzeNutrients(product.nutriments);
      if (productCategory) {
        const focusNutrients = productCategory.nutritionalFocus;
        const relevantAnalysis = nutrientAnalysis.filter(a => 
          focusNutrients.some(nutrient => a.toLowerCase().includes(nutrient))
        );
        analysis = [...analysis, ...relevantAnalysis];
      } else {
        analysis = [...analysis, ...nutrientAnalysis];
      }
      
      // Weight nutrient score more heavily (60%)
      finalScore = (finalScore * 0.4) + (nutrientScore * 0.6);
    }

    // Analyze ingredients
    if (product.ingredients) {
      const { score: ingredientScore, analysis: ingredientAnalysis } = analyzeIngredients(product.ingredients);
      // Weight ingredient analysis (40%)
      finalScore = (finalScore * 0.6) + (ingredientScore * 0.4);
      analysis = [...analysis, ...ingredientAnalysis];
    }

    // Apply category-specific adjustments
    finalScore *= categoryMultiplier;

    // Add category-specific analysis
    if (productCategory) {
      analysis.push(`Analyzed as ${productCategory.category.replace('_', ' ')} product`);
    }

    // Ensure score stays within 1-5 range and round to 1 decimal
    finalScore = Math.max(1, Math.min(5, Math.round(finalScore * 10) / 10));

    // Enhanced analysis to separate pros and cons
    const healthAnalysis = analysis.map(item => {
      if (item.includes('Good source') || item.includes('Low in') || item.includes('beneficial')) {
        return { type: 'pro', text: item };
      }
      return { type: 'con', text: item };
    });

    return {
      score: finalScore,
      analysis: analysis,
      rating: finalScore >= 4 ? 'Healthy Choice' :
              finalScore >= 3 ? 'Moderately Healthy' :
              finalScore >= 2 ? 'Less Healthy' : 'Not Recommended',
      color: finalScore >= 4 ? 'green' :
             finalScore >= 3 ? 'yellow' :
             finalScore >= 2 ? 'orange' : 'red',
      pros: healthAnalysis.filter(a => a.type === 'pro').map(a => a.text),
      cons: healthAnalysis.filter(a => a.type === 'con').map(a => a.text)
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