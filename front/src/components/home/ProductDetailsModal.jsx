export default function ProductDetailsModal({ product, onClose }) {
  if (!product) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start">
            <h2 className="text-2xl font-bold mb-4">{product.product_name || product.name}</h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          {product.image_url && (
            <img 
              src={product.image_url} 
              alt={product.product_name || product.name}
              className="w-full max-h-64 object-contain mb-4"
            />
          )}

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg">Product Information</h3>
              <p><strong>Brand:</strong> {product.brands || product.brand || 'N/A'}</p>
              <p><strong>Category:</strong> {product.categories || product.category || 'N/A'}</p>
            </div>

            {product.ingredients && (
              <div>
                <h3 className="font-semibold text-lg">Ingredients</h3>
                <p className="text-gray-600">{product.ingredients}</p>
              </div>
            )}

            {product.nutrition_facts && (
              <div>
                <h3 className="font-semibold text-lg">Nutrition Facts</h3>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(product.nutrition_facts).map(([key, value]) => (
                    <div key={key} className="border-b py-1">
                      <span className="font-medium">{key}:</span> {value}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {product.allergens && (
              <div>
                <h3 className="font-semibold text-lg text-red-600">Allergens</h3>
                <p className="text-red-600">{product.allergens}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}