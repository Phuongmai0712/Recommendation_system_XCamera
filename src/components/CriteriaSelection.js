import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const CriteriaSelection = () => {
    const { category } = useParams();
    const navigate = useNavigate();

    // Khởi tạo state với tất cả các tiêu chí có thể
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
        price: [0, 100000000] // Mặc định giá từ 0 đến 100,000,000 VND
    });

    // Xử lý thay đổi cho dropdown và checkbox
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

    // Xử lý thay đổi giá
    const handlePriceChange = (e) => {
        const { name, value } = e.target;
        setCriteria((prev) => ({
            ...prev,
            price: name === 'min_price' ? [parseInt(value) || 0, prev.price[1]] : [prev.price[0], parseInt(value) || 0]
        }));
    };

    // Gửi dữ liệu khi submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://127.0.0.1:8000/recommend', { category, criteria });
            navigate('/results', { state: { recommendations: response.data } });
        } catch (error) {
            console.error('Lỗi:', error);
        }
    };

    // Render tiêu chí theo category
    const renderCriteria = () => {
        switch (category.toLowerCase()) {
            case 'cameras':
                return (
                    <>
                        <div>
                            <label>Trọng lượng:</label><br />
                            <select name="Weight" onChange={handleChange} value={criteria['Weight']}>
                                <option value="">Chọn</option>
                                <option value="Light">Nhẹ (&lt;400g)</option>
                                <option value="Medium">Trung bình (400-600g)</option>
                                <option value="Heavy">Nặng (&gt;600g)</option>
                            </select>
                        </div>
                        <div>
                            <label>Kiểu dáng:</label><br />
                            <select name="Design Style" onChange={handleChange} value={criteria['Design Style']}>
                                <option value="">Chọn</option>
                                <option value="mirrorless">Mirrorless</option>
                                <option value="compact">Compact</option>
                            </select>
                        </div>
                        <div>
                            <label>Độ phân giải (MP):</label><br />
                            <select name="Resolution" onChange={handleChange} value={criteria['Resolution']}>
                                <option value="">Chọn</option>
                                <option value="Below 20MP">Dưới 20MP (nhu cầu cơ bản)</option>
                                <option value="20-30MP">20-30MP (bán chuyên)</option>
                                <option value="Above 30MP">Trên 30MP (chuyên nghiệp)</option>
                            </select>
                        </div>
                        <div>
                            <label>Quay video 4K:</label><br />
                            <select name="4K Video" onChange={handleChange} value={criteria['4K Video']}>
                                <option value="">Chọn</option>
                                <option value="Yes">Có</option>
                                <option value="No">Không</option>
                            </select>
                        </div>
                        <div>
                            <label>ISO tối đa:</label><br />
                            <select name="ISO Max" onChange={handleChange} value={criteria['ISO Max']}>
                                <option value="">Chọn</option>
                                <option value="Low">Thấp (&lt;6400, sáng tốt)</option>
                                <option value="Medium">Trung bình (6400-12800, linh hoạt)</option>
                                <option value="High">Cao (&gt;12800, chụp đêm)</option>
                            </select>
                        </div>
                        <div>
                            <label>Màn hình lật:</label><br />
                            <select name="Flipscreen" onChange={handleChange} value={criteria['Flipscreen']}>
                                <option value="">Chọn</option>
                                <option value="Yes">Có</option>
                                <option value="No">Không</option>
                            </select>
                            {criteria.flipscreen === 'Yes' && (
                                <div>
                                    <label>Loại màn hình lật:</label><br />
                                    <select name="Flipscreen type" onChange={handleChange} value={criteria['Flipscreen type']}>
                                        <option value="">Chọn</option>
                                        <option value="Tilt">Tilt (góc thấp)</option>
                                        <option value="Full">Full (vlogging, selfie)</option>
                                    </select>
                                </div>
                            )}
                        </div>
                        <div>
                            <label>Kính ngắm quang học:</label><br />
                            <select name="Optical Viewfinder" onChange={handleChange} value={criteria['Optical Viewfinder']}>
                                <option value="">Chọn</option>
                                <option value="Yes">Có</option>
                                <option value="No">Không</option>
                            </select>
                        </div>
                        <div>
                            <label>Kính ngắm điện tử:</label><br />
                            <select name="Electronic Viewfinder (EVF)" onChange={handleChange} value={criteria['Electronic Viewfinder (EVF)']}>
                                <option value="">Chọn</option>
                                <option value="Yes">Có</option>
                                <option value="No">Không</option>
                            </select>
                        </div>
                        <div>
                            <label>Tính năng đặc biệt:</label><br />
                            {['Weathersealing', 'IBIS', 'USB-C'].map((feature) => (
                                <label key={feature} style={{ marginRight: '10px' }}>
                                    <input
                                        type="checkbox"
                                        name="specialFeatures"
                                        value={feature}
                                        onChange={handleChange}
                                        checked={criteria.specialFeatures.includes(feature)}
                                    />
                                    {feature === 'Weathersealing' ? 'Chống nước, bụi' : feature === 'IBIS' ? 'Ổn định hình ảnh' : 'USB-C'}
                                </label>
                            ))}
                        </div>
                        <div>
                            <label>Mục đích sử dụng:</label><br />
                            {['Beginner', 'Professional', 'Sports', 'Video', 'Daily Use', 'Travel', 'Vlogging','Studio'].map((purpose) => (
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
                    </>
                );
            case 'lenses':
                return (
                    <>
                        <div>
                            <label>Loại ống kính:</label><br />
                            <select name="Lens Type" onChange={handleChange} value={criteria['Lens Type']}>
                                <option value="">Chọn</option>
                                <option value="Fixed">Prime</option>
                                <option value="Zoom">Zoom</option>
                            </select>
                        </div>
                        <div>
                            <label>Khẩu độ tối đa:</label><br />
                            <select name="Max Aperture" onChange={handleChange} value={criteria['Max Aperture']}>
                                <option value="">Chọn</option>
                                <option value="Wide">Rộng (&lt;f/2.8, chụp đêm, bokeh)</option>
                                <option value="Medium">Trung bình (f/2.8-f/4, đa dụng)</option>
                                <option value="Narrow">Hẹp (&gt;f/4, phong cảnh)</option>
                            </select>
                        </div>
                        <div>
                            <label>Chống rung quang học (OIS):</label><br />
                            <select name="OIS" onChange={handleChange} value={criteria['OIS']}>
                                <option value="">Chọn</option>
                                <option value="Yes">Có</option>
                                <option value="No">Không</option>
                            </select>
                        </div>
                        <div>
                            <label>Mục đích sử dụng:</label><br />
                            {['Landscape','Travel', 'Portrait', 'Sports', 'Macro', 'Street', 'Video'].map((purpose) => (
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
                    </>
                );
            case 'drones':
                return (
                    <>
                        <div>
                            <label>Trọng lượng:</label><br />
                            <select name="Weight" onChange={handleChange} value={criteria['Weight']}>
                                <option value="">Chọn</option>
                                <option value="Light">Nhẹ (&lt;250g)</option>
                                <option value="Medium">Trung bình (250-900g)</option>
                                <option value="Heavy">Nặng (&gt;900g)</option>
                            </select>
                        </div>
                        <div>
                            <label>Thời gian bay tối đa (phút):</label><br />
                            <select name="Max Flight Time" onChange={handleChange} value={criteria['Max Flight Time']}>
                                <option value="">Chọn</option>
                                <option value="Below 20 minutes">Dưới 20 phút</option>
                                <option value="20-30 minutes">20-30 phút</option>
                                <option value="Above 30 minutes">Trên 30 phút</option>
                            </select>
                        </div>
                        <div>
                            <label>Độ phân giải camera:</label><br />
                            <select name="Camera Resolution" onChange={handleChange} value={criteria["Camera Resolution"]}>
                                <option value="">Chọn</option>
                                <option value="4K">4K</option>
                                <option value="5.1K">5.1K</option>
                                <option value="5.4K">5.4K</option>
                            </select>
                        </div>
                        <div>
                            <label>Khung hình mỗi giây:</label><br />
                            <select name="Frames Per Sec" onChange={handleChange} value={criteria['Frames Per Sec']}>
                                <option value="">Chọn</option>
                                <option value="30fps">30fps</option>
                                <option value="50fps">50fps</option>
                                <option value="60fps">60fps</option>
                                <option value="120fps">120fps</option>
                            </select>
                        </div>
                        <div>
                            <label>Cảm biến tránh vật cản:</label><br />
                            <select name="Obstacle Avoidance Sensor" onChange={handleChange} value={criteria['Obstacle Avoidance Sensor']}>
                                <option value="">Chọn</option>
                                <option value="Yes">Có</option>
                                <option value="No">Không</option>
                            </select>
                        </div>
                        <div>
                            <label>Tốc độ bay tối đa:</label><br />
                            <select name="Maximum Flight Speed (km/h)" onChange={handleChange} value={criteria['Maximum Flight Speed (km/h)}']}>
                                <option value="">Chọn</option>
                                <option value="Low">Thấp (&lt;60 km/h, quay chậm)</option>
                                <option value="Medium">Trung bình (60-70 km/h, đa dụng)</option>
                                <option value="High">Cao (&gt;70 km/h, thể thao)</option>
                            </select>
                        </div>
                        <div>
                            <label>Khoảng cách điều khiển:</label><br />
                            <select name="Control Range (km)" onChange={handleChange} value={criteria['Control Range (km)']}>
                                <option value="">Chọn</option>
                                <option value="Short">Ngắn (&lt;6 km, quay gần)</option>
                                <option value="Medium">Trung bình (6-10 km, du lịch)</option>
                                <option value="Long">Xa (&gt;10 km, chuyên nghiệp)</option>
                            </select>
                        </div>
                        <div>
                            <label>Tính năng đặc biệt:</label><br />
                            {['Tracking', 'Orbit Mode', 'Vertical Video Recording'].map((feature) => (
                                <label key={feature} style={{ marginRight: '10px' }}>
                                    <input
                                        type="checkbox"
                                        name="specialFeatures"
                                        value={feature}
                                        onChange={handleChange}
                                        checked={criteria.specialFeatures.includes(feature)}
                                    />
                                    {feature}
                                </label>
                            ))}
                        </div>
                        <div>
                            <label>Mục đích sử dụng:</label><br />
                            {['Sports', 'Travel', 'Vlogging', 'Professional', 'Easy of use'].map((purpose) => (
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
                    </>
                );
            case 'gimbals':
                return (
                    <>
                        <div>
                            <label>Khả năng tải tối đa (kg):</label><br />
                            <select name="Maximum Payload (kg)" onChange={handleChange} value={criteria['Maximum Payload (kg)']}>
                                <option value="">Chọn</option>
                                <option value="<= 0.3kg">&lt;= 0.3kg (Smartphone)</option>
                                <option value="0.3-2kg">0.3-2kg (Small camera)</option>
                                <option value="Above 2kg">&gt;2kg (Full-frame camera)</option>
                            </select>
                        </div>
                        <div>
                            <label>Thời lượng pin (giờ):</label><br />
                            <select name="Battery Life (hours)" onChange={handleChange} value={criteria['Battery Life (hours)']}>
                                <option value="">Chọn</option>
                                <option value="Below 10h">Dưới 10h</option>
                                <option value="10-15h">10-15h</option>
                                <option value="Above 15h">Trên 15h</option>
                            </select>
                        </div>
                        <div>
                            <label>Tương thích thiết bị:</label><br />
                            <select name="Device Compatibility" onChange={handleChange} value={criteria['Device Compatibility']}>
                                <option value="">Chọn</option>
                                <option value="Phone">Phone</option>
                                <option value="Small camera">Small camera</option>
                                <option value="Full-frame camera">Full-frame camera</option>
                            </select>
                        </div>
                        <div>
                            <label>Tính năng đặc biệt:</label><br />
                            {['Time-lapse', 'Follow Mode', 'App Connectivity'].map((feature) => (
                                <label key={feature} style={{ marginRight: '10px' }}>
                                    <input
                                        type="checkbox"
                                        name="specialFeatures"
                                        value={feature}
                                        onChange={handleChange}
                                        checked={criteria.specialFeatures.includes(feature)}
                                    />
                                    {feature}
                                </label>
                            ))}
                        </div>
                        <div>
                            <label>Mục đích sử dụng:</label><br />
                            {['Travel', 'Vlogging', 'Professional', 'Easy of use'].map((purpose) => (
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
                    </>
                );
            case 'action_cameras':
                return (
                    <>
                        <div>
                            <label>Trọng lượng:</label><br />
                            <select name="Weight" onChange={handleChange} value={criteria['Weight']}>
                                <option value="">Chọn</option>
                                <option value="Light">Nhẹ (&lt;150g)</option>
                                <option value="Medium">Trung bình (150-200g)</option>
                                <option value="Heavy">Nặng (&gt;200g)</option>
                            </select>
                        </div>
                        <div>
                            <label>Khả năng quay video:</label><br />
                            <select name="Video Recording Capabilities" onChange={handleChange} value={criteria['Video Recording Capabilities']}>
                                <option value="">Chọn</option>
                                <option value="4K/60fps">4K/60fps</option>
                                <option value="4K/120fps">4K/120fps</option>
                                <option value="5.3K/60fps">5.3K/60fps</option>
                            </select>
                        </div>
                        <div>
                            <label>Thời lượng pin (phút):</label><br />
                            <select name="Battery Life (minutes)" onChange={handleChange} value={criteria['Battery Life (minutes)']}>
                                <option value="">Chọn</option>
                                <option value="Below 100 minutes">Dưới 100 phút</option>
                                <option value="100-150 minutes">100-150 phút</option>
                                <option value="Above 150 minutes">Trên 150 phút</option>
                            </select>
                        </div>
                        <div>
                            <label>Tính năng đặc biệt:</label><br />
                            {['Time-lapse', 'Slow Motion', 'Water Resistance', 'Shock Resistance'].map((feature) => (
                                <label key={feature} style={{ marginRight: '10px' }}>
                                    <input
                                        type="checkbox"
                                        name="specialFeatures"
                                        value={feature}
                                        onChange={handleChange}
                                        checked={criteria.specialFeatures.includes(feature)}
                                    />
                                    {feature}
                                </label>
                            ))}
                        </div>
                        <div>
                            <label>Mục đích sử dụng:</label><br />
                            {['Travel', 'Sports', 'Vlogging','Durability','Easy of use', 'Low-light Performance'].map((purpose) => (
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
                    </>
                );
            default:
                return <p>Category không hợp lệ</p>;
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
            <h1>Chọn Tiêu Chí cho {category}</h1>
            <form onSubmit={handleSubmit}>
                {renderCriteria()}
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