"use client"

import { useState, useEffect } from "react"

export function IngredientAnalysis({ product }) {
  const [expandedIngredient, setExpandedIngredient] = useState(null)

  useEffect(() => {
    if (product?.ingredients) {
      // Cache ingredient analysis data
      const cacheKey = `ingredient-analysis-${product._id || product.code}`;
      localStorage.setItem(cacheKey, JSON.stringify({
        ingredients: product.ingredients,
        timestamp: Date.now()
      }));
    }
  }, [product]);

  const toggleIngredient = (index) => {
    setExpandedIngredient(expandedIngredient === index ? null : index);
  };

  // Try to get cached data if no live data is available
  if (!product?.ingredients) {
    const cachedData = Object.keys(localStorage)
      .filter(key => key.startsWith('ingredient-analysis-'))
      .map(key => {
        try {
          return JSON.parse(localStorage.getItem(key));
        } catch {
          return null;
        }
      })
      .filter(Boolean)
      .sort((a, b) => b.timestamp - a.timestamp)[0];

    if (cachedData?.ingredients) {
      product = { ...product, ingredients: cachedData.ingredients };
    } else {
      return null;
    }
  }

  // Split ingredients string into array and clean up
  const ingredientsList = product.ingredients
    .split(',')
    .map(i => i.trim())
    .filter(i => i.length > 0);

  // Analyze each ingredient
  const analyzedIngredients = ingredientsList.map(ingredient => {
    // Default analysis
    let analysis = {
      name: ingredient,
      description: `${ingredient} - Natural food ingredient`,
      rating: "Good",
      nutrients: "Various nutrients",
      benefits: "Part of a balanced diet",
      concerns: "None significant",
      processing: "Minimal"
    };

    // Ingredient analysis patterns
    const patterns = {
      artificial: {
        keywords: ['artificial', 'color', 'flavour', 'flavor', 'E1', 'E2', 'E3', 'E4', 'E5'],
        analysis: {
          rating: "Poor",
          concerns: "Artificial additives",
          processing: "High",
          description: "Artificial ingredient or additive that may have health implications"
        }
      },
      natural: {
        keywords: ['organic', 'natural', 'fresh', 'raw', 'pure'],
        analysis: {
          rating: "Excellent",
          benefits: "Natural source of nutrients",
          processing: "Minimal",
          description: "Natural ingredient with minimal processing"
        }
      },
      preservatives: {
        keywords: ['preservative', 'nitrite', 'nitrate', 'sulfite', 'benzoate', 'sorbate'],
        analysis: {
          rating: "Moderate",
          concerns: "Added preservatives",
          processing: "Moderate",
          description: "Preservative used to extend shelf life"
        }
      },
      sweeteners: {
        keywords: ['sugar', 'syrup', 'sweetener', 'dextrose', 'fructose', 'glucose'],
        analysis: {
          rating: "Moderate",
          concerns: "Added sugars",
          processing: "Moderate",
          description: "Sweetening agent that contributes to sugar content"
        }
      },
      fats: {
        keywords: ['oil', 'fat', 'butter', 'margarine'],
        analysis: {
          rating: "Moderate",
          concerns: "Fat content",
          nutrients: "Fats and fatty acids",
          description: "Source of dietary fats"
        }
      }
    };

    // Analyze ingredient against patterns
    Object.entries(patterns).forEach(([, data]) => {
      if (data.keywords.some(keyword => 
        ingredient.toLowerCase().includes(keyword.toLowerCase())
      )) {
        analysis = { ...analysis, ...data.analysis };
      }
    });

    return analysis;
  });

  const getRatingColor = (rating) => {
    switch (rating) {
      case "Excellent":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      case "Good":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
      case "Moderate":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
      case "Poor":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
    }
  }

  return (
    <section id="ingredients" className="border-t border-gray-200 dark:border-gray-700 pt-6">
      <div>
        <h2 className="text-xl font-bold mb-2">Ingredient Analysis</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Detailed breakdown and analysis of each ingredient.
        </p>

        <div className="space-y-4">
          {analyzedIngredients.map((ingredient, index) => (
            <div key={index} className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
              <div className="p-4 cursor-pointer" onClick={() => toggleIngredient(index)}>
                <div className="flex justify-between items-center">
                  <h5 className="font-medium">{ingredient.name}</h5>
                  <span className={`text-xs px-2 py-1 rounded-full ${getRatingColor(ingredient.rating)}`}>
                    {ingredient.rating}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{ingredient.description}</p>
              </div>

              {expandedIngredient === index && (
                <div className="px-4 pb-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 mb-1">Nutrients</p>
                    <p>{ingredient.nutrients}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 mb-1">Benefits</p>
                    <p>{ingredient.benefits}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 mb-1">Concerns</p>
                    <p>{ingredient.concerns}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 mb-1">Processing</p>
                    <p>{ingredient.processing}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

