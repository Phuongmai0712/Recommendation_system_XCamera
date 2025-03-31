export const fetchRecommendations = async (criteria) => {
  try {
    const response = await axios.post(`http://localhost:8000/recommend`, criteria);
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};