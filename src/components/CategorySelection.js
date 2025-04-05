import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CategorySelection = () => {
    const navigate = useNavigate();
    const [currentSlide, setCurrentSlide] = useState(0);

    const handleCategorySelect = (category) => {
        navigate(`/criteria/${category}`);
    };

    const sliderImages = [
        "https://c0.wallpaperflare.com/preview/926/166/381/selective-focus-photo-of-black-canon-dslr-camera.jpg",
        "https://img.freepik.com/premium-photo/collection-camera-lenses-arranged-circular-patterns_984027-207982.jpg",
        "https://www.drone-actu.fr/wp-content/uploads/2024/08/Drone-4K-en-survol-de-paysages-montagneux.jpg",
        "https://c0.wallpaperflare.com/path/283/947/646/drone-camera-lens-equipment-db153420ef980683ddf6029a5127e50a.jpg",
        "https://c1.wallpaperflare.com/path/501/818/436/photography-gear-equipment-camera-9e57552d139f7a04a4af788022d73c4c.jpg"
    ];

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev === sliderImages.length - 1 ? 0 : prev + 1));
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev === 0 ? sliderImages.length - 1 : prev - 1));
    };

    useEffect(() => {
        const interval = setInterval(() => {
            nextSlide();
        }, 3000); 

        return () => clearInterval(interval); 
    }, [currentSlide]);

    const categories = [
        {
            name: "Cameras",
            description: "Pro cameras",
            color: "bg-blue-600",
            hoverColor: "hover:bg-blue-700",
            textColor: "text-blue-600",
            icon: (
                <svg className="size-6" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M40 20h-5.5l-2.2-2.6c-0.5-0.6-1.2-0.9-2-0.9h-4.6c-0.8 0-1.5 0.3-2 0.9L21.5 20H16c-2.8 0-5 2.2-5 5v15c0 2.8 2.2 5 5 5h24c2.8 0 5-2.2 5-5V25c0-2.8-2.2-5-5-5zm-12 20c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8z" fill="currentColor"/>
                    <circle cx="28" cy="32" r="5" fill="white"/>
                </svg>
            )
        },
        {
            name: "Lenses",
            description: "Quality lenses",
            color: "bg-rose-500",
            hoverColor: "hover:bg-rose-600",
            textColor: "text-rose-500",
            icon: (
                <svg className="size-6" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M28 18c-7.7 0-14 6.3-14 14s6.3 14 14 14 14-6.3 14-14-6.3-14-14-14zm0 25c-6.1 0-11-4.9-11-11s4.9-11 11-11 11 4.9 11 11-4.9 11-11 11z" fill="currentColor"/>
                    <path d="M28 23c-5 0-9 4-9 9s4 9 9 9 9-4 9-9-4-9-9-9zm0 15c-3.3 0-6-2.7-6-6s2.7-6 6-6 6 2.7 6 6-2.7 6-6 6z" fill="currentColor"/>
                </svg>
            )
        },
        {
            name: "Drones",
            description: "Aerial photography",
            color: "bg-amber-500",
            hoverColor: "hover:bg-amber-600",
            textColor: "text-amber-500",
            icon: (
                <svg className="size-6" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M44 28H36.5L32.5 21H23.5L19.5 28H12M16 34L21 32M28 36V42M35 32L40 34" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                    <circle cx="28" cy="28" r="6" fill="currentColor"/>
                    <path d="M18 28a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" fill="currentColor"/>
                    <path d="M38 28a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" fill="currentColor"/>
                    <path d="M28 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" fill="currentColor"/>
                </svg>
            )
        },
        {
            name: "Gimbals",
            description: "Stabilization",
            color: "bg-green-600",
            hoverColor: "hover:bg-green-700",
            textColor: "text-green-600",
            icon: (
                <svg className="size-6" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M28 18v20M28 38v0c-2.2 0-4 1.8-4 4v0M28 38v0c2.2 0 4 1.8 4 4v0" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                    <path d="M28 18L28 18c-1.1 0-2-.9-2-2v-2c0-1.1.9-2 2-2h0c1.1 0 2 .9 2 2v2c0 1.1-.9 2-2 2z" fill="currentColor"/>
                    <path d="M34 24h-12c-1.1 0-2-.9-2-2v0c0-1.1.9-2 2-2h12c1.1 0 2 .9 2 2v0c0 1.1-.9 2-2 2z" fill="currentColor"/>
                    <circle cx="28" cy="30" r="6" fill="currentColor"/>
                </svg>
            )
        },
        {
            name: "Action Cameras",
            description: "Compact & durable",
            color: "bg-purple-600",
            hoverColor: "hover:bg-purple-700",
            textColor: "text-purple-600",
            icon: (
                <svg className="size-6" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="16" y="18" width="24" height="20" rx="3" fill="currentColor"/>
                    <circle cx="28" cy="28" r="5" fill="white"/>
                    <circle cx="28" cy="28" r="2" fill="currentColor"/>
                    <path d="M16 36h24v2a2 2 0 01-2 2H18a2 2 0 01-2-2v-2z" fill="currentColor"/>
                </svg>
            )
        }
    ];

    return (
        <div className="max-w-7xl px-4 py-6 mx-auto">
          
          <div className="relative overflow-hidden mb-8 rounded-xl shadow-lg">
                <div className="relative max-w-full h-96">
                    {sliderImages.map((img, index) => (
                        <div
                            key={index}
                            className={`absolute w-full h-full transition-opacity duration-500 ease-in-out ${
                                index === currentSlide ? 'opacity-100' : 'opacity-0'
                            }`}
                        >
                            <img 
                                src={img} 
                                alt={`Camera product ${index + 1}`} 
                                className="object-cover w-full h-full"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                                <div className="text-center text-white p-4">
                                <h3 className="text-2xl font-bold mb-2">Thiết Bị Quay Chụp Chuyên Nghiệp</h3>
                                <p className="text-lg">Nền tảng tư vấn & đánh giá camera, ống kính, gimbal và phụ kiện quay chụp uy tín</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <button
                    onClick={prevSlide}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
                    aria-label="Previous slide"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                    </svg>
                </button>
                <button
                    onClick={nextSlide}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
                    aria-label="Next slide"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                </button>
                <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
                    {sliderImages.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentSlide(index)}
                            className={`h-2 w-2 rounded-full ${
                                index === currentSlide ? 'bg-white' : 'bg-white bg-opacity-50'
                            }`}
                            aria-label={`Go to slide ${index + 1}`}
                        ></button>
                    ))}
                </div>
            </div>

            {/* Category Selection */}
            <h2 className="text-2xl font-bold text-center mb-6">Lựa chọn danh mục</h2>
            <div className="flex flex-wrap justify-center gap-3">
                {categories.map((category) => (
                    <div
                        key={category.name}
                        onClick={() => handleCategorySelect(category.name == "Action Cameras" ? "action_cameras" : category.name)}
                        className={`flex flex-col items-center w-40 p-3 ${category.color} text-white rounded-lg shadow-md cursor-pointer transition-transform duration-300 transform hover:scale-105 ${category.hoverColor}`}
                    >
                        <div className="mb-2">
                            {category.icon}
                        </div>
                        <h3 className="text-sm font-bold">{category.name}</h3>
                        <p className="text-xs text-center mt-1">{category.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CategorySelection;