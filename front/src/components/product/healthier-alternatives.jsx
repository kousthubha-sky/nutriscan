import { Star } from "lucide-react"
import { useTheme } from "next-themes"

export function HealthierAlternatives({ product }) {
  const { theme } = useTheme()
  const isDarkTheme = theme === "dark"

  // Generate alternatives based on product category and health score
  const generateAlternatives = (product) => {
    // Default alternatives if no product data
    if (!product) return alternativeProducts

    const currentScore = product.healthRating || 0

    // Filter mock alternatives based on better health scores
    return alternativeProducts.filter(alt => 
      alt.rating > currentScore // Only show products with better health scores
    ).map(alt => ({
      ...alt,
      tag: alt.rating >= 4.8 ? "Healthier Choice" :
           alt.rating >= 4.7 ? "Organic" : "Sprouted Grains"
    }))
  }

  const alternatives = generateAlternatives(product)

  if (alternatives.length === 0) return null

  return (
    <section id="alternatives" className="py-8 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Healthier Alternatives</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {alternatives.map((product, index) => (
            <div
              key={index}
              className={`rounded-lg border ${isDarkTheme ? "border-gray-800" : "border-gray-200"} overflow-hidden`}
            >
              <div className="p-4">
                <div className="flex items-start gap-4">
                  {/* Product image */}
                  <div className="w-16 h-16 bg-gray-100 flex items-center justify-center rounded">
                    <img
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      className="w-12 h-12 object-contain"
                    />
                  </div>

                  <div>
                    <h3 className="font-medium">{product.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center">
                        <span className="font-medium text-sm mr-1">{product.rating}</span>
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      </div>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          product.tag === "Organic"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            : product.tag === "Sprouted Grains"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                              : "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
                        }`}
                      >
                        {product.tag}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">{product.description}</p>
              </div>

              <button className="w-full py-2 bg-green-500 hover:bg-green-600 text-white transition-colors">
                View Product
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Mock alternatives data - will be replaced with real data in future
const alternativeProducts = [
  {
    name: "Bob's Red Mill Muesli",
    brand: "Bob's Red Mill",
    image: "/placeholder.svg?height=80&width=80",
    rating: 4.8,
    tag: "Healthier Choice",
    description: "Lower in sugar (4g) with higher fiber content (7g). Contains no oils and uses minimal processing.",
  },
  {
    name: "Purely Elizabeth Ancient Grain",
    brand: "Purely Elizabeth",
    image: "/placeholder.svg?height=80&width=80",
    rating: 4.7,
    tag: "Organic",
    description: "Sweetened with coconut sugar (lower glycemic impact) and contains beneficial ancient grains.",
  },
  {
    name: "Ezekiel 4:9 Sprouted Grain",
    brand: "Ezekiel 4:9",
    image: "/placeholder.svg?height=80&width=80",
    rating: 4.6,
    tag: "Sprouted Grains",
    description: "Made with sprouted whole grains for better digestibility and nutrient absorption. No added oils.",
  },
]

