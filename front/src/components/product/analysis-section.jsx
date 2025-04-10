"use client"

import { useTheme } from "next-themes"
import { CheckCircle2, XCircle, BookOpen, Share2, Star } from "lucide-react"
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion"

export function AnalysisSection({ product }) {
  const { theme } = useTheme()
  const isDarkTheme = theme === "dark"

  // Add mock AI analysis data
  const aiAnalysis = {
    summary: "This product has been analyzed by our AI system for nutritional value and health implications.",
    healthSummary: `Based on our analysis, this ${product?.category || 'product'} provides a balanced nutritional profile with key benefits for health-conscious consumers. The health score of ${product?.healthRating?.toFixed(1) || '3.0'} reflects its overall nutritional quality.`,
    recommendations: [
      "Suitable for a balanced diet when consumed in moderation",
      "Good choice for health-conscious consumers",
      "Consider portion size to maintain balanced nutrition"
    ],
    nutritionalInsights: "The nutrient composition indicates a well-balanced product with consideration for daily nutritional needs. Our AI analysis takes into account factors such as ingredient quality, processing methods, and nutritional density.",
    sustainabilityNote: "Product packaging and ingredients suggest moderate environmental impact. Future updates will include detailed sustainability metrics.",
    disclaimer: "This analysis is generated using available product data and will be enhanced with AI-powered insights in future updates."
  };

  // Transform API data or use fallbacks
  const analysis = {
    title: product?.name || "Product Name",
    brand: product?.brand || "Unknown Brand",
    healthScore: product?.healthRating || 3.0,
    tags: [
      product?.category,
      product?.nutriscore_grade?.toUpperCase() && `Nutri-Score ${product.nutriscore_grade.toUpperCase()}`,
      ...(product?.labels?.split(',') || [])
    ].filter(Boolean),
    barcode: product?.barcode || product?.code,
    productId: product?._id,
    analyzedOn: new Date().toLocaleDateString(),
    description: `${aiAnalysis.healthSummary}\n\n${aiAnalysis.nutritionalInsights}\n\n${aiAnalysis.disclaimer}`,
    pros: product?.healthAnalysis?.filter(a => !a.includes('High in') && !a.includes('Contains')) || [],
    cons: product?.healthAnalysis?.filter(a => a.includes('High in') || a.includes('Contains')) || [],
    nutrients: product?.nutriments || {},
    ingredients: product?.ingredients || "Ingredients not available",
    allergens: (product?.allergens?.split(',') || []).map(a => a.trim()),
    harmfulIngredients: product?.harmfulIngredients || "No harmful ingredients detected",
    recommendations: aiAnalysis.recommendations
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${isDarkTheme ? "border-gray-800" : "border-gray-200"} p-8 bg-card my-12 mx-auto max-w-7xl rounded-xl shadow-lg scroll-mt-24`}
    >
      {/* Main title section */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight mb-2">{analysis.title}</h2>
        <p className="text-lg text-muted-foreground font-medium">{analysis.brand}</p>
      </div>

      {/* Grid layout for photo and content */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Photo section */}
        <div className="lg:w-1/3">
          <div className="bg-muted rounded-xl overflow-hidden p-6 sticky top-24">
            <img
              src={product?.imageUrl || product?.image_url || "/placeholder.png"}
              alt={analysis.title}
              className="w-full h-auto object-contain"
            />
          </div>
        </div>

        {/* Content section */}
        <div className="lg:w-2/3">
          {/* Health Score and Tags */}
          <div className="mb-8">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                <span className="text-lg font-bold text-primary">{analysis.healthScore.toFixed(1)}</span>
                <span className="text-sm font-medium text-primary">Health Score</span>
              </div>
              <div className="flex flex-wrap gap-2">
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

            {/* Product Details Card */}
            <div className="bg-muted/50 rounded-lg p-6 space-y-3 backdrop-blur-sm border border-border/50 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Barcode</p>
                  <p className="font-medium">{analysis.barcode}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Product ID</p>
                  <p className="font-medium">{analysis.productId}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Analyzed on</p>
                  <p className="font-medium">{analysis.analyzedOn}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="prose dark:prose-invert max-w-none mb-8">
              <p className="text-base leading-relaxed text-muted-foreground">
                {analysis.description}
              </p>
            </div>

            {/* Recommendations */}
            <div className="space-y-3 mb-8">
              <h4 className="font-semibold">Recommendations</h4>
              <ul className="space-y-2">
                {analysis.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 mt-1 text-green-500" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4">
              <button className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                <BookOpen className="h-5 w-5" />
                <span>Read Full Analysis</span>
              </button>
              <button className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-accent text-accent-foreground hover:bg-accent/90 transition-colors">
                <Share2 className="h-5 w-5" />
                <span>Share Analysis</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Pros and Cons Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div>
          <h3 className="font-medium flex items-center gap-2 text-green-600">
            <CheckCircle2 className="w-5 h-5" />
            Pros
          </h3>
          <ul className="ml-6 space-y-1 text-muted-foreground">
            {analysis.pros.map((pro, index) => (
              <li key={index} className="list-disc">{pro}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-medium flex items-center gap-2 text-red-600">
            <XCircle className="w-5 h-5" />
            Cons
          </h3>
          <ul className="ml-6 space-y-1 text-muted-foreground">
            {analysis.cons.map((con, index) => (
              <li key={index} className="list-disc">{con}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Updated Nutrition Facts and Ingredients Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 w-300">
        <div className=" p-4">
          <h3 className="text-lg font-bold mb-2 pb-2 border-b-4 border-gray-800 dark:border-gray-200">
            Nutrition Facts
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Per 100g serving
          </p>
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
        <div className=" p-4 ml-8 mt-4">
          <h3 className="font-medium">Ingredients</h3>
          <p className="text-sm text-muted-foreground">{analysis.ingredients}</p>
          <h4 className="font-medium mt-4">Potential Allergens:</h4>
          <ul className="text-sm text-red-600 space-y-1">
            {analysis.allergens.map((allergen, index) => (
              <li key={index}>{allergen}</li>
            ))}
          </ul>
          <h4 className="font-medium mt-4">Harmful Ingredients:</h4>
          <p className="text-sm text-green-600">{analysis.harmfulIngredients}</p>
        </div>
      </div>
    </motion.div>
  )
}


