import axios from 'axios';

const API_URL = 'http://localhost:8000';

export const fetchRecommendations = async (criteria) => {
  try {
    const response = await axios.post(`${API_URL}/recommend`, criteria);
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};