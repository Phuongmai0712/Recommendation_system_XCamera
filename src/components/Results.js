import React from 'react';
import { useLocation } from 'react-router-dom';

const RecommendationResults = () => {
  const location = useLocation();
  console.log(location.state); 
  const recommendations = location.state.recommendations.recommendations || [];

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Kết Quả Gợi Ý</h1>
      {recommendations.length > 0 ? (
        <ul className="space-y-3">
          {recommendations.map((product, index) => (
            <li
              key={index}
              className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="font-semibold text-lg">{product.model}</h3>
              <p className="text-gray-600">Giá: {product.price?.toLocaleString()} VND</p>
              <p className="text-blue-500">Điểm: {product.score}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-red-500">Không tìm thấy sản phẩm phù hợp</p>
      )}
    </div>
  );
};

export default RecommendationResults;