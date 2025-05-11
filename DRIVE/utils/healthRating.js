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
  },
  dairy_positive: {
    ingredients: [
      'milk', 'whole milk', 'skimmed milk', 'low fat milk', 'toned milk',
      'a2 milk', 'organic milk', 'pasteurized milk', 'homogenized milk',
      'fresh milk', 'buffalo milk', 'cow milk', 'goat milk'
    ],
    weight: 0.5,
    reason: 'Contains natural dairy milk with essential nutrients'
  },
  dairy_additives: {
    ingredients: [
      'milk solids', 'milk powder', 'reconstituted milk',
      'ultra filtered', 'milk protein concentrate'
    ],
    weight: -0.2,
    reason: 'Contains processed dairy ingredients'
  },
  dairy_enrichment: {
    ingredients: [
      'vitamin d3', 'vitamin d', 'calcium fortified', 'omega 3',
      'dha', 'vitamin a', 'vitamin b12', 'folate'
    ],
    weight: 0.3,
    reason: 'Fortified with essential nutrients'
  }
};

// Add ingredient aliases and variations mapping
const INGREDIENT_ALIASES = {
  'sugar': ['sucrose', 'glucose', 'fructose', 'dextrose', 'corn syrup', 'cane sugar', 'brown sugar'],
  'salt': ['sodium chloride', 'sea salt', 'rock salt', 'iodized salt'],
  'wheat': ['whole wheat', 'wheat flour', 'enriched wheat', 'wheat germ'],
  'milk': ['whole milk', 'skim milk', 'milk powder', 'dairy'],
  // Add more aliases as needed
};

// Enhanced product categories with more specific nutritional guidelines
const PRODUCT_CATEGORIES = {
  beverages: {
    keywords: ['drink', 'beverage', 'juice', 'smoothie', 'shake', 'tea', 'coffee', 'water'],
    nutritionalFocus: ['sugar', 'caffeine', 'artificial_sweeteners'],
    scoreAdjustment: 0.95,
    nutritionMultipliers: {
      sugars_100g: 1.2,      // Stricter sugar evaluation for beverages
      caffeine_100g: 1.1,
      sodium_100g: 0.9
    }
  },
  dairy: {
    keywords: ['milk', 'yogurt', 'cheese', 'curd', 'cream', 'dairy', 'dahi', 'buttermilk', 'lassi'],
    nutritionalFocus: ['protein', 'calcium', 'vitamin_d', 'fats'],
    scoreAdjustment: 1.1,
    nutritionMultipliers: {
      calcium_100g: 1.2,
      protein_100g: 1.1,
      vitamin_d_100g: 1.2
    }
  },
  snacks: {
    keywords: ['chips', 'crisps', 'crackers', 'cookies', 'biscuits', 'namkeen', 'snack'],
    nutritionalFocus: ['fat', 'sodium', 'sugar'],
    scoreAdjustment: 0.9,
    nutritionMultipliers: {
      fat_100g: 1.2,
      sodium_100g: 1.2,
      sugars_100g: 1.1
    }
  },
  protein_supplements: {
    keywords: ['protein', 'supplement', 'whey', 'mass gainer', 'protein powder'],
    nutritionalFocus: ['protein', 'vitamins', 'minerals'],
    scoreAdjustment: 1.05,
    nutritionMultipliers: {
      proteins_100g: 1.3,
      vitamins_100g: 1.2,
      minerals_100g: 1.2
    }
  },
  breakfast_cereals: {
    keywords: ['cereal', 'muesli', 'granola', 'oats', 'porridge'],
    nutritionalFocus: ['fiber', 'sugar', 'whole_grains'],
    scoreAdjustment: 1.0,
    nutritionMultipliers: {
      fiber_100g: 1.2,
      sugars_100g: 1.1,
      whole_grains: 1.2
    }
  },
  processed_foods: {
    keywords: ['instant', 'ready to eat', 'microwave', 'frozen', 'processed'],
    nutritionalFocus: ['sodium', 'preservatives', 'additives'],
    scoreAdjustment: 0.85,
    nutritionMultipliers: {
      sodium_100g: 1.3,
      preservatives: 1.2,
      artificial_additives: 1.2
    }
  }
};

