import React from 'react';
import { useLocation } from 'react-router-dom';

const Results = () => {
    const location = useLocation();
    const recommendations = location.state?.recommendations || [];

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
            <h1>Kết Quả Gợi Ý</h1>
            {recommendations.length > 0 ? (
                <ul style={{ listStyleType: 'none', padding: 0 }}>
                    {recommendations.map((product, index) => (
                        <li
                            key={index}
                            style={{
                                padding: '10px',
                                border: '1px solid #ddd',
                                borderRadius: '5px',
                                marginBottom: '10px'
                            }}
                        >
                            <strong>{product.Model || 'Sản phẩm'}</strong><br />
                            Giá: {product.Price ? `${product.Price.toLocaleString()} VND` : 'N/A'}<br />
                            Điểm: {product.Score ? product.Score.toFixed(2) : 'N/A'}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>Không tìm thấy sản phẩm phù hợp.</p>
            )}
            <button
                onClick={() => window.history.back()}
                style={{
                    padding: '10px 20px',
                    backgroundColor: '#f44336',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px'
                }}
            >
                Quay Lại
            </button>
        </div>
    );
};

export default Results;