import React from 'react';
import { useApp } from '../context/AppContext';

export default function Footer() {
  const { language, setActiveTab } = useApp();

  return (
    <footer className="agri-footer">
      <div className="container">
        <div className="row gy-4 align-items-center pb-3">
          {/* Brand & Purpose */}
          <div className="col-12 col-md-5">
            <div className="d-flex align-items-center gap-2 mb-1">
              <span className="fs-4">🌱</span>
              <span className="agri-footer-brand">Smart Agriculture Assistant</span>
            </div>
            <p className="text-muted small mb-0">
              {language === 'ne'
                ? 'कालीमाटी बजार भाउ, प्रत्यक्ष मौसम र टनेल कृषि विज्ञानमा आधारित आधुनिक निर्णय प्रणाली।'
                : 'AI-powered decision support for smarter agricultural planning and off-season harvest timing.'}
            </p>
          </div>

          {/* Clean Links */}
          <div className="col-12 col-md-7">
            <div className="d-flex flex-wrap justify-content-md-end gap-3 gap-md-4 small fw-semibold">
              <button
                className="btn btn-link p-0 text-decoration-none text-muted"
                onClick={() => setActiveTab('dashboard')}
              >
                {language === 'ne' ? 'गृहपृष्ठ' : 'Home'}
              </button>
              <button
                className="btn btn-link p-0 text-decoration-none text-muted"
                onClick={() => setActiveTab('what_to_plant')}
              >
                {language === 'ne' ? 'बाली सिफारिस' : 'Plant Recommendation'}
              </button>
              <button
                className="btn btn-link p-0 text-decoration-none text-muted"
                onClick={() => setActiveTab('market_prices')}
              >
                {language === 'ne' ? 'बजार भाउ' : 'Market'}
              </button>
              <button
                className="btn btn-link p-0 text-decoration-none text-muted"
                onClick={() => setActiveTab('crop_details')}
              >
                {language === 'ne' ? 'बाली ज्ञान' : 'Crop Analysis'}
              </button>
              <button
                className="btn btn-link p-0 text-decoration-none text-muted"
                onClick={() => setActiveTab('profit_calculator')}
              >
                {language === 'ne' ? 'नाफा हिसाब' : 'Profit'}
              </button>
              <button
                className="btn btn-link p-0 text-decoration-none text-muted"
                onClick={() => setActiveTab('ai_assistant')}
              >
                {language === 'ne' ? 'एआई सहायक' : 'AI Assistant'}
              </button>
            </div>
          </div>
        </div>

        {/* Disclaimer & Copyright */}
        <div className="border-top pt-3 mt-2 d-flex flex-column flex-md-row justify-content-between align-items-center gap-2 small text-muted">
          <p className="mb-0 text-center text-md-start">
            <i className="bi bi-info-circle me-1"></i>
            {language === 'ne'
              ? 'सिफारिसहरू उपलब्ध तथ्याङ्क र मौसमी अनुमानमा आधारित हुन्, यो ग्यारेन्टी गरिएको नाफा होइन।'
              : 'Recommendations are estimates based on available data and are not guaranteed financial outcomes.'}
          </p>
          <div className="text-center text-md-end">
            © 2026 Smart Agriculture Assistant • Nepal
          </div>
        </div>
      </div>
    </footer>
  );
}