const NUTRITIONAL_GUIDELINES = {
  proteins_100g: {
    low: 5,
    high: 20,
    weight: 0.4,
    isPositive: true,
    bioavailability: 1.0
  },
  fiber_100g: {
    low: 3,
    high: 6,
    weight: 0.4,
    isPositive: true,
    bioavailability: 1.0
  },
  omega3_100g: {
    low: 0.3,
    high: 1.5,
    weight: 0.4,
    isPositive: true,
    bioavailability: 0.9
  },
  vitamin_a_100g: {
    low: 80,
    high: 300,
    weight: 0.3,
    isPositive: true,
    bioavailability: 0.7
  },
  vitamin_c_100g: {
    low: 9,
    high: 45,
    weight: 0.3,
    isPositive: true,
    bioavailability: 0.85
  },
  vitamin_e_100g: {
    low: 1.5,
    high: 10,
    weight: 0.3,
    isPositive: true,
    bioavailability: 0.7
  },
  sugars_100g: {
    low: 5,
    high: 22.5,
    weight: -0.5,
    isPositive: false,
    bioavailability: 1.0
  },
  saturated_fat_100g: {
    low: 1.5,
    high: 5,
    weight: -0.4,
    isPositive: false,
    bioavailability: 1.0
  },
  salt_100g: {
    low: 0.3,
    high: 1.5,
    weight: -0.3,
    isPositive: false,
    bioavailability: 1.0
  },
  iron_100g: {
    low: 1.8,
    high: 7,
    weight: 0.4,
    isPositive: true,
    bioavailability: {
      heme: 0.85,
      nonHeme: 0.15
    }
  },
  zinc_100g: {
    low: 1.5,
    high: 5,
    weight: 0.3,
    isPositive: true,
    bioavailability: 0.6
  },
  trans_fat_100g: {
    low: 0.1,
    high: 0.5,
    weight: -0.6,
    isPositive: false,
    bioavailability: 1.0
  },
  sodium_100g: {
    low: 120,
    high: 500,
    weight: -0.4,
    isPositive: false,
    bioavailability: 1.0
  },
  calcium_100g: {
    low: 100,
    high: 200,
    weight: 0.5,
    isPositive: true,
    bioavailability: 0.3
  },
  vitamin_d_100g: {
    low: 0.75,
    high: 1.5,
    weight: 0.4,
    isPositive: true,
    bioavailability: 0.8
  },
  potassium_100g: {
    low: 300,
    high: 600,
    weight: 0.3,
    isPositive: true,
    bioavailability: 0.9
  },
  calories_100g: {
    low: 50,
    high: 300,
    weight: -0.3,
    isPositive: false,
    bioavailability: 1.0
  }
};

// Enhance product category detection
function detectProductCategory(product) {
  if (!product.name && !product.category) return null;
  
  const productText = `${product.name} ${product.category}`.toLowerCase();
  let matchedCategories = [];
  
  // Find all matching categories
  for (const [category, data] of Object.entries(PRODUCT_CATEGORIES)) {
    const keywordMatch = data.keywords.some(keyword => productText.includes(keyword));
    if (keywordMatch) {
      matchedCategories.push({ category, ...data });
    }
  }
  
  if (matchedCategories.length === 0) return null;
  
  // If multiple categories match, combine their effects
  if (matchedCategories.length > 1) {
    return combineCategories(matchedCategories);
  }
  
  return matchedCategories[0];
}

