import React from 'react';
import { useNavigate } from 'react-router-dom';

const categories = ['Cameras', 'Lenses', 'Drones', 'Gimbals', 'Action Cameras'];

const CategorySelection = () => {
    const navigate = useNavigate();

    const handleCategorySelect = (category) => {
        navigate(`/criteria/${category}`);
    };

    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h1>Chọn Danh Mục</h1>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
                {categories.map((category) => (
                    <div
                        key={category}
                        onClick={() => handleCategorySelect(category)}
                        style={{
                            padding: '20px',
                            backgroundColor: '#4CAF50',
                            color: 'white',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            width: '150px',
                            textAlign: 'center'
                        }}
                    >
                        {category}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CategorySelection;