import React, { useEffect, useState } from 'react';
import { fetchRecommendations } from './services/api';
import './App.css';

function App() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchRecommendations()
      .then(response => setData(response.data))
      .catch(error => console.error(error));
  }, []);

  return (
    <div className="container mx-auto p-4">
      {/* Render data */}
    </div>
  );
}

export default App;