// Helper function to combine multiple category effects
function combineCategories(categories) {
  const combined = {
    category: categories.map(c => c.category).join('_'),
    nutritionalFocus: [],
    scoreAdjustment: 1.0,
    nutritionMultipliers: {}
  };
  
  // Combine nutritional focus areas
  const focusSet = new Set();
  categories.forEach(cat => {
    cat.nutritionalFocus.forEach(focus => focusSet.add(focus));
  });
  combined.nutritionalFocus = Array.from(focusSet);
  
  // Average the score adjustments
  const totalAdjustment = categories.reduce((sum, cat) => sum + cat.scoreAdjustment, 0);
  combined.scoreAdjustment = totalAdjustment / categories.length;
  
  // Combine nutrition multipliers (take the most strict value for each nutrient)
  categories.forEach(cat => {
    if (cat.nutritionMultipliers) {
      Object.entries(cat.nutritionMultipliers).forEach(([nutrient, multiplier]) => {
        if (!combined.nutritionMultipliers[nutrient] || 
            (combined.nutritionMultipliers[nutrient] < multiplier && multiplier > 1) ||
            (combined.nutritionMultipliers[nutrient] > multiplier && multiplier < 1)) {
          combined.nutritionMultipliers[nutrient] = multiplier;
        }
      });
    }
  });
  
  return combined;
}

// Update analyzeNutrients to use category-specific multipliers
function analyzeNutrients(nutriments, productCategory = null) {
  let score = calculateBaselineScore(nutriments);
  let analysis = [];
  
  const servingSize = nutriments.serving_size_g || 100;
  
  Object.entries(NUTRITIONAL_GUIDELINES).forEach(([nutrient, guidelines]) => {
    // Apply category-specific multipliers if available
    const multiplier = productCategory?.nutritionMultipliers?.[nutrient] || 1.0;
    
    // Adjust thresholds based on serving size and category multiplier
    const adjustedLow = (guidelines.low * servingSize * multiplier) / 100;
    const adjustedHigh = (guidelines.high * servingSize * multiplier) / 100;
    const value = parseFloat(nutriments[nutrient]) || 0;
    
    // Calculate how far the value is from optimal range
    const optimalRange = (adjustedHigh - adjustedLow) / 2;
    const deviation = Math.abs(value - optimalRange);
    const impactFactor = 1 - Math.min(deviation / optimalRange, 1);
    
    if (guidelines.isPositive) {
      if (value >= adjustedHigh) {
        score += guidelines.weight * impactFactor;
        analysis.push(`High in ${nutrient.replace('_100g', '')}: Excellent source`);
      } else if (value >= adjustedLow) {
        score += (guidelines.weight / 2) * impactFactor;
        analysis.push(`Good source of ${nutrient.replace('_100g', '')}`);
      } else {
        score -= (guidelines.weight / 3);
        analysis.push(`Low in ${nutrient.replace('_100g', '')}: Could be improved`);
      }
    } else {
      if (value >= adjustedHigh) {
        score += guidelines.weight * impactFactor; // negative weight
        analysis.push(`High in ${nutrient.replace('_100g', '')}: Consider reducing`);
      } else if (value <= adjustedLow) {
        score -= guidelines.weight * impactFactor; // negative weight becomes positive
        analysis.push(`Low in ${nutrient.replace('_100g', '')}: Good`);
      }
    }
  });
  
  return { score, analysis };
}

// Helper function to calculate baseline score from macronutrient balance
function calculateBaselineScore(nutriments) {
  const proteinCals = (nutriments.proteins_100g || 0) * 4;
  const carbsCals = (nutriments.carbohydrates_100g || 0) * 4;
  const fatCals = (nutriments.fat_100g || 0) * 9;
  const totalCals = proteinCals + carbsCals + fatCals || 1;

  // Ideal macronutrient ratios (percentages)
  const idealProtein = 0.25;
  const idealCarbs = 0.5;
  const idealFat = 0.25;

  // Calculate actual ratios
  const proteinRatio = proteinCals / totalCals;
  const carbsRatio = carbsCals / totalCals;
  const fatRatio = fatCals / totalCals;

  // Calculate deviation from ideal ratios
  const proteinDeviation = Math.abs(proteinRatio - idealProtein);
  const carbsDeviation = Math.abs(carbsRatio - idealCarbs);
  const fatDeviation = Math.abs(fatRatio - idealFat);

  // Convert deviations to a score (3 is neutral)
  const baselineScore = 3 - ((proteinDeviation + carbsDeviation + fatDeviation) * 2);
  
  return Math.max(1, Math.min(5, baselineScore));
}

