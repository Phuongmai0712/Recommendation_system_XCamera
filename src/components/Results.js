import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const RecommendationResults = () => {
  const location = useLocation();
  const [recommendations, setRecommendations] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('specs');
  const [sortOption, setSortOption] = useState('score'); 

  useEffect(() => {
    const initialData = location.state?.recommendations?.recommendations || [];
    setRecommendations([...initialData]); 
  }, [location.state]);

  const openModal = (product) => {
    setSelectedProduct(product);
    setActiveTab('specs');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const formatPrice = (price) => {
    return price?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const handleSort = (option) => {
    let sortedData = [...recommendations];
    
    switch (option) {
      case 'price_asc':
        sortedData.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        sortedData.sort((a, b) => b.price - a.price);
        break;
      case 'year_asc':
        sortedData.sort((a, b) => a.details["release year"] - b.details["release year"]);
        break;
      case 'year_desc':
        sortedData.sort((a, b) => b.details["release year"] - a.details["release year"]);
        break;
      case 'name_asc':
        sortedData.sort((a, b) => a.model.localeCompare(b.model));
        break;
      case 'name_desc':
        sortedData.sort((a, b) => b.model.localeCompare(a.model));
        break;
      case 'score':
        sortedData.sort((a, b) => b.score - a.score);
        break;
      default:
        break;
    }
    
    setRecommendations(sortedData);
    setSortOption(option);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Kết Quả Gợi Ý</h1>

      {recommendations.length > 0 ? (
        <>
          <div className="mb-4 flex flex-wrap gap-2 justify-end">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2">
              <label className="text-sm text-gray-600 mr-2">Sắp xếp theo:</label>
              <select 
                className="border-gray-200 rounded text-sm px-2 py-1"
                value={sortOption}
                onChange={(e) => handleSort(e.target.value)}
              >
                <option value="score">Độ phù hợp</option>
                <option value="price_asc">Giá: Thấp đến cao</option>
                <option value="price_desc">Giá: Cao đến thấp</option>
                <option value="year_desc">Năm: Mới nhất</option>
                <option value="year_asc">Năm: Cũ nhất</option>
                <option value="name_asc">Tên: A-Z</option>
                <option value="name_desc">Tên: Z-A</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map((product, index) => (
              <div
                key={index}
                className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-200"
                onClick={() => openModal(product)}
              >
                <div className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-xl text-gray-800 uppercase">{product.model}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.condition === 'new' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                      {product.condition === 'new' ? 'Mới' : 'Đã sử dụng'}
                    </span>
                  </div>

                  <div className="mb-3 flex items-center">
                    <span className="text-lg font-semibold text-gray-900">{formatPrice(product.price)} VND</span>
                    {product.free_gift !== 'none' && (
                      <span className="ml-2 bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">
                        + {product.free_gift}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Độ phân giải:</span> {product.details["resolution (mp)"]} MP
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Cảm biến:</span> {product.details["sensor size"]}
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Năm ra mắt:</span> {product.details["release year"]}
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Màu:</span> {product.colour}
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    {product.score > 0 && (<div className="flex items-center">
                      <div className="w-20 bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-blue-600 h-2.5 rounded-full"
                          style={{ width: `${product.score * 100}%` }}
                        ></div>
                      </div>
                      <span className="ml-2 text-sm font-medium text-gray-700">{(product.score * 10).toFixed(1)}/10</span>
                    </div>)}
                    <button
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        openModal(product);
                      }}
                    >
                      Chi tiết
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center p-10 bg-white rounded-lg shadow">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-lg font-medium text-gray-600">Không tìm thấy sản phẩm phù hợp</p>
          <p className="text-gray-500 mt-2">Vui lòng thử lại với tiêu chí khác</p>
        </div>
      )}

      {modalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center p-2">
          <div
            className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 border-b flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-lg font-bold text-gray-800">{selectedProduct.model.toUpperCase()}</h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-4">
              <div className="mb-4 bg-gray-50 p-3 rounded-lg">
                <div className="flex flex-wrap gap-3 justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Giá</p>
                    <p className="font-semibold text-gray-900">{formatPrice(selectedProduct.price)} VND</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Tình trạng</p>
                    <p className="font-medium text-gray-800">{selectedProduct.condition === 'new' ? 'Mới' : 'Đã sử dụng'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Màu sắc</p>
                    <p className="font-medium text-gray-800 capitalize">{selectedProduct.colour}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Series</p>
                    <p className="font-medium text-gray-800">{selectedProduct.series}</p>
                  </div>
                  {selectedProduct.explanation && (
                  <div>
                    <p className="text-xs text-gray-500">Giải thích đề xuất</p>
                    <p className="font-medium text-gray-800">{selectedProduct.model.toUpperCase() + " " + selectedProduct.explanation}</p>
                  </div>
                  )}
                  {selectedProduct.free_gift !== 'none' && (
                    <div>
                      <p className="text-xs text-gray-500">Quà tặng</p>
                      <p className="font-medium text-green-600">{selectedProduct.free_gift}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-3 border-b">
                <div className="flex space-x-4">
                  <button
                    className={`px-3 py-2 border-b-2 text-sm font-medium ${activeTab === 'specs' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    onClick={() => setActiveTab('specs')}
                  >
                    Thông số kỹ thuật
                  </button>
                  <button
                    className={`px-3 py-2 border-b-2 text-sm font-medium ${activeTab === 'usecases' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    onClick={() => setActiveTab('usecases')}
                  >
                    Mục đích sử dụng
                  </button>
                </div>
              </div>

              {activeTab === 'specs' && (
                <div className="mb-4">
                  <h3 className="font-medium text-sm mb-2 text-gray-700">Thông số kỹ thuật</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(selectedProduct.details)
                      .filter(([key]) => !['beginner', 'professional', 'sports', 'video', 'daily use', 'travel', 'vlogging', 'studio'].includes(key))
                      .map(([key, value], idx) => (
                        <div key={idx} className="flex justify-between p-1 border-b border-gray-100">
                          <span className="text-gray-600 capitalize text-xs">{key.replace(/_/g, ' ')}</span>
                          <span className="font-medium text-gray-800 text-xs">
                            {typeof value === 'number' && (key.includes('ibis') || key.includes('wifi') || key.includes('bluetooth') || key.includes('viewfinder') || key.includes('weathersealing') || key.includes('4k') || key.includes('film') || key.includes('flipscreen') || key.includes('mic') || key.includes('style'))
                              ? value === 1 ? 'Có' : 'Không'
                              : value}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {activeTab === 'usecases' && (
                <div className="mb-4">
                  <h3 className="font-medium text-sm mb-2 text-gray-700">Phù hợp cho</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(selectedProduct.details)
                      .filter(([key]) => ['beginner', 'professional', 'sports', 'video', 'daily use', 'travel', 'vlogging', 'studio'].includes(key))
                      .map(([key, value], idx) => (
                        <div key={idx} className="bg-gray-50 p-2 rounded">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-medium text-gray-700 capitalize">{key.replace(/_/g, ' ')}</span>
                            <span className="text-xs font-medium text-gray-500">{(value * 10).toFixed(1)}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1">
                            <div
                              className="bg-blue-600 h-1 rounded-full"
                              style={{ width: `${value * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>

            <div className="border-t p-2 flex justify-end sticky bottom-0 bg-white">
              <button
                onClick={closeModal}
                className="px-4 py-1 bg-gray-200 hover:bg-gray-300 rounded text-gray-800 font-medium text-sm transition-colors duration-200"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecommendationResults;