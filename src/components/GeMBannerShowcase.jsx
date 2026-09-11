import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight, ShieldCheck, Award, HeartHandshake, Rocket, ShoppingBag, Cpu } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

// Import the generated high-definition GeM banners
import makeInIndiaImg from '../assets/gem_make_in_india.webp';
import womaniyaImg from '../assets/gem_womaniya_msme.webp';
import startupRunwayImg from '../assets/gem_startup_runway.webp';

export default function GeMBannerShowcase({ 
  onExploreTenders, 
  onOpenVerifier,
  onNavigateInitiative,
  onOpenInitiativeModal
}) {
  const { t, lang } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const handleSlideAction = (slideId) => {
    if (slideId === 'make-in-india') {
      if (onNavigateInitiative) onNavigateInitiative('mii');
      else if (onExploreTenders) onExploreTenders('mii');
    } else if (slideId === 'womaniya') {
      if (onNavigateInitiative) onNavigateInitiative('womaniya');
      else if (onOpenVerifier) onOpenVerifier();
    } else if (slideId === 'startup-runway') {
      if (onNavigateInitiative) onNavigateInitiative('startup');
      else if (onOpenVerifier) onOpenVerifier();
    }
  };

  const slides = [
    {
      id: "make-in-india",
      image: makeInIndiaImg,
      badge: lang === 'hi' ? "मेक इन इंडिया" : lang === 'mr' ? "मेक इन इंडिया" : "MAKE IN INDIA",
      title: lang === 'hi' ? "भारतीय विनिर्माण को सशक्त बनाना" : lang === 'mr' ? "भारतीय उत्पादकांना सक्षम करणे" : "Empowering Indian Manufacturing",
      desc: lang === 'hi' 
        ? "क्लास-I स्थानीय आपूर्तिकर्ताओं के लिए GeM पर प्राथमिकता — स्थानीय उत्पादों और 'आत्मनिर्भर भारत' को बढ़ावा देना।"
        : lang === 'mr' 
        ? "क्लास-I स्थानिक पुरवठादारांसाठी GeM वर प्राधान्य — स्थानिक उत्पादने आणि 'आत्मनिर्भर भारत' ला प्रोत्साहन."
        : "Class-I Local Supplier preference on GeM — driving public procurement toward verified domestic manufacturers.",
      cta: lang === 'hi' ? "योजना और पंजीकरण देखें" : lang === 'mr' ? "योजना आणि नोंदणी पहा" : "Explore Scheme & Register",
      action: () => handleSlideAction("make-in-india")
    },
    {
      id: "womaniya",
      image: womaniyaImg,
      badge: lang === 'hi' ? "वोमानिया ऑन GeM" : lang === 'mr' ? "वोमानिया ऑन GeM" : "WOMANIYA ON GeM",
      title: lang === 'hi' ? "महिला उद्यमिता और कारीगरों का सशक्तिकरण" : lang === 'mr' ? "महिला उद्योजकता आणि कारागिरांचे सक्षमीकरण" : "Empowering Women Entrepreneurs & Artisans",
      desc: lang === 'hi'
        ? "स्वयं सहायता समूहों (SHG), महिला सूक्ष्म-उद्यमियों और शिल्पकारों को सीधे सरकारी खरीदारों से जोड़ना।"
        : lang === 'mr'
        ? "बचत गट (SHG), महिला सूक्ष्म-उद्योजक आणि कारागिरांना थेट सरकारी खरेदीदारांशी जोडणे."
        : "Direct national marketplace for Self-Help Groups (SHGs), female micro-entrepreneurs, and master craftswomen.",
      cta: lang === 'hi' ? "वोमानिया योजना और पंजीकरण देखें" : lang === 'mr' ? "नोंदणी व योजना पहा" : "Explore Womaniya & Register",
      action: () => handleSlideAction("womaniya")
    },
    {
      id: "startup-runway",
      image: startupRunwayImg,
      badge: lang === 'hi' ? "स्टार्टअप रनवे" : lang === 'mr' ? "स्टार्टअप रनवे" : "STARTUP RUNWAY",
      title: lang === 'hi' ? "सार्वजनिक खरीद में नवाचार" : lang === 'mr' ? "सार्वजनिक खरेदीत नावीन्य" : "Innovation in Public Procurement",
      desc: lang === 'hi'
        ? "DPIIT मान्यता प्राप्त स्टार्टअप्स के लिए सरकारी विभागों में अत्याधुनिक तकनीकों और AI समाधानों की सीधी खरीद।"
        : lang === 'mr'
        ? "DPIIT मान्यताप्राप्त स्टार्टअप्ससाठी सरकारी विभागांमध्ये अत्याधुनिक तंत्रज्ञान आणि AI समाधानांची थेट खरेदी."
        : "Fast-track onboarding for DPIIT-recognized startups to supply breakthrough technologies directly to Government bodies.",
      cta: lang === 'hi' ? "स्टार्टअप योजना और पंजीकरण देखें" : lang === 'mr' ? "स्टार्टअप योजना व नोंदणी पहा" : "Explore Startup Runway & Register",
      action: () => handleSlideAction("startup-runway")
    }
  ];

  // Auto-advance carousel every 5.5 seconds unless hovered
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [isPaused, slides.length]);

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  // Special initiatives items matching GeM portal with click handlers
  const specialInitiatives = [
    {
      key: "mii",
      icon: <Award size={24} color="#f59e0b" />,
      title: "Make in India (MII)",
      desc: lang === 'hi' ? "घरेलू विनिर्माण को प्रोत्साहन" : lang === 'mr' ? "स्थानिक उत्पादनांना प्राधान्य" : "Preference to verified domestic manufacturers",
      badgeText: "Class-I & II"
    },
    {
      key: "womaniya",
      icon: <HeartHandshake size={24} color="#ec4899" />,
      title: "Womaniya on GeM",
      desc: lang === 'hi' ? "महिला व SHG सशक्तिकरण" : lang === 'mr' ? "महिला व बचत गट सक्षमीकरण" : "Dedicated market for women entrepreneurs",
      badgeText: "3% Quota"
    },
    {
      key: "startup",
      icon: <Rocket size={24} color="#3b82f6" />,
      title: "Startup Runway",
      desc: lang === 'hi' ? "नवाचार व AI समाधान" : lang === 'mr' ? "नावीन्यपूर्ण AI सोल्यूशन्स" : "Direct access for innovative tech startups",
      badgeText: "DPIIT Fast-Track"
    },
    {
      key: "mse",
      icon: <ShieldCheck size={24} color="#10b981" />,
      title: "MSE Sambandh",
      desc: lang === 'hi' ? "25% अनिवार्य कोटा" : lang === 'mr' ? "25% अनिवार्य कोटा" : "25% mandatory public procurement quota",
      badgeText: "25% Reserved"
    }
  ];

  return (
    <section className="gem-showcase-section">
      <div className="container-custom">
        {/* Main Hero Visual Carousel */}
        <div 
          className="gem-carousel-box"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Slide image wrapper */}
          <div className="carousel-slide-wrapper">
                  <img 
                    src={slides[currentSlide].image} 
                    alt={slides[currentSlide].title} 
                    width="1920"
                    height="1080"
                    fetchpriority="high"
                    className="carousel-main-img"
                  />
            {/* Subtle gradient overlay */}
            <div className="carousel-gradient-overlay"></div>
          </div>

          {/* Slide floating content overlay */}
          <div className="carousel-caption-overlay">
            <span className="carousel-badge">{slides[currentSlide].badge}</span>
            <h2 className="carousel-title serif-heading">{slides[currentSlide].title}</h2>
            <p className="carousel-desc">{slides[currentSlide].desc}</p>
            <button 
              className="carousel-action-btn"
              onClick={slides[currentSlide].action}
              style={{ cursor: 'pointer' }}
            >
              <span>{slides[currentSlide].cta}</span>
              <ArrowRight size={16} />
            </button>
          </div>

          {/* Navigation Arrows */}
          <button className="carousel-nav-btn prev" onClick={handlePrev} aria-label="Previous Slide">
            <ChevronLeft size={24} />
          </button>
          <button className="carousel-nav-btn next" onClick={handleNext} aria-label="Next Slide">
            <ChevronRight size={24} />
          </button>

          {/* Indicator dots */}
          <div className="carousel-dots-row">
            {slides.map((_, idx) => (
              <button
                key={idx}
                className={`carousel-dot ${currentSlide === idx ? 'active' : ''}`}
                onClick={() => setCurrentSlide(idx)}
                aria-label={`Go to slide ${idx + 1}`}
              ></button>
            ))}
          </div>
        </div>

        {/* 4 Government Procurement Initiatives Bar (Interactive Buttons) */}
        <div className="gem-initiatives-grid">
          {specialInitiatives.map((item, idx) => (
            <div 
              key={idx} 
              className="initiative-card"
              role="button"
              tabIndex={0}
              onClick={() => {
                if (onNavigateInitiative) onNavigateInitiative(item.key);
                else if (onOpenInitiativeModal) onOpenInitiativeModal(item.key);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  if (onNavigateInitiative) onNavigateInitiative(item.key);
                }
              }}
              style={{ cursor: 'pointer', position: 'relative' }}
              title={`Click to view ${item.title} opportunities`}
            >
              <div className="initiative-icon-box">{item.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                  <h4 className="initiative-title" style={{ margin: 0 }}>{item.title}</h4>
                  <span style={{ 
                    fontSize: '0.65rem', 
                    fontWeight: '800', 
                    backgroundColor: 'rgba(2, 132, 199, 0.1)', 
                    color: '#0284c7', 
                    padding: '2px 6px', 
                    borderRadius: '4px',
                    border: '1px solid rgba(2, 132, 199, 0.2)'
                  }}>
                    {item.badgeText}
                  </span>
                </div>
                <p className="initiative-desc" style={{ margin: 0 }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