function analyzeIngredients(ingredientsList) {
  let score = 0;
  let analysis = [];
  
  // Convert ingredients to array if it's a string
  const ingredientsArray = Array.isArray(ingredientsList) 
    ? ingredientsList 
    : ingredientsList.split(',').map(i => i.trim());
  
  // Calculate total ingredients for position weighting
  const totalIngredients = ingredientsArray.length;
  
  ingredientsArray.forEach((ingredient, index) => {
    const normalizedIngredient = ingredient.toLowerCase();
    // Position weight decreases as index increases (first ingredients have more weight)
    const positionWeight = 1 - (index / totalIngredients);
    
    Object.entries(INGREDIENT_ANALYSIS).forEach(([category, data]) => {
      // Check direct matches and aliases
      const isMatch = data.ingredients.some(targetIngredient => {
        const targetLower = targetIngredient.toLowerCase();
        if (normalizedIngredient.includes(targetLower)) return true;
        
        // Check aliases
        for (const [main, aliases] of Object.entries(INGREDIENT_ALIASES)) {
          if (targetLower.includes(main) && 
              aliases.some(alias => normalizedIngredient.includes(alias.toLowerCase()))) {
            return true;
          }
        }
        return false;
      });

      if (isMatch) {
        // Apply position-based weight adjustment
        const adjustedWeight = data.weight * positionWeight;
        score += adjustedWeight;
        
        // Add processing method analysis if available
        const processingMethod = detectProcessingMethod(normalizedIngredient);
        const processingImpact = processingMethod ? ` (${processingMethod.impact})` : '';
        
        analysis.push(`${index + 1}. ${ingredient}: ${data.reason}${processingImpact}`);
      }
    });
  });

  return { score, analysis };
}

// Helper function to detect processing methods
function detectProcessingMethod(ingredient) {
  const PROCESSING_METHODS = {
    'raw': { impact: 'minimal processing', score: 0.2 },
    'roasted': { impact: 'moderate heat processing', score: -0.1 },
    'fried': { impact: 'high heat processing', score: -0.2 },
    'fermented': { impact: 'beneficial processing', score: 0.2 },
    'processed': { impact: 'industrial processing', score: -0.3 },
    'refined': { impact: 'nutrient reduction', score: -0.2 },
    'enriched': { impact: 'nutrient addition', score: 0.1 },
    'organic': { impact: 'minimal processing', score: 0.2 },
  };

  for (const [method, details] of Object.entries(PROCESSING_METHODS)) {
    if (ingredient.includes(method)) {
      return details;
    }
  }
  return null;
}

const SNACK_CATEGORIES = [
  'snacks', 'chips', 'crisps', 'crackers', 'cookies',
  'biscuits', 'namkeen', 'kurkure', 'extruded snacks'
];

// Add logging utilities
const ERROR_TYPES = {
  MISSING_DATA: 'missing_data',
  INVALID_VALUE: 'invalid_value',
  CALCULATION_ERROR: 'calculation_error',
  VALIDATION_ERROR: 'validation_error'
};

class HealthRatingError extends Error {
  constructor(type, message, details = {}) {
    super(message);
    this.name = 'HealthRatingError';
    this.type = type;
    this.details = details;
    this.timestamp = new Date();
  }
}

function logHealthRatingError(error, product) {
  const errorLog = {
    timestamp: error.timestamp || new Date(),
    type: error.type || 'unknown',
    message: error.message,
    details: error.details || {},
    productInfo: {
      id: product?._id,
      name: product?.name,
      category: product?.category,
      hasNutriments: !!product?.nutriments,
      hasIngredients: !!product?.ingredients
    }
  };

  console.error('Health Rating Error:', JSON.stringify(errorLog, null, 2));
  // In a production environment, you would send this to a logging service
  return errorLog;
}

