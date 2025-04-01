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
            navigate('/results', { state: { recommendations: response.data.recommendations } });
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
                            <select name="weight" onChange={handleChange} value={criteria.weight}>
                                <option value="">Chọn</option>
                                <option value="Light">Nhẹ (&lt;400g)</option>
                                <option value="Medium">Trung bình (400-600g)</option>
                                <option value="Heavy">Nặng (&gt;600g)</option>
                            </select>
                        </div>
                        <div>
                            <label>Kiểu dáng:</label><br />
                            <select name="designStyle" onChange={handleChange} value={criteria.designStyle}>
                                <option value="">Chọn</option>
                                <option value="Mirrorless">Mirrorless</option>
                                <option value="Compact">Compact</option>
                            </select>
                        </div>
                        <div>
                            <label>Độ phân giải (MP):</label><br />
                            <select name="resolution" onChange={handleChange} value={criteria.resolution}>
                                <option value="">Chọn</option>
                                <option value="Below 20MP">Dưới 20MP (nhu cầu cơ bản)</option>
                                <option value="20-30MP">20-30MP (bán chuyên)</option>
                                <option value="Above 30MP">Trên 30MP (chuyên nghiệp)</option>
                            </select>
                        </div>
                        <div>
                            <label>Quay video 4K:</label><br />
                            <select name="video4K" onChange={handleChange} value={criteria.video4K}>
                                <option value="">Chọn</option>
                                <option value="Yes">Có</option>
                                <option value="No">Không</option>
                            </select>
                        </div>
                        <div>
                            <label>ISO tối đa:</label><br />
                            <select name="isoMax" onChange={handleChange} value={criteria.isoMax}>
                                <option value="">Chọn</option>
                                <option value="Low">Thấp (&lt;6400, sáng tốt)</option>
                                <option value="Medium">Trung bình (6400-12800, linh hoạt)</option>
                                <option value="High">Cao (&gt;12800, chụp đêm)</option>
                            </select>
                        </div>
                        <div>
                            <label>Màn hình lật:</label><br />
                            <select name="flipscreen" onChange={handleChange} value={criteria.flipscreen}>
                                <option value="">Chọn</option>
                                <option value="Yes">Có</option>
                                <option value="No">Không</option>
                            </select>
                            {criteria.flipscreen === 'Yes' && (
                                <div>
                                    <label>Loại màn hình lật:</label><br />
                                    <select name="flipscreenType" onChange={handleChange} value={criteria.flipscreenType}>
                                        <option value="">Chọn</option>
                                        <option value="Tilt">Tilt (góc thấp)</option>
                                        <option value="Full">Full (vlogging, selfie)</option>
                                    </select>
                                </div>
                            )}
                        </div>
                        <div>
                            <label>Kính ngắm quang học:</label><br />
                            <select name="opticalViewfinder" onChange={handleChange} value={criteria.opticalViewfinder}>
                                <option value="">Chọn</option>
                                <option value="Yes">Có</option>
                                <option value="No">Không</option>
                            </select>
                        </div>
                        <div>
                            <label>Kính ngắm điện tử:</label><br />
                            <select name="electronicViewfinder" onChange={handleChange} value={criteria.electronicViewfinder}>
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
                    </>
                );
            case 'lenses':
                return (
                    <>
                        <div>
                            <label>Loại ống kính:</label><br />
                            <select name="lensType" onChange={handleChange} value={criteria.lensType}>
                                <option value="">Chọn</option>
                                <option value="Prime">Prime</option>
                                <option value="Zoom">Zoom</option>
                            </select>
                        </div>
                        <div>
                            <label>Khẩu độ tối đa:</label><br />
                            <select name="maxAperture" onChange={handleChange} value={criteria.maxAperture}>
                                <option value="">Chọn</option>
                                <option value="Wide">Rộng (&lt;f/2.8, chụp đêm, bokeh)</option>
                                <option value="Medium">Trung bình (f/2.8-f/4, đa dụng)</option>
                                <option value="Narrow">Hẹp (&gt;f/4, phong cảnh)</option>
                            </select>
                        </div>
                        <div>
                            <label>Chống rung quang học (OIS):</label><br />
                            <select name="ois" onChange={handleChange} value={criteria.ois}>
                                <option value="">Chọn</option>
                                <option value="Yes">Có</option>
                                <option value="No">Không</option>
                            </select>
                        </div>
                        <div>
                            <label>Mục đích sử dụng:</label><br />
                            {['Landscape', 'Portrait', 'Sports', 'Macro', 'Street'].map((purpose) => (
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
                            <select name="weight" onChange={handleChange} value={criteria.weight}>
                                <option value="">Chọn</option>
                                <option value="Light">Nhẹ (&lt;250g)</option>
                                <option value="Medium">Trung bình (250-900g)</option>
                                <option value="Heavy">Nặng (&gt;900g)</option>
                            </select>
                        </div>
                        <div>
                            <label>Thời gian bay tối đa (phút):</label><br />
                            <select name="maxFlightTime" onChange={handleChange} value={criteria.maxFlightTime}>
                                <option value="">Chọn</option>
                                <option value="Below 20 minutes">Dưới 20 phút</option>
                                <option value="20-30 minutes">20-30 phút</option>
                                <option value="Above 30 minutes">Trên 30 phút</option>
                            </select>
                        </div>
                        <div>
                            <label>Độ phân giải camera:</label><br />
                            <select name="cameraResolution" onChange={handleChange} value={criteria.cameraResolution}>
                                <option value="">Chọn</option>
                                <option value="4K">4K</option>
                                <option value="5.1K">5.1K</option>
                                <option value="5.4K">5.4K</option>
                            </select>
                        </div>
                        <div>
                            <label>Cảm biến tránh vật cản:</label><br />
                            <select name="obstacleAvoidance" onChange={handleChange} value={criteria.obstacleAvoidance}>
                                <option value="">Chọn</option>
                                <option value="Yes">Có</option>
                                <option value="No">Không</option>
                            </select>
                        </div>
                        <div>
                            <label>Tốc độ bay tối đa:</label><br />
                            <select name="maxFlightSpeed" onChange={handleChange} value={criteria.maxFlightSpeed}>
                                <option value="">Chọn</option>
                                <option value="Low">Thấp (&lt;60 km/h, quay chậm)</option>
                                <option value="Medium">Trung bình (60-70 km/h, đa dụng)</option>
                                <option value="High">Cao (&gt;70 km/h, thể thao)</option>
                            </select>
                        </div>
                        <div>
                            <label>Khoảng cách điều khiển:</label><br />
                            <select name="controlRange" onChange={handleChange} value={criteria.controlRange}>
                                <option value="">Chọn</option>
                                <option value="Short">Ngắn (&lt;6 km, quay gần)</option>
                                <option value="Medium">Trung bình (6-10 km, du lịch)</option>
                                <option value="Long">Xa (&gt;10 km, chuyên nghiệp)</option>
                            </select>
                        </div>
                        <div>
                            <label>Tính năng đặc biệt:</label><br />
                            {['Tracking', 'Orbit mode', 'Vertical Video Recording'].map((feature) => (
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
                            {['Stability', 'Sports', 'Travel', 'Vlogging', 'Professional'].map((purpose) => (
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
                            <select name="maximumPayload" onChange={handleChange} value={criteria.maximumPayload}>
                                <option value="">Chọn</option>
                                <option value="<= 0.3kg">&lt;= 0.3kg (Smartphone)</option>
                                <option value="0.3-2kg">0.3-2kg (Small camera)</option>
                                <option value="Above 2kg">&gt;2kg (Full-frame camera)</option>
                            </select>
                        </div>
                        <div>
                            <label>Thời lượng pin (giờ):</label><br />
                            <select name="batteryLife" onChange={handleChange} value={criteria.batteryLife}>
                                <option value="">Chọn</option>
                                <option value="Below 10h">Dưới 10h</option>
                                <option value="10-15h">10-15h</option>
                                <option value="Above 15h">Trên 15h</option>
                            </select>
                        </div>
                        <div>
                            <label>Tương thích thiết bị:</label><br />
                            <select name="deviceCompatibility" onChange={handleChange} value={criteria.deviceCompatibility}>
                                <option value="">Chọn</option>
                                <option value="Phone">Phone</option>
                                <option value="Small camera">Small camera</option>
                                <option value="Full-frame camera">Full-frame camera</option>
                            </select>
                        </div>
                        <div>
                            <label>Tính năng đặc biệt:</label><br />
                            {['Time-lapse', 'Follow mode', 'App Connectivity'].map((feature) => (
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
                            {['Stability', 'Travel', 'Vlogging', 'Professional'].map((purpose) => (
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
                            <select name="weight" onChange={handleChange} value={criteria.weight}>
                                <option value="">Chọn</option>
                                <option value="Light">Nhẹ (&lt;150g)</option>
                                <option value="Medium">Trung bình (150-200g)</option>
                                <option value="Heavy">Nặng (&gt;200g)</option>
                            </select>
                        </div>
                        <div>
                            <label>Khả năng quay video:</label><br />
                            <select name="videoRecordingCapabilities" onChange={handleChange} value={criteria.videoRecordingCapabilities}>
                                <option value="">Chọn</option>
                                <option value="4K/60fps">4K/60fps</option>
                                <option value="4K/120fps">4K/120fps</option>
                                <option value="5.3K/60fps">5.3K/60fps</option>
                            </select>
                        </div>
                        <div>
                            <label>Thời lượng pin (phút):</label><br />
                            <select name="batteryLife" onChange={handleChange} value={criteria.batteryLife}>
                                <option value="">Chọn</option>
                                <option value="Below 100 minutes">Dưới 100 phút</option>
                                <option value="100-150 minutes">100-150 phút</option>
                                <option value="Above 150 minutes">Trên 150 phút</option>
                            </select>
                        </div>
                        <div>
                            <label>Tính năng đặc biệt:</label><br />
                            {['Time-lapse', 'Slow motion', 'Water resistance', 'Shock resistance'].map((feature) => (
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
                            {['Stability', 'Travel', 'Sports', 'Vlogging'].map((purpose) => (
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