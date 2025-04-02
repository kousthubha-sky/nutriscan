const API_BASE = 'http://localhost:3000';

const api = {
  async searchProducts(query, page = 1) {
    try {
      const response = await fetch(
        `${API_BASE}/products/search?q=${encodeURIComponent(query)}&page=${page}&fields=product_name,name,brand,brands,categories,image_url,ingredients,nutrition_facts,description,allergens`
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Search failed');
      }
      
      const data = await response.json();
      console.log('API Response:', data); // Debug log
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  // Add other API methods here when needed
  // Example:
  /*
  async getProductDetails(barcode) {
    const response = await fetch(`${API_BASE}/products/${barcode}`);
    if (!response.ok) throw new Error('Product not found');
    return await response.json();
  }
  */
};

export default api;