import { Star, ChevronRight } from "lucide-react"
import { useTheme } from "next-themes"
import { useState, useEffect } from "react"
import api from "../../services/api"

export function HealthierAlternatives({ product, onAnalysisSelect }) {
  const { theme } = useTheme()
  const isDarkTheme = theme === "dark"
  const [alternatives, setAlternatives] = useState([])

  useEffect(() => {
    const fetchAlternatives = async () => {
      try {
        // Fetch alternatives based on product category or type
        const category = product?.category || 'healthy'
        const results = await api.searchProducts(`organic ${category}`, 1)
        
        // Filter and sort by health rating
        const healthierAlts = results.products
          .filter(alt => alt.healthRating > (product?.healthRating || 0))
          .sort((a, b) => b.healthRating - a.healthRating)
          .slice(0, 3)
          .map(alt => ({
            ...alt,
            tag: alt.healthRating >= 4.8 ? "Healthier Choice" :
                 alt.healthRating >= 4.5 ? "Organic" : "Better Choice"
          }))

        setAlternatives(healthierAlts)
      } catch (error) {
        console.error('Failed to fetch alternatives:', error)
      }
    }

    fetchAlternatives()
  }, [product])

  if (alternatives.length === 0) return null

  return (
    <section id="alternatives" className="py-8 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Healthier Alternatives</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {alternatives.map((alt, index) => (
            <div
              key={alt._id || index}
              className={`rounded-lg border ${isDarkTheme ? "border-gray-800" : "border-gray-200"} overflow-hidden bg-card hover:border-primary/50 transition-all duration-300`}
            >
              <div className="p-4">
                <div className="flex items-start gap-4">
                  {/* Product image */}
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 flex items-center justify-center rounded overflow-hidden">
                    <img
                      src={alt.imageUrl || "/placeholder.svg"}
                      alt={alt.name}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div className="flex-1">
                    <h3 className="font-medium line-clamp-2">{alt.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center">
                        <span className="font-medium text-sm mr-1">{alt.healthRating?.toFixed(1)}</span>
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      </div>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          alt.tag === "Organic"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            : alt.tag === "Better Choice"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                              : "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
                        }`}
                      >
                        {alt.tag}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Description from ingredient analysis */}
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 line-clamp-2">
                  {alt.description || `A healthier alternative with ${alt.healthRating >= 4.5 ? 'excellent' : 'better'} nutritional value.`}
                </p>
              </div>

              <div className="flex flex-col border-t border-border">
                <button 
                  onClick={() => window.open(`/product/${alt._id}`, '_blank')}
                  className="w-full  bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
                >
                  View Product
                </button>
                <button 
                  onClick={() => onAnalysisSelect?.(alt)}
                  className="w-full  mb-0 mt-3 bg-primary/10 hover:bg-primary/20 text-primary font-medium transition-colors flex items-center justify-center gap-1"
                >
                  View Analysis
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

