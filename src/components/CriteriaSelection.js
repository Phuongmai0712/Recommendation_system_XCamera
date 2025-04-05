import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const CriteriaSelection = () => {
    const { category } = useParams();
    const navigate = useNavigate();

    const [criteria, setCriteria] = useState({
        weight: '',
        designStyle: '',
        resolution: '',
        video4K: '',
        isoMax: '',
        flipscreen: '',
        flipscreenType: '',
        opticalViewfinder: '',
        electronicViewfinder: '',
        specialFeatures: [],
        lensType: '',
        maxAperture: '',
        ois: '',
        maxFlightTime: '',
        cameraResolution: '',
        obstacleAvoidance: '',
        maxFlightSpeed: '',
        controlRange: '',
        maximumPayload: '',
        batteryLife: '',
        deviceCompatibility: '',
        videoRecordingCapabilities: '',
        purposes: [],
        price: [1000, 100000000]
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (type === 'checkbox') {
            setCriteria((prev) => ({
                ...prev,
                [name]: checked
                    ? [...prev[name], value]
                    : prev[name].filter((item) => item !== value)
            }));
        } else {
            setCriteria((prev) => ({ ...prev, [name]: value }));
        }
    };

    const formatNumber = (num) => {
        if (!num) return '';
        const cleanNum = num.toString().replace(/\D/g, '').replace(/^0+/, '');
        return cleanNum.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    };

    const parseFormattedNumber = (str) => {
        if (!str) return '';
        return str.replace(/\D/g, '');
    };

    const handlePriceChange = (e) => {
        const { name, value } = e.target;
        const index = name === 'min_price' ? 0 : 1;

        const parsedValue = parseFormattedNumber(value);

        const newPrice = [...criteria.price];
        newPrice[index] = parsedValue;

        setCriteria({
            ...criteria,
            price: newPrice
        });
    };

    const getDisplayValue = (index) => {
        return formatNumber(criteria.price[index]);
    };

    const selectAll = (field, options) => {
        setCriteria((prev) => ({
            ...prev,
            [field]: [...options]
        }));
    };

    const deselectAll = (field) => {
        setCriteria((prev) => ({
            ...prev,
            [field]: []
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

    const CheckboxGroup = ({ title, name, options, labels }) => {
        return (
            <div className="criteria-group">
                <label className="criteria-label">{title}:</label>
                <div className="select-buttons">
                    <button
                        type="button"
                        className="select-btn"
                        onClick={() => selectAll(name, options)}
                    >
                        Chọn hết
                    </button>
                    <button
                        type="button"
                        className="select-btn"
                        onClick={() => deselectAll(name)}
                    >
                        Bỏ chọn hết
                    </button>
                </div>
                <div className="checkbox-container">
                    {options.map((option, index) => (
                        <label key={option} className="checkbox-label">
                            <input
                                type="checkbox"
                                name={name}
                                value={option}
                                onChange={handleChange}
                                checked={criteria[name].includes(option)}
                            />
                            <span>{labels ? labels[index] : option}</span>
                        </label>
                    ))}
                </div>
            </div>
        );
    };

    const SelectField = ({ label, name, options, values, defaultOption = "Chọn" }) => {
        return (
            <div className="criteria-group">
                <label className="criteria-label">{label}:</label>
                <select
                    name={name}
                    onChange={handleChange}
                    value={criteria[name]}
                    className="select-input"
                >
                    <option value="">{defaultOption}</option>
                    {options.map((option, index) => (
                        <option key={option} value={values ? values[index] : option}>
                            {option}
                        </option>
                    ))}
                </select>
            </div>
        );
    };

    const commonFields = () => {
        return (
            <>
                <SelectField
                    label="Tình trạng"
                    name="Condition"
                    options={['Mới', 'Đã qua sử dụng']}
                    values={['New', 'Used']}
                />
            </>
        );
    };

    const colorFields = () => {
        return (
            <>
                <SelectField
                    label="Màu sắc"
                    name="Colour"
                    options={['Đen', 'Bạc', 'Trắng', 'Xám', 'Khác']}
                    values={['Black', 'Silver', 'White', 'Gray', 'Other']}
                />
            </>
        );
    };

    const renderCriteria = () => {
        switch (category.toLowerCase().trim()) {
            case 'cameras':
                const cameraSpecialFeatures = ['Weathersealing', 'IBIS', 'USB-C'];
                const cameraSpecialFeaturesLabels = ['Chống nước, bụi', 'Ổn định hình ảnh', 'USB-C'];
                const cameraPurposes = ['Beginner', 'Professional', 'Sports', 'Video', 'Daily Use', 'Travel', 'Vlogging', 'Studio'];

                return (
                    <>
                        {commonFields()}
                        {colorFields()}
                        
                        <SelectField
                            label="Trọng lượng"
                            name="Weight"
                            options={['Nhẹ (<400g)', 'Trung bình (400-600g)', 'Nặng (>600g)']}
                            values={['Light', 'Medium', 'Heavy']}
                        />

                        <SelectField
                            label="Kiểu dáng"
                            name="Design Style"
                            options={['Mirrorless', 'Compact']}
                            values={['mirrorless', 'compact']}
                        />

                        <SelectField
                            label="Độ phân giải (MP)"
                            name="Resolution"
                            options={['Dưới 20MP (nhu cầu cơ bản)', '20-30MP (bán chuyên)', 'Trên 30MP (chuyên nghiệp)']}
                            values={['Below 20MP', '20-30MP', 'Above 30MP']}
                        />

                        <SelectField
                            label="Quay video 4K"
                            name="4K Video"
                            options={['Có', 'Không']}
                            values={['Yes', 'No']}
                        />

                        <SelectField
                            label="ISO tối đa"
                            name="ISO Max"
                            options={['Thông thường (6400-12800, linh hoạt)', 'Cao (chụp đêm)']}
                            values={['General', 'High']}
                        />

                        <SelectField
                            label="Màn hình lật"
                            name="Flipscreen"
                            options={['Có', 'Không']}
                            values={['Yes', 'No']}
                        />

                        {criteria.Flipscreen === 'Yes' && (
                            <SelectField
                                label="Loại màn hình lật"
                                name="Flipscreen Type"
                                options={['Tilt (góc thấp)', 'Full (vlogging, selfie)']}
                                values={['Tilt', 'Full']}
                            />
                        )}

                        <SelectField
                            label="Kính ngắm quang học"
                            name="Optical Viewfinder"
                            options={['Có', 'Không']}
                            values={['Yes', 'No']}
                        />

                        <SelectField
                            label="Kính ngắm điện tử"
                            name="Electronic Viewfinder (EVF)"
                            options={['Có', 'Không']}
                            values={['Yes', 'No']}
                        />

                        <CheckboxGroup
                            title="Tính năng đặc biệt"
                            name="specialFeatures"
                            options={cameraSpecialFeatures}
                            labels={cameraSpecialFeaturesLabels}
                        />

                        <CheckboxGroup
                            title="Mục đích sử dụng"
                            name="purposes"
                            options={cameraPurposes}
                        />
                    </>
                );

            case 'lenses':
                const lensPurposes = ['Landscape', 'Travel', 'Portrait', 'Sports', 'Macro', 'Street', 'Video'];

                return (
                    <>
                        {commonFields()}
                        {colorFields()}
                        
                        <SelectField
                            label="Loại ống kính"
                            name="Lens Type"
                            options={['Prime', 'Zoom']}
                            values={['Fixed', 'Zoom']}
                        />

                        <SelectField
                            label="Khẩu độ tối đa"
                            name="Max Aperture"
                            options={[
                                'Rộng (f/1.0-f/1.8, chân dung, chụp đêm, bokeh)',
                                'Trung bình (f/2-f/2.8, đa dụng)',
                                'Hẹp (f/3.5-f/5.6, phong cảnh)'
                            ]}
                            values={['Wide', 'Medium', 'Narrow']}
                        />

                        <SelectField
                            label="Chống rung quang học (OIS)"
                            name="OIS"
                            options={['Có', 'Không']}
                            values={['Yes', 'No']}
                        />

                        <CheckboxGroup
                            title="Mục đích sử dụng"
                            name="purposes"
                            options={lensPurposes}
                        />
                    </>
                );

            case 'drones':
                const droneSpecialFeatures = ['Tracking', 'Orbit Mode', 'Vertical Video Recording'];
                const dronePurposes = ['Sports', 'Travel', 'Vlogging', 'Professional', 'Easy of use'];

                return (
                    <>
                        {commonFields()}
                        
                        <SelectField
                            label="Trọng lượng"
                            name="Weight"
                            options={['Nhẹ (<250g)', 'Trung bình (250-900g)']}
                            values={['Light', 'Medium']}
                        />

                        <SelectField
                            label="Thời gian bay tối đa (phút)"
                            name="Max Flight Time"
                            options={['Trung bình (20-30 phút)', 'Lâu (trên 30 phút)']}
                            values={['General', 'Long']}
                        />

                        <SelectField
                            label="Độ phân giải camera"
                            name="Camera Resolution"
                            options={['4K', '5.1K', '5.4K']}
                        />

                        <SelectField
                            label="Khung hình mỗi giây"
                            name="Frames Per Sec"
                            options={['30fps', '50fps', '60fps', '120fps']}
                        />

                        <SelectField
                            label="Cảm biến tránh vật cản"
                            name="Obstacle Avoidance Sensor"
                            options={['Có', 'Không']}
                            values={['Yes', 'No']}
                        />

                        <SelectField
                            label="Tốc độ bay tối đa"
                            name="Maximum Flight Speed (km/h)"
                            options={[
                                'Chậm (Dưới 36 km/h, phù hợp người mới)',
                                'Trung bình (36-54 km/h, dùng cơ bản)',
                                'Nhanh (54-70 km/h, cân bằng tốc độ và độ ổn định)',
                                'Rất nhanh (Trên 70 km/h, thể thao, tốc độ cao)'
                            ]}
                            values={['Slow', 'Moderate', 'Fast', 'Very Fast']}
                        />

                        <SelectField
                            label="Khoảng cách điều khiển"
                            name="Control Range (km)"
                            options={[
                                'Ngắn (Dưới 10 km, quay gần)',
                                'Trung bình (10-15 km, du lịch)',
                                'Xa (Trên 15 km, chuyên nghiệp)'
                            ]}
                            values={['Short', 'Medium', 'Long']}
                        />

                        <CheckboxGroup
                            title="Tính năng đặc biệt"
                            name="specialFeatures"
                            options={droneSpecialFeatures}
                        />

                        <CheckboxGroup
                            title="Mục đích sử dụng"
                            name="purposes"
                            options={dronePurposes}
                        />
                    </>
                );

            case 'gimbals':
                const gimbalSpecialFeatures = ['Time-lapse', 'Follow Mode', 'App Connectivity'];
                const gimbalPurposes = ['Travel', 'Vlogging', 'Professional', 'Easy of use'];

                return (
                    <>
                        {commonFields()}
                        
                        <SelectField
                            label="Khả năng tải tối đa (kg)"
                            name="Maximum Payload (kg)"
                            options={[
                                '<0.3kg (Smartphone)',
                                '2kg (Small camera)',
                                '3-4.5kg (Full-frame camera)'
                            ]}
                            values={['0.3kg', '0.3-2kg', 'Above 2kg']}
                        />

                        <SelectField
                            label="Thời lượng pin (giờ)"
                            name="Battery Life (hours)"
                            options={['Dưới 10h', 'Trên 10h']}
                            values={['Below 10h', 'Above 10h']}
                        />

                        <SelectField
                            label="Tương thích thiết bị"
                            name="Device Compatibility"
                            options={['Phone', 'Small camera', 'Full-frame camera']}
                            values={['phone', 'small camera', 'full-frame camera']}
                        />

                        <CheckboxGroup
                            title="Tính năng đặc biệt"
                            name="specialFeatures"
                            options={gimbalSpecialFeatures}
                        />

                        <CheckboxGroup
                            title="Mục đích sử dụng"
                            name="purposes"
                            options={gimbalPurposes}
                        />
                    </>
                );

            case 'action_cameras':
                const actionCamSpecialFeatures = ['Time-lapse', 'Slow Motion', 'Water Resistance', 'Shock Resistance'];
                const actionCamPurposes = ['Travel', 'Sports', 'Vlogging', 'Durability', 'Easy of use', 'Low-light Performance'];

                return (
                    <>
                        <SelectField
                            label="Trọng lượng"
                            name="Weight"
                            options={['Nhẹ (Dưới 100g)', 'Trung bình (100-200g)']}
                            values={['Light', 'Medium']}
                        />

                        <SelectField
                            label="Khả năng quay video"
                            name="Video Recording Capabilities"
                            options={['4K/60fps', '4K/120fps', '5.3K/60fps']}
                        />

                        <SelectField
                            label="Thời lượng pin (phút)"
                            name="Battery Life (minutes)"
                            options={[
                                'Dưới 100 phút',
                                '100-150 phút',
                                'Trên 150 phút'
                            ]}
                            values={['Below 100 minutes', '100-150 minutes', 'Above 150 minutes']}
                        />

                        <CheckboxGroup
                            title="Tính năng đặc biệt"
                            name="specialFeatures"
                            options={actionCamSpecialFeatures}
                        />

                        <CheckboxGroup
                            title="Mục đích sử dụng"
                            name="purposes"
                            options={actionCamPurposes}
                        />
                    </>
                );

            default:
                return <p className="error-message">Category không hợp lệ</p>;
        }
    };

    return (
        <div className="criteria-container">
            <h1 className="criteria-title">Chọn tiêu chí cho {category == "action_cameras" ? "action cameras" : category.toLowerCase()}</h1>
            <form onSubmit={handleSubmit} className="criteria-form">
                {renderCriteria()}

                <div className="price-range">
                    <label className="criteria-label">Khoảng giá (VND):</label>
                    <div className="price-inputs">
                        <input
                            type="text"
                            name="min_price"
                            value={getDisplayValue(0)}
                            onChange={handlePriceChange}
                            placeholder="Giá tối thiểu"
                            className="price-input"
                        />
                        <span className="price-separator">-</span>
                        <input
                            type="text"
                            name="max_price"
                            value={getDisplayValue(1)}
                            onChange={handlePriceChange}
                            placeholder="Giá tối đa"
                            className="price-input"
                        />
                    </div>
                </div>

                <button type="submit" className="submit-button">
                    Xem Gợi Ý
                </button>
            </form>

            <style jsx>{`
                .criteria-container {
                    padding: 30px;
                    max-width: 800px;
                    margin: 0 auto;
                    background-color: #ffffff;
                    border-radius: 10px;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
                }
                
                .criteria-title {
                    text-align: center;
                    color: #333;
                    margin-bottom: 30px;
                    font-size: 28px;
                }
                
                .criteria-form {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
                    gap: 20px;
                }
                
                .criteria-group {
                    margin-bottom: 15px;
                    padding: 10px;
                    border-radius: 8px;
                    background-color: #f9f9f9;
                }
                
                .criteria-label {
                    display: block;
                    font-weight: bold;
                    margin-bottom: 8px;
                    color: #444;
                }
                
                .select-input {
                    width: 100%;
                    padding: 10px;
                    border: 1px solid #ddd;
                    border-radius: 5px;
                    background-color: white;
                    font-size: 14px;
                }
                
                .checkbox-container {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 10px;
                    margin-top: 10px;
                }
                
                .checkbox-label {
                    display: flex;
                    align-items: center;
                    margin-right: 10px;
                    cursor: pointer;
                    padding: 5px 10px;
                    background-color: #f0f0f0;
                    border-radius: 30px;
                    transition: all 0.2s;
                }
                
                .checkbox-label:hover {
                    background-color: #e0e0e0;
                }
                
                .checkbox-label input {
                    margin-right: 5px;
                }
                
                .checkbox-label input:checked + span {
                    font-weight: bold;
                    color: dodgerblue;
                }
                
                .select-buttons {
                    display: flex;
                    gap: 10px;
                    margin-bottom: 10px;
                }
                
                .select-btn {
                    padding: 5px 10px;
                    background-color: #e7e7e7;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 12px;
                    transition: background-color 0.3s;
                }
                
                .select-btn:hover {
                    background-color: #d7d7d7;
                }
                
                .price-range {
                    grid-column: 1 / -1;
                    margin-top: 10px;
                    padding: 15px;
                    background-color: #f9f9f9;
                    border-radius: 8px;
                }
                
                .price-inputs {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                
                .price-input {
                    flex: 1;
                    padding: 10px;
                    border: 1px solid #ddd;
                    border-radius: 5px;
                }
                
                .price-separator {
                    font-weight: bold;
                    color: #555;
                }
                
                .submit-button {
                    grid-column: 1 / -1;
                    margin-top: 20px;
                    padding: 12px 20px;
                    background-color: dodgerblue;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    font-size: 16px;
                    font-weight: bold;
                    cursor: pointer;
                    transition: background-color 0.3s;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                }
                
                .submit-button:hover {
                    background-color: dodgerblue;
                }
                
                .error-message {
                    color: #f44336;
                    font-weight: bold;
                    text-align: center;
                }
                
                @media (max-width: 768px) {
                    .criteria-form {
                        grid-template-columns: 1fr;
                    }
                    
                    .criteria-container {
                        padding: 20px;
                    }
                }
            `}</style>
        </div>
    );
};

export default CriteriaSelection;