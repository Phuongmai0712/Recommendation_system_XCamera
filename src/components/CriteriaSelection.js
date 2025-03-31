import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const CriteriaSelection = () => {
    const { category } = useParams();
    const navigate = useNavigate();
    
    const [criteria, setCriteria] = useState({
        weight: '',
        purposes: [],
        price: [0, 50000000]
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (type === 'checkbox') {
            setCriteria((prev) => ({
                ...prev,
                purposes: checked
                    ? [...prev.purposes, value]
                    : prev.purposes.filter((p) => p !== value)
            }));
        } else {
            setCriteria((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handlePriceChange = (e) => {
        const { name, value } = e.target;
        setCriteria((prev) => ({
            ...prev,
            price: name === 'min_price' ? [parseInt(value) || 0, prev.price[1]] : [prev.price[0], parseInt(value) || 0]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://127.0.0.1:8000/recommend', { category, criteria });
            navigate('/results', { state: { recommendations: response.data } });
        } catch (error) {
            console.error('Lỗi:', error);
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
            <h1>Chọn Tiêu Chí cho {category}</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Trọng lượng:</label><br />
                    <select name="weight" onChange={handleChange} value={criteria.weight}>
                        <option value="">Chọn</option>
                        <option value="Light">Nhẹ (&lt;400g)</option>
                        <option value="Medium">Trung bình (400-600g)</option>
                        <option value="Heavy">Nặng (&gt;600g)</option>
                    </select>
                </div>
                <div style={{ marginTop: '10px' }}>
                    <label>Mục đích sử dụng:</label><br />
                    {['Beginner', 'Professional', 'Sports', 'Video', 'Travel', 'Vlogging'].map((purpose) => (
                        <label key={purpose} style={{ marginRight: '10px' }}>
                            <input
                                type="checkbox"
                                name="purposes"
                                value={purpose}
                                onChange={handleChange}
                                checked={criteria.purposes.includes(purpose)}
                            />
                            {purpose}
                        </label>
                    ))}
                </div>
                <div style={{ marginTop: '10px' }}>
                    <label>Khoảng giá (VND):</label><br />
                    <input
                        type="number"
                        name="min_price"
                        value={criteria.price[0]}
                        onChange={handlePriceChange}
                        placeholder="Giá tối thiểu"
                        style={{ marginRight: '10px' }}
                    />
                    <input
                        type="number"
                        name="max_price"
                        value={criteria.price[1]}
                        onChange={handlePriceChange}
                        placeholder="Giá tối đa"
                    />
                </div>
                <button
                    type="submit"
                    style={{
                        marginTop: '20px',
                        padding: '10px 20px',
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px'
                    }}
                >
                    Xem Gợi Ý
                </button>
            </form>
        </div>
    );
};

export default CriteriaSelection;