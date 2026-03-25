import React, { useState, useEffect } from 'react';

const slides = [
  {
    id: 1,
    title: '❄️ WINTER OFFER',
    subtitle: 'Up to 50% OFF',
    description: 'Get amazing discounts on all electronics',
    // To use an image: bgImage: '/images/carousel/img1.jpg'
    bgImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    offer: 'Limited Time Only'
  },
  {
    id: 2,
    title: '🎉 NEW YEAR SALE',
    subtitle: 'Up to 60% OFF',
    description: 'Exclusive deals on latest gadgets and electronics',
    bgImage: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    offer: 'Grab Now!'
  },
  {
    id: 3,
    title: '⚡ FLASH DEAL',
    subtitle: 'Up to 40% OFF',
    description: 'Today only - Incredible savings on premium electronics',
    bgImage: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    offer: 'Hurry Up!'
  }
];

const Carousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="carousel-container">
      <div className="carousel-slides">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`carousel-slide ${index === currentSlide ? 'active' : ''}`}
            style={{ 
              backgroundImage: slide.bgImage.startsWith('linear-gradient') 
                ? slide.bgImage 
                : `url(${slide.bgImage})` 
            }}
          >
            <div className="slide-content">
              <h1 className="slide-title">{slide.title}</h1>
              <h2 className="slide-subtitle">{slide.subtitle}</h2>
              <p className="slide-description">{slide.description}</p>
              <button className="slide-btn">Shop Now</button>
              <p className="slide-offer">{slide.offer}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button className="carousel-arrow carousel-arrow-left" onClick={prevSlide}>
        ❮
      </button>
      <button className="carousel-arrow carousel-arrow-right" onClick={nextSlide}>
        ❯
      </button>

      {/* Dots */}
      <div className="carousel-dots">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`carousel-dot ${index === currentSlide ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default Carousel;
