const API_BASE = 'http://localhost:3000';

const api = {
  async searchProducts(query, page = 1) {
    console.log('Searching with query:', query, 'page:', page);
    
    try {
      const url = `${API_BASE}/products/search?q=${encodeURIComponent(query)}&page=${page}`;
      console.log('Request URL:', url);
      
      const response = await fetch(url);
      const data = await response.json();
      
      console.log('API Response:', data);
      
      if (!response.ok) {
        throw new Error(data.message || 'Search failed');
      }
      
      return {
        products: data.products || [],
        currentPage: Number(data.currentPage) || page,
        totalPages: Number(data.totalPages) || 1,
        query // Include the query in the response
      };
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }
};

export default api;