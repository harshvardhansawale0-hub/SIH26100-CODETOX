import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import oxygenImg from '../assets/gem_cat_oxygen.jpg';
import medicalImg from '../assets/gem_cat_medical.jpg';
import sarasImg from '../assets/gem_cat_saras.jpg';
import furnitureImg from '../assets/gem_cat_furniture.jpg';
import fireImg from '../assets/gem_cat_fire.jpg';
import computersImg from '../assets/gem_cat_computers.jpg';

export default function PopularProductCategories({ onCategoryClick, onOpenGemmy }) {
  const { t } = useLanguage();

  const categories = [
    {
      id: 'oxygen',
      title: t('catOxygenTitle'),
      titleColor: '#0284c7',
      isHighlight: true,
      items: [
        t('catOxygenItem1'),
        t('catOxygenItem2'),
        t('catOxygenItem3'),
        t('catOxygenItem4'),
        t('catOxygenItem5')
      ],
      image: oxygenImg,
      alt: 'Oxygen Gas & Accessories'
    },
    {
      id: 'medical',
      title: t('catMedicalTitle'),
      titleColor: '#0f3d64',
      isHighlight: false,
      items: [
        t('catMedicalItem1'),
        t('catMedicalItem2'),
        t('catMedicalItem3'),
        t('catMedicalItem4')
      ],
      image: medicalImg,
      alt: 'Medical Equipment'
    },
    {
      id: 'saras',
      title: t('catSarasTitle'),
      titleColor: '#0f3d64',
      isHighlight: false,
      items: [
        t('catSarasItem1'),
        t('catSarasItem2'),
        t('catSarasItem3'),
        t('catSarasItem4')
      ],
      image: sarasImg,
      alt: 'Saras Artisan Collection'
    },
    {
      id: 'furniture',
      title: t('catFurnitureTitle'),
      titleColor: '#0f3d64',
      isHighlight: false,
      items: [
        t('catFurnitureItem1'),
        t('catFurnitureItem2'),
        t('catFurnitureItem3'),
        t('catFurnitureItem4')
      ],
      image: furnitureImg,
      alt: 'Office Furniture'
    },
    {
      id: 'fire',
      title: t('catFireTitle'),
      titleColor: '#0f3d64',
      isHighlight: false,
      items: [
        t('catFireItem1'),
        t('catFireItem2'),
        t('catFireItem3'),
        t('catFireItem4')
      ],
      image: fireImg,
      alt: 'Fire Safety Equipment'
    },
    {
      id: 'computers',
      title: t('catComputersTitle'),
      titleColor: '#0f3d64',
      isHighlight: false,
      items: [
        t('catComputersItem1'),
        t('catComputersItem2'),
        t('catComputersItem3'),
        t('catComputersItem4')
      ],
      image: computersImg,
      alt: 'Computers & IT'
    }
  ];

  return (
    <section className="popular-categories-section">
      <div className="categories-container">
        {/* Section Heading matching GeM portal */}
        <h2 className="categories-main-title">
          {t('popularProductCategoriesTitle')}
        </h2>

        {/* 3x2 Grid Cards */}
        <div className="categories-grid">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className={`category-card ${cat.isHighlight ? 'category-card-highlight' : ''}`}
              onClick={() => onCategoryClick && onCategoryClick(cat.id)}
            >
              <div className="category-card-content">
                {/* Left: Title, Items list, View All */}
                <div className="category-info-col">
                  <h3
                    className="category-card-title"
                    style={{ color: cat.titleColor }}
                  >
                    {cat.title}
                  </h3>

                  <ul className="category-items-list">
                    {cat.items.map((item, idx) => (
                      <li key={idx} className="category-item-link">
                        {item}
                      </li>
                    ))}
                  </ul>

                  <button
                    type="button"
                    className="category-view-all-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onCategoryClick) onCategoryClick(cat.id);
                    }}
                  >
                    {t('viewAll')}
                  </button>
                </div>

                {/* Right: Studio Product Image */}
                <div className="category-img-col">
                  <img
                    src={cat.image}
                    alt={cat.alt}
                    className="category-product-img"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Bottom-Left "Ask GeMMy (Powered by AI)" Widget */}
      <div
        className="ask-gemmy-floating-widget"
        onClick={onOpenGemmy}
        title="Chat with GeMMy AI Assistant"
      >
        <div className="gemmy-avatar-circle">
          <span className="gemmy-emoji">🤖</span>
        </div>
        <div className="gemmy-text-group">
          <span className="gemmy-primary-text">{t('askGemmy')}</span>
          <span className="gemmy-sub-text">({t('poweredByAi')})</span>
        </div>
      </div>

      {/* Right-Side Quick Social Floating Dock */}
      <aside className="gem-social-dock" aria-label="GeM Social Media and Navigation">
        <a
          href="https://instagram.com"
          target="_blank"
          rel="noopener noreferrer"
          className="social-dock-icon social-ig"
          title="Instagram"
        >
          📷
        </a>
        <a
          href="https://facebook.com"
          target="_blank"
          rel="noopener noreferrer"
          className="social-dock-icon social-fb"
          title="Facebook"
        >
          f
        </a>
        <a
          href="https://twitter.com"
          target="_blank"
          rel="noopener noreferrer"
          className="social-dock-icon social-tw"
          title="X (Twitter)"
        >
          𝕏
        </a>
        <a
          href="https://youtube.com"
          target="_blank"
          rel="noopener noreferrer"
          className="social-dock-icon social-yt"
          title="YouTube"
        >
          ▶
        </a>
        <a
          href="https://linkedin.com"
          target="_blank"
          rel="noopener noreferrer"
          className="social-dock-icon social-li"
          title="LinkedIn"
        >
          in
        </a>
        <button
          type="button"
          className="social-dock-icon social-top"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          title="Back to Top"
        >
          ︽
        </button>
      </aside>
    </section>
  );
}
