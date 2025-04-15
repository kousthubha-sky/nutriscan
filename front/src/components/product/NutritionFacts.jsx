import React, { useEffect } from 'react';

export function NutritionFacts({ nutriments, serving_size }) {
  useEffect(() => {
    if (nutriments) {
      // Cache nutrition data
      const cacheKey = `nutrition-${JSON.stringify(nutriments)}`;
      localStorage.setItem(cacheKey, JSON.stringify({
        nutriments,
        serving_size,
        timestamp: Date.now()
      }));
    }
  }, [nutriments, serving_size]);

  // Use cached data if no live data is available
  if (!nutriments) {
    // Try to find cached data for this product
    const cachedData = Object.keys(localStorage)
      .filter(key => key.startsWith('nutrition-'))
      .map(key => {
        try {
          const data = JSON.parse(localStorage.getItem(key));
          return { ...data, key };
        } catch {
          return null;
        }
      })
      .filter(Boolean)
      .sort((a, b) => b.timestamp - a.timestamp)[0]; // Get most recent

    if (cachedData) {
      nutriments = cachedData.nutriments;
      serving_size = cachedData.serving_size;
    } else {
      return (
        <div className="mt-6 p-4 border rounded-lg dark:border-gray-700">
          <h3 className="text-lg font-bold mb-2">Nutrition Facts</h3>
          <p className="text-sm text-gray-500">
            Nutrition information is currently unavailable.
          </p>
        </div>
      );
    }
  }

  const nutrients = [
    { key: 'energy_kcal_100g', label: 'Energy', unit: 'kcal' },
    { key: 'proteins_100g', label: 'Proteins', unit: 'g' },
    { key: 'carbohydrates_100g', label: 'Carbohydrates', unit: 'g' },
    { key: 'sugars_100g', label: 'Sugars', unit: 'g' },
    { key: 'fat_100g', label: 'Fat', unit: 'g' },
    { key: 'saturated_fat_100g', label: 'Saturated Fat', unit: 'g' },
    { key: 'fiber_100g', label: 'Fiber', unit: 'g' },
    { key: 'salt_100g', label: 'Salt', unit: 'g' },
  ];

  return (
    <div className="mt-6 p-4 border rounded-lg dark:border-gray-700">
      <h3 className="text-lg font-bold mb-2">Nutrition Facts</h3>
      <p className="text-sm text-gray-500 mb-4">
        Per {serving_size || '100g'}
      </p>
      
      <div className="space-y-2">
        {nutrients.map(({ key, label, unit }) => {
          const value = nutriments[key];
          if (value === undefined || value === null) return null;

          return (
            <div key={key} className="flex justify-between py-1 border-b dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">{label}</span>
              <span className="font-medium">
                {Number(value).toFixed(1)} {unit}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}