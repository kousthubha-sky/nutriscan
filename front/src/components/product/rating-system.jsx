import { Star } from "lucide-react"

export function RatingSystem() {
  return (
    <section id="rating" className="py-8 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">AI Analysis Summary</h2>
          <div className="flex items-center gap-1">
            <span className="font-bold text-xl">4.5</span>
            <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
          </div>
        </div>

        <p className="text-gray-700 dark:text-gray-300 mb-6">
          This organic granola cereal is a nutritious breakfast option with high-quality organic ingredients. It offers
          significant health benefits from whole grains, fiber, and essential nutrients, though the added sugar content
          and oil slightly reduce its overall health score. It's a good choice for most diets, especially when paired
          with fresh fruit or yogurt for a balanced meal.
        </p>

        <div className="flex justify-center mb-6">
          <button className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors">
            Get Full Analysis Report
          </button>
        </div>

        <h3 className="text-xl font-bold mb-4">Health Rating System</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Our AI analyzes ingredient lists to provide accurate health scores and unbiased evaluations.
        </p>

        <h4 className="font-medium mb-4">NutriScan Rating Scale</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {[
            {
              score: "5.0",
              rating: "Excellent",
              description: "Highly nutritious with minimal processing and no harmful additives.",
              color: "bg-green-100 dark:bg-green-900/20",
            },
            {
              score: "4.0",
              rating: "Good",
              description: "Nutritious with some minor processed ingredients or moderate sugar.",
              color: "bg-green-50 dark:bg-green-900/10",
            },
            {
              score: "3.0",
              rating: "Average",
              description: "Balance of nutritious and processed ingredients with moderate concerns.",
              color: "bg-yellow-50 dark:bg-yellow-900/10",
            },
            {
              score: "2.0",
              rating: "Below Average",
              description: "Highly processed with multiple concerning ingredients or additives.",
              color: "bg-orange-50 dark:bg-orange-900/10",
            },
            {
              score: "1.0",
              rating: "Poor",
              description: "Minimal nutritional value with numerous harmful additives and preservatives.",
              color: "bg-red-50 dark:bg-red-900/10",
            },
          ].map((item, i) => (
            <div key={i} className={`p-4 rounded-lg ${item.color}`}>
              <div className="flex justify-center mb-2">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    i === 0
                      ? "bg-green-500"
                      : i === 1
                        ? "bg-green-400"
                        : i === 2
                          ? "bg-yellow-400"
                          : i === 3
                            ? "bg-orange-400"
                            : "bg-red-500"
                  } text-white font-bold`}
                >
                  {item.score}
                </div>
              </div>
              <h5 className="font-medium text-center mb-2">{item.rating}</h5>
              <p className="text-xs text-center text-gray-600 dark:text-gray-400">{item.description}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h4 className="font-medium mb-4">What We Analyze</h4>
            <ul className="space-y-3">
              {[
                {
                  title: "Ingredient Quality",
                  description: "Whole foods vs. highly processed ingredients",
                },
                {
                  title: "Nutritional Content",
                  description: "Macronutrients, micronutrients, and dietary fiber",
                },
                {
                  title: "Additives & Preservatives",
                  description: "Artificial flavors, colors, sweeteners, and preservatives",
                },
                {
                  title: "Sugar & Salt Content",
                  description: "Added sugars, refined carbohydrates, and sodium levels",
                },
                {
                  title: "Processing Methods",
                  description: "Minimal vs. extensive processing techniques",
                },
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <div className="h-5 w-5 rounded-sm bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-600 dark:text-green-400 text-xs">✓</span>
                  </div>
                  <div>
                    <h5 className="font-medium">{item.title}</h5>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{item.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-4">How We Calculate Scores</h4>
            {[
              { label: "Ingredient Quality", value: 30 },
              { label: "Nutritional Value", value: 25 },
              { label: "Additives & Preservatives", value: 20 },
              { label: "Sugar & Salt Content", value: 15 },
              { label: "Processing Methods", value: 10 },
            ].map((item, i) => (
              <div key={i} className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>{item.label}</span>
                  <span>{item.value}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: `${item.value * 3}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

