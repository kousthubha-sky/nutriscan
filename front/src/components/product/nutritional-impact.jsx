import { Check, X, AlertTriangle } from "lucide-react"

export function NutritionalImpact({ product }) {
  if (!product) return null;

  // Map product data to benefits
  const getBenefits = () => {
    const benefits = [];
    
    // Check fiber content
    if (product.nutriments?.fiber_100g > 3) {
      benefits.push({
        title: "Rich in Dietary Fiber",
        description: "Supports digestive health and helps maintain healthy blood sugar levels",
      });
    }

    // Check protein content
    if (product.nutriments?.proteins_100g > 5) {
      benefits.push({
        title: "Good Source of Protein",
        description: `Contains ${product.nutriments.proteins_100g.toFixed(1)}g of protein per 100g`,
      });
    }

    // Check if organic
    if (product.labels?.toLowerCase().includes('organic')) {
      benefits.push({
        title: "Organic Certification",
        description: "Reduced exposure to synthetic pesticides and fertilizers",
      });
    }

    // Add benefits based on health analysis
    product.healthAnalysis?.forEach(analysis => {
      if (analysis.includes('Good source') || analysis.includes('Low in') || analysis.includes('beneficial')) {
        benefits.push({
          title: analysis.split(':')[0],
          description: analysis.split(':')[1]?.trim() || "Contributes to a balanced diet",
        });
      }
    });

    return benefits.slice(0, 4); // Limit to 4 benefits
  };

  // Map product data to concerns
  const getConcerns = () => {
    const concerns = [];
    
    // Check sugar content
    if (product.nutriments?.sugars_100g > 10) {
      concerns.push({
        title: "Added Sugar Content",
        description: `Contains ${product.nutriments.sugars_100g.toFixed(1)}g of sugars per 100g`,
        icon: <X className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />,
      });
    }

    // Check fat content
    if (product.nutriments?.fat_100g > 17.5) {
      concerns.push({
        title: "High Fat Content",
        description: `Contains ${product.nutriments.fat_100g.toFixed(1)}g of fat per 100g`,
        icon: <X className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />,
      });
    }

    // Check allergens
    if (product.allergens) {
      concerns.push({
        title: "Potential Allergens",
        description: `Contains or may contain: ${product.allergens}`,
        icon: <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />,
      });
    }

    // Add concerns based on health analysis
    product.healthAnalysis?.forEach(analysis => {
      if (analysis.includes('High in') || analysis.includes('Contains') && !analysis.includes('Good source')) {
        concerns.push({
          title: analysis.split(':')[0],
          description: analysis.split(':')[1]?.trim() || "May affect overall nutritional balance",
          icon: <X className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />,
        });
      }
    });

    return concerns.slice(0, 4); // Limit to 4 concerns
  };

  // Determine dietary compatibility
  const getDietaryCompatibility = () => {
    const ingredients = (product.ingredients || '').toLowerCase();
    
    return [
      {
        diet: "Vegetarian",
        compatible: !ingredients.includes('meat') && !ingredients.includes('gelatin'),
        note: null,
      },
      {
        diet: "Vegan",
        compatible: !ingredients.includes('milk') && !ingredients.includes('egg') && !ingredients.includes('honey'),
        note: null,
      },
      {
        diet: "Gluten-Free",
        compatible: !ingredients.includes('wheat') && !ingredients.includes('gluten') ? true : "caution",
        note: ingredients.includes('wheat') ? "Contains wheat" : "May contain traces of gluten",
      },
      {
        diet: "Keto",
        compatible: product.nutriments?.carbohydrates_100g < 10,
        note: product.nutriments?.carbohydrates_100g >= 10 ? "Too high in carbs" : null,
      },
      {
        diet: "Low-Sugar",
        compatible: product.nutriments?.sugars_100g < 5 ? true : "caution",
        note: product.nutriments?.sugars_100g >= 5 ? `Contains ${product.nutriments.sugars_100g.toFixed(1)}g sugars` : null,
      },
      {
        diet: "Nut-Free",
        compatible: !ingredients.includes('nut') ? true : "caution",
        note: ingredients.includes('nut') ? "Contains nuts" : null,
      }
    ];
  };

  // Analyze processing methods based on ingredients and product category
  const getProcessingMethods = () => {
    const ingredients = (product.ingredients || '').toLowerCase();
    const methods = [];

    // Common processing methods based on ingredients
    if (ingredients.includes('oat') || ingredients.includes('rolled')) {
      methods.push({
        method: "Rolling",
        description: "Moderate processing that maintains most nutrients",
        impact: "minimal"
      });
    }

    if (ingredients.includes('flour') || ingredients.includes('ground')) {
      methods.push({
        method: "Grinding",
        description: "Minimal processing that maintains nutrient profile",
        impact: "minimal"
      });
    }

    if (ingredients.includes('oil') || ingredients.includes('extract')) {
      methods.push({
        method: "Oil extraction",
        description: "Moderate processing with potential heat exposure",
        impact: "moderate"
      });
    }

    if (ingredients.includes('roast') || ingredients.includes('toast') || 
        ingredients.includes('baked') || ingredients.includes('cooked')) {
      methods.push({
        method: "Heat processing",
        description: "Moderate heat processing that may affect some heat-sensitive nutrients",
        impact: "moderate"
      });
    }

    if (ingredients.includes('ferment')) {
      methods.push({
        method: "Fermentation",
        description: "Beneficial processing that may enhance nutrient availability",
        impact: "beneficial"
      });
    }

    if (ingredients.includes('spray') || ingredients.includes('dried')) {
      methods.push({
        method: "Spray drying",
        description: "Moderate processing that may affect heat-sensitive nutrients",
        impact: "moderate"
      });
    }

    return methods;
  };

  // Analyze additives in the product
  const getAdditivesAnalysis = () => {
    const ingredients = (product.ingredients || '').toLowerCase();
    const additives = {
      artificial: false,
      types: []
    };

    // Check for common artificial additives
    const artificialIndicators = [
      'e1', 'e2', 'e3', 'e4', 'e5',
      'artificial', 'flavor', 'colour', 'color',
      'preservative', 'sweetener', 'aspartame',
      'msg', 'monosodium glutamate'
    ];

    artificialIndicators.forEach(indicator => {
      if (ingredients.includes(indicator)) {
        additives.artificial = true;
        additives.types.push(indicator);
      }
    });

    // Check for natural additives
    const naturalAdditives = [
      'natural flavor', 'organic', 'plant extract',
      'herb extract', 'spice extract', 'natural color'
    ];

    naturalAdditives.forEach(additive => {
      if (ingredients.includes(additive)) {
        additives.types.push(additive);
      }
    });

    return additives;
  };

  const benefits = getBenefits();
  const concerns = getConcerns();
  const dietaryCompatibility = getDietaryCompatibility();
  const processingMethods = getProcessingMethods();
  const additivesAnalysis = getAdditivesAnalysis();

  return (
    <section id="impact" className="py-8 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Nutritional Impact Assessment</h2>

        {/* Health Benefits and Concerns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-green-50 dark:bg-green-900/10 p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-4">Health Benefits</h3>
            <ul className="space-y-4">
              {benefits.map((benefit, i) => (
                <li key={i} className="flex gap-3">
                  <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium">{benefit.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{benefit.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-red-50 dark:bg-red-900/10 p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-4">Health Concerns</h3>
            <ul className="space-y-4">
              {concerns.map((concern, i) => (
                <li key={i} className="flex gap-3">
                  {concern.icon}
                  <div>
                    <h4 className="font-medium">{concern.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{concern.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Dietary Compatibility */}
        <h3 className="text-xl font-bold mb-4">Dietary Compatibility</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {dietaryCompatibility.map((diet, i) => (
            <div key={i} className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 text-center">
              <div className="flex justify-center mb-2">
                {diet.compatible === true ? (
                  <Check className="h-6 w-6 text-green-500" />
                ) : diet.compatible === "caution" ? (
                  <AlertTriangle className="h-6 w-6 text-yellow-500" />
                ) : (
                  <X className="h-6 w-6 text-red-500" />
                )}
              </div>
              <h4 className="font-medium mb-1">{diet.diet}</h4>
              {diet.note && <p className="text-xs text-gray-500 dark:text-gray-400">{diet.note}</p>}
            </div>
          ))}
        </div>

        {/* Additives & Processing Methods */}
        <h3 className="text-xl font-bold mb-4">Additives & Processing Methods</h3>
        <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-lg space-y-6">
          {/* Additives Analysis */}
          <div>
            <h4 className="font-semibold mb-3">Additives Analysis</h4>
            {additivesAnalysis.artificial ? (
              <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-500 mb-3">
                <AlertTriangle className="h-5 w-5" />
                <span className="font-medium">Contains artificial additives:</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-green-600 dark:text-green-500 mb-3">
                <Check className="h-5 w-5" />
                <span className="font-medium">No artificial preservatives, flavors, colors, or sweeteners detected.</span>
              </div>
            )}
            {additivesAnalysis.types.length > 0 && (
              <ul className="ml-7 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                {additivesAnalysis.types.map((additive, index) => (
                  <li key={index} className="list-disc">{additive}</li>
                ))}
              </ul>
            )}
          </div>

          {/* Processing Methods */}
          <div>
            <h4 className="font-semibold mb-3">Processing Methods:</h4>
            <div className="space-y-4">
              {processingMethods.map((method, index) => (
                <div key={index} className="flex items-start gap-2">
                  {method.impact === 'minimal' && <Check className="h-5 w-5 text-green-600 mt-0.5" />}
                  {method.impact === 'moderate' && <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />}
                  {method.impact === 'high' && <X className="h-5 w-5 text-red-600 mt-0.5" />}
                  <div>
                    <span className="font-medium">{method.method}:</span>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{method.description}</p>
                  </div>
                </div>
              ))}
              {processingMethods.length === 0 && (
                <p className="text-sm text-gray-600 dark:text-gray-400">Processing methods information not available for this product.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