function validateAnalysisResults(results, product) {
  const validationErrors = [];

  // Validate score range
  if (results.score < 1 || results.score > 5) {
    validationErrors.push({
      type: ERROR_TYPES.VALIDATION_ERROR,
      message: 'Score out of valid range',
      details: { score: results.score }
    });
  }

  // Check for unrealistic nutrient values
  if (product.nutriments) {
    Object.entries(product.nutriments).forEach(([nutrient, value]) => {
      if (value > 100 && !nutrient.includes('calories')) {
        validationErrors.push({
          type: ERROR_TYPES.VALIDATION_ERROR,
          message: 'Unrealistic nutrient value',
          details: { nutrient, value }
        });
      }
    });
  }

  // Validate analysis consistency
  const analysis = results.analysis || [];
  const hasNegativeFactors = analysis.some(a => 
    a.toLowerCase().includes('high in sugar') || 
    a.toLowerCase().includes('high in fat') ||
    a.toLowerCase().includes('processed')
  );

  if (hasNegativeFactors && results.score > 4.5) {
    validationErrors.push({
      type: ERROR_TYPES.VALIDATION_ERROR,
      message: 'Inconsistent analysis results',
      details: { 
        score: results.score,
        negativeFactors: analysis.filter(a => 
          a.toLowerCase().includes('high in sugar') || 
          a.toLowerCase().includes('high in fat') ||
          a.toLowerCase().includes('processed')
        )
      }
    });
  }

  return validationErrors;
}

// Update the main calculation function to use new error handling
function calculateHealthRating(product) {
  try {
    if (!product) {
      throw new HealthRatingError(
        ERROR_TYPES.MISSING_DATA,
        'No product data available'
      );
    }

    // Validate required fields
    const validationResult = validateProductData(product);
    if (!validationResult.isValid) {
      throw new HealthRatingError(
        ERROR_TYPES.MISSING_DATA,
        validationResult.message,
        { partialData: validationResult.partialData }
      );
    }

    let finalScore = 3;
    let analysis = [];
    
    try {
      // Product category detection
      const productCategory = detectProductCategory(product);
      const categoryMultiplier = productCategory?.scoreAdjustment || 1;

      // Nutrient analysis
      if (product.nutriments) {
        const validatedNutriments = validateNutriments(product.nutriments);
        const { score: nutrientScore, analysis: nutrientAnalysis } = 
          analyzeNutrients(validatedNutriments, productCategory);
        
        if (productCategory) {
          const focusNutrients = productCategory.nutritionalFocus;
          const relevantAnalysis = nutrientAnalysis.filter(a => 
            focusNutrients.some(nutrient => a.toLowerCase().includes(nutrient))
          );
          analysis = [...analysis, ...relevantAnalysis];
        } else {
          analysis = [...analysis, ...nutrientAnalysis];
        }
        
        finalScore = (finalScore * 0.4) + (nutrientScore * 0.6);
      }

      // Ingredient analysis
      if (product.ingredients) {
        const validatedIngredients = validateIngredients(product.ingredients);
        const { score: ingredientScore, analysis: ingredientAnalysis } = 
          analyzeIngredients(validatedIngredients);
        finalScore = (finalScore * 0.6) + (ingredientScore * 0.4);
        analysis = [...analysis, ...ingredientAnalysis];
      }

      // Apply category adjustments
      finalScore *= categoryMultiplier;

      if (productCategory) {
        analysis.push(`Analyzed as ${productCategory.category.replace('_', ' ')} product`);
      }

      // Normalize and validate results
      finalScore = normalizeScore(finalScore);
      
      const results = {
        score: finalScore,
        analysis: analysis,
        rating: getRatingLabel(finalScore),
        color: getRatingColor(finalScore),
        confidence: calculateConfidenceLevel(product),
        dataCompleteness: calculateDataCompleteness(product)
      };

      // Validate final results
      const validationErrors = validateAnalysisResults(results, product);
      if (validationErrors.length > 0) {
        throw new HealthRatingError(
          ERROR_TYPES.VALIDATION_ERROR,
          'Analysis validation failed',
          { errors: validationErrors }
        );
      }

      return results;

    } catch (innerError) {
      throw new HealthRatingError(
        ERROR_TYPES.CALCULATION_ERROR,
        'Error during health rating calculation',
        { originalError: innerError.message }
      );
    }

  } catch (error) {
    const errorLog = logHealthRatingError(error, product);
    
    // Return a safe default rating with error information
    return {
      score: 3,
      analysis: [`Error: ${error.message}`],
      rating: error.type === ERROR_TYPES.MISSING_DATA ? 'Insufficient Data' : 'Analysis Failed',
      color: 'gray',
      confidence: 0,
      error: errorLog,
      dataCompleteness: calculateDataCompleteness(product)
    };
  }
}

