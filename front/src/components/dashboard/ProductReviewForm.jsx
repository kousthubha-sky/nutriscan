import { useState } from 'react';
import { X, Check, AlertTriangle } from 'lucide-react';

export function ProductReviewForm({ submission, onSubmit, onClose }) {
  const [formData, setFormData] = useState({
    status: submission.status || 'pending',
    adminNotes: submission.adminNotes || '',
    productName: submission.productName || '',
    brand: submission.brand || '',
    category: submission.category || '',
    ingredients: submission.ingredients ? submission.ingredients.join(', ') : '',
    nutritionalInfo: {
      servingSize: submission.nutritionalInfo?.servingSize || '',
      calories: submission.nutritionalInfo?.calories || '',
      protein: submission.nutritionalInfo?.protein || '',
      carbohydrates: submission.nutritionalInfo?.carbohydrates || '',
      fat: submission.nutritionalInfo?.fat || '',
      fiber: submission.nutritionalInfo?.fiber || '',
      sugar: submission.nutritionalInfo?.sugar || '',
      sodium: submission.nutritionalInfo?.sodium || ''
    },
    allergens: submission.allergens ? submission.allergens.join(', ') : '',
    dietaryInfo: submission.dietaryInfo ? submission.dietaryInfo.join(', ') : ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: parent === 'nutritionalInfo' ? Number(value) || '' : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Convert comma-separated strings back to arrays and ensure numeric values
    const processedData = {
      status: formData.status,
      adminNotes: formData.adminNotes,
      productName: formData.productName,
      brand: formData.brand,
      category: formData.category,
      ingredients: formData.ingredients ? formData.ingredients.split(',').map(i => i.trim()).filter(Boolean) : [],
      nutritionalInfo: {
        servingSize: formData.nutritionalInfo.servingSize,
        calories: Number(formData.nutritionalInfo.calories) || 0,
        protein: Number(formData.nutritionalInfo.protein) || 0,
        carbohydrates: Number(formData.nutritionalInfo.carbohydrates) || 0,
        fat: Number(formData.nutritionalInfo.fat) || 0,
        fiber: Number(formData.nutritionalInfo.fiber) || 0,
        sugar: Number(formData.nutritionalInfo.sugar) || 0,
        sodium: Number(formData.nutritionalInfo.sodium) || 0
      },
      allergens: formData.allergens ? formData.allergens.split(',').map(i => i.trim()).filter(Boolean) : [],
      dietaryInfo: formData.dietaryInfo ? formData.dietaryInfo.split(',').map(i => i.trim()).filter(Boolean) : []
    };
    
    onSubmit(processedData);
  };

  return (
    <div className="bg-background rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-border">
        <h2 className="text-xl font-bold">Review Product Submission</h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-accent rounded-full transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-130px)]">
        <div className="space-y-6">
          {/* Status Selection */}
          <div className="space-y-2">
            <label className="block font-medium">Status*</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="status"
                  value="approved"
                  checked={formData.status === 'approved'}
                  onChange={handleInputChange}
                  className="text-primary"
                />
                <span className="flex items-center gap-1">
                  <Check className="w-4 h-4 text-green-500" />
                  Approve
                </span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="status"
                  value="rejected"
                  checked={formData.status === 'rejected'}
                  onChange={handleInputChange}
                  className="text-destructive"
                />
                <span className="flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  Reject
                </span>
              </label>
            </div>
          </div>

          {/* Admin Notes */}
          <div className="space-y-2">
            <label className="block font-medium">Admin Notes</label>
            <textarea
              name="adminNotes"
              value={formData.adminNotes}
              onChange={handleInputChange}
              className="w-full px-3 py-2 rounded-lg border border-border bg-accent/50"
              rows={3}
              placeholder="Add any notes about this submission..."
            />
          </div>

          {/* Product Details */}
          <div className="space-y-4">
            <h3 className="font-medium text-lg">Product Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium">Product Name</label>
                <input
                  type="text"
                  name="productName"
                  value={formData.productName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-accent/50"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Brand</label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-accent/50"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-accent/50"
                >
                  <option value="">Select Category</option>
                  <option value="dairy">Dairy Products</option>
                  <option value="snacks">Snacks</option>
                  <option value="beverages">Beverages</option>
                  <option value="grains">Grains & Cereals</option>
                  <option value="fruits">Fruits & Vegetables</option>
                  <option value="meat">Meat & Poultry</option>
                  <option value="seafood">Seafood</option>
                  <option value="bakery">Bakery</option>
                  <option value="condiments">Condiments & Sauces</option>
                  <option value="frozen">Frozen Foods</option>
                  <option value="organic">Organic Foods</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Ingredients</label>
                <input
                  type="text"
                  name="ingredients"
                  value={formData.ingredients}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-accent/50"
                  placeholder="Comma-separated ingredients"
                />
              </div>
            </div>

            {/* Nutritional Information */}
            <div className="space-y-4 border-t border-border pt-4">
              <h4 className="font-medium">Nutritional Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Serving Size</label>
                  <input
                    type="text"
                    name="nutritionalInfo.servingSize"
                    value={formData.nutritionalInfo.servingSize}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-accent/50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium">Calories</label>
                  <input
                    type="number"
                    name="nutritionalInfo.calories"
                    value={formData.nutritionalInfo.calories}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-accent/50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium">Protein (g)</label>
                  <input
                    type="number"
                    name="nutritionalInfo.protein"
                    value={formData.nutritionalInfo.protein}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-accent/50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium">Carbohydrates (g)</label>
                  <input
                    type="number"
                    name="nutritionalInfo.carbohydrates"
                    value={formData.nutritionalInfo.carbohydrates}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-accent/50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium">Fat (g)</label>
                  <input
                    type="number"
                    name="nutritionalInfo.fat"
                    value={formData.nutritionalInfo.fat}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-accent/50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium">Fiber (g)</label>
                  <input
                    type="number"
                    name="nutritionalInfo.fiber"
                    value={formData.nutritionalInfo.fiber}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-accent/50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium">Sugar (g)</label>
                  <input
                    type="number"
                    name="nutritionalInfo.sugar"
                    value={formData.nutritionalInfo.sugar}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-accent/50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium">Sodium (mg)</label>
                  <input
                    type="number"
                    name="nutritionalInfo.sodium"
                    value={formData.nutritionalInfo.sodium}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-accent/50"
                  />
                </div>
              </div>
            </div>

            {/* Allergens and Dietary Info */}
            <div className="space-y-4 border-t border-border pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Allergens</label>
                  <input
                    type="text"
                    name="allergens"
                    value={formData.allergens}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-accent/50"
                    placeholder="Comma-separated allergens"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium">Dietary Information</label>
                  <input
                    type="text"
                    name="dietaryInfo"
                    value={formData.dietaryInfo}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-accent/50"
                    placeholder="E.g., Vegan, Gluten-Free"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-8 border-t border-border pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-border hover:bg-accent"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Submit Review
          </button>
        </div>
      </form>
    </div>
  );
}