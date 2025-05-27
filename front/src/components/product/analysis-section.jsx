"use client"

import { useTheme } from "next-themes"
import { CheckCircle2, XCircle, BookOpen, Share2, Star } from "lucide-react"
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { HealthierAlternatives } from "./healthier-alternatives"

export function AnalysisSection({ product }) {
  const { theme } = useTheme()
  const isDarkTheme = theme === "dark"
  const [showFullAnalysis, setShowFullAnalysis] = useState(false)
  const [currentProduct, setCurrentProduct] = useState(null)

  // Update current product when product prop changes
  useEffect(() => {
    if (product) {
      setCurrentProduct(product);
    }
  }, [product]); // Updated dependency array

  useEffect(() => {
    if (currentProduct?.healthRating) {
      // Cache analysis data
      const cacheKey = `analysis-${currentProduct._id || currentProduct.code}`;
      localStorage.setItem(cacheKey, JSON.stringify({
        healthRating: currentProduct.healthRating,
        healthAnalysis: currentProduct.healthAnalysis,
        category: currentProduct.category,
        name: currentProduct.name,
        brand: currentProduct.brand,
        timestamp: Date.now()
      }));
    }
  }, [currentProduct]);

  // Use cached data if no live data is available
  if (!currentProduct) {
    return null;
  }

  // Add mock AI analysis data
  const aiAnalysis = {
    summary: "This product has been analyzed by our AI system for nutritional value and health implications.",
    healthSummary: `Based on our analysis, this ${currentProduct?.category || 'product'} provides a balanced nutritional profile with key benefits for health-conscious consumers. The health score of ${currentProduct?.healthRating?.toFixed(1) || '3.0'} reflects its overall nutritional quality.`,
    recommendations: [
      "Suitable for a balanced diet when consumed in moderation",
      "Good choice for health-conscious consumers",
      "Consider portion size to maintain balanced nutrition"
    ],
    nutritionalInsights: currentProduct?.genericName 
      ? `${currentProduct.genericName}. The nutrient composition indicates a well-balanced product with consideration for daily nutritional needs.` 
      : "The nutrient composition indicates a well-balanced product with consideration for daily nutritional needs. Our AI analysis takes into account factors such as ingredient quality, processing methods, and nutritional density.",
    sustainabilityNote: "Product packaging and ingredients suggest moderate environmental impact. Future updates will include detailed sustainability metrics.",
    disclaimer: "This analysis is generated using available product data and will be enhanced with AI-powered insights in future updates."
  };
  // Transform API data or use fallbacks
  const analysis = {
    title: currentProduct?.product_name || currentProduct?.name || "Product Name",
    brand: currentProduct?.brands || currentProduct?.brand || "Unknown Brand",
    healthScore: currentProduct?.healthRating || 3.0,
    tags: [
      currentProduct?.category,
      currentProduct?.nutriscore_grade?.toUpperCase() && `Nutri-Score ${currentProduct.nutriscore_grade.toUpperCase()}`,
      ...(currentProduct?.labels?.split(',') || [])
    ].filter(Boolean),
    barcode: currentProduct?.barcode || currentProduct?.code,
    productId: currentProduct?._id,
    analyzedOn: new Date().toLocaleDateString(),
    description: `${aiAnalysis.healthSummary}\n\n${aiAnalysis.nutritionalInsights}\n\n${aiAnalysis.disclaimer}`,
    pros: currentProduct?.healthAnalysis?.filter(a => !a.includes('High in') && !a.includes('Contains')) || [],
    cons: currentProduct?.healthAnalysis?.filter(a => a.includes('High in') || a.includes('Contains')) || [],
    nutrients: currentProduct?.nutriments || {},
    ingredients: currentProduct?.ingredients || "Ingredients not available",
    allergens: (currentProduct?.allergens?.split(',') || []).map(a => a.trim()),
    harmfulIngredients: currentProduct?.harmfulIngredients || "No harmful ingredients detected",
    recommendations: aiAnalysis.recommendations
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-lg border ${isDarkTheme ? "border-gray-800" : "border-gray-600"} overflow-hidden bg-card`}
    >
      {/* Initial Analysis Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Product Image Section */}
        <div className="relative h-100 mt-5 bg-muted">
          <img
            src={currentProduct?.imageUrl || currentProduct?.image_url || "/placeholder.png"}
            alt={analysis.title}
            className="w-full h-full object-contain"
          />
          <div className="absolute top-4 right-4 bg-white/90 dark:bg-gray-800/90 px-3 py-1.5 rounded-full flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            <span className="font-bold">{analysis.healthScore.toFixed(1)}</span>
          </div>
        </div>

        {/* Analysis Content Section */}
        <div className="p-6 md:col-span-2">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">{analysis.title}</h2>
            <p className="text-lg text-muted-foreground">{analysis.brand}</p>
            
            <div className="flex flex-wrap gap-2 mt-4">
              {analysis.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="bg-muted/50 p-6 rounded-lg space-y-4 backdrop-blur-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Barcode</p>
                <p className="mt-1">{analysis.barcode}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Product ID</p>
                <p className="mt-1">{currentProduct.barcode || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Analyzed on</p>
                <p className="mt-1">{analysis.analyzedOn}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 mt-6">
            <button 
              onClick={() => setShowFullAnalysis(!showFullAnalysis)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <BookOpen className="h-5 w-5" />
              <span>{showFullAnalysis ? 'Hide Full Analysis' : 'Read Full Analysis'}</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-accent text-accent-foreground hover:bg-accent/90 transition-colors">
              <Share2 className="h-5 w-5" />
              <span>Share Analysis</span>
            </button>
          </div>
        </div>
      </div>

      {/* Additional Analysis Sections */}
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ 
          opacity: showFullAnalysis ? 1 : 0,
          height: showFullAnalysis ? "auto" : 0
        }}
        transition={{ duration: 0.3 }}
        className="border-t border-border overflow-hidden"
      >
        <div className="p-6 space-y-8">
          {/* AI-Powered Analysis */}
          <section>
            <h3 className="text-xl font-bold mb-4"> Analysis</h3>
            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-muted-foreground mb-2">Overall Assessment</h4>
                <p className="text-foreground">{aiAnalysis.healthSummary}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-muted-foreground mb-2">Nutritional Insights</h4>
                <p className="text-foreground">{aiAnalysis.nutritionalInsights}</p>
              </div>

              <div>
                <h4 className="font-medium text-muted-foreground mb-2">Recommendations</h4>
                <ul className="space-y-2">
                  {aiAnalysis.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 mt-1 text-green-500 flex-shrink-0" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-muted-foreground mb-2">Sustainability</h4>
                <p className="text-foreground">{aiAnalysis.sustainabilityNote}</p>
              </div>
            </div>
          </section>

          {/* Detailed Nutritional Analysis */}
          <section>
            <h3 className="text-xl font-bold mb-4">Detailed Nutritional Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium text-muted-foreground">Nutrition Facts</h4>
                <div className="space-y-2">
                  {Object.entries(analysis.nutrients).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-1 border-b dark:border-gray-700">
                      <span className="text-muted-foreground">
                        {key.replace(/([A-Z])/g, " $1").replace(/_100g/g, "")}
                      </span>
                      <span className="font-medium">
                        {typeof value === 'number' ? value.toFixed(1) : value}
                        {key.includes('energy') ? ' kcal' : 'g'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-muted-foreground">Health Implications</h4>
                <div className="space-y-6">
                  <div>
                    <h5 className="text-sm font-medium text-green-600 mb-2">Benefits</h5>
                    <ul className="space-y-2">
                      {analysis.pros.map((pro, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-500 flex-shrink-0" />
                          <span>{pro}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h5 className="text-sm font-medium text-red-600 mb-2">Concerns</h5>
                    <ul className="space-y-2">
                      {analysis.cons.map((con, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <XCircle className="w-4 h-4 mt-0.5 text-red-500 flex-shrink-0" />
                          <span>{con}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Disclaimer */}
          <section className="border-t border-border pt-6">
            <p className="text-sm text-muted-foreground italic">
              {aiAnalysis.disclaimer}
            </p>
          </section>
        </div>
      </motion.div>
    </motion.div>
  )
}