// Helper functions for data validation and processing
function validateProductData(product) {
  const result = {
    isValid: true,
    message: '',
    partialData: false
  };

  if (!product.name && !product.category) {
    result.isValid = false;
    result.message = 'Missing product name and category';
    return result;
  }

  if (!product.nutriments && !product.ingredients) {
    result.isValid = false;
    result.message = 'Missing both nutritional information and ingredients';
    return result;
  }

  if (!product.nutriments || !product.ingredients) {
    result.partialData = true;
  }

  return result;
}

function validateNutriments(nutriments) {
  const validated = {};
  
  Object.entries(NUTRITIONAL_GUIDELINES).forEach(([nutrient, guidelines]) => {
    const value = parseFloat(nutriments[nutrient]);
    if (!isNaN(value)) {
      // Check if value is within reasonable range
      const maxAllowed = guidelines.high * 5; // Allow up to 5x the "high" threshold
      validated[nutrient] = Math.min(Math.max(0, value), maxAllowed);
    }
  });

  return validated;
}

function validateIngredients(ingredients) {
  if (Array.isArray(ingredients)) {
    return ingredients.filter(i => typeof i === 'string' && i.trim().length > 0);
  }
  if (typeof ingredients === 'string') {
    return ingredients.split(',').map(i => i.trim()).filter(Boolean);
  }
  return [];
}

function normalizeScore(score) {
  return Math.max(1, Math.min(5, Math.round(score * 10) / 10));
}

function calculateConfidenceLevel(product) {
  let confidence = 0;
  
  // Check data completeness
  if (product.nutriments) confidence += 0.4;
  if (product.ingredients) confidence += 0.3;
  if (product.nutriscore_grade) confidence += 0.2;
  if (product.category) confidence += 0.1;

  return Math.min(1, confidence);
}

function calculateDataCompleteness(product) {
  const requiredFields = ['name', 'category', 'nutriments', 'ingredients'];
  const presentFields = requiredFields.filter(field => !!product[field]);
  return (presentFields.length / requiredFields.length) * 100;
}

function getDefaultRating(message, partialData = false) {
  return {
    score: 3,
    analysis: [message],
    rating: partialData ? 'Partial Analysis' : 'Analysis Failed',
    color: partialData ? 'yellow' : 'gray',
    confidence: partialData ? 0.5 : 0,
    pros: [],
    cons: [],
    dataCompleteness: 0
  };
}

function getRatingLabel(score) {
  if (score >= 4.5) return 'Excellent Choice';
  if (score >= 4) return 'Healthy Choice';
  if (score >= 3) return 'Moderately Healthy';
  if (score >= 2) return 'Less Healthy';
  return 'Not Recommended';
}

function getRatingColor(score) {
  if (score >= 4) return 'green';
  if (score >= 3) return 'yellow';
  if (score >= 2) return 'orange';
  return 'red';
}

module.exports = calculateHealthRating;