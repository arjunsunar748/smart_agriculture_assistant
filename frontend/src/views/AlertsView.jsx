import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../api/client';

export default function AlertsView() {
  const { setActiveTab, language } = useApp();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAlerts() {
      setLoading(true);
      try {
        const res = await api.getSystemAlerts();
        setAlerts(res.alerts || []);
      } catch (err) {
        console.error('Failed to load alerts:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAlerts();
  }, []);

  const sampleAlerts = alerts.length > 0 ? alerts : [
    {
      id: 'a1',
      title: '🌱 Planting window is opening',
      title_ne: '🌱 रोप्ने विन्डो खुल्दैछ',
      message: 'Optimal sowing period for winter greenhouse tomatoes and slicing cucumbers has begun.',
      severity: 'success',
      action_tab: 'what_to_plant'
    },
    {
      id: 'a2',
      title: '📈 Tomato prices are increasing',
      title_ne: '📈 गोलभेडाको मूल्य बढ्दैछ',
      message: 'Kalimati Mandi auction prices rose by +18% over the past 7 days due to lower open-field supply.',
      severity: 'info',
      action_tab: 'market_prices'
    },
    {
      id: 'a3',
      title: '⚠️ Heavy rainfall / Nocturnal frost advisory',
      title_ne: '⚠️ हिउँदे तुषारो तथा चिसो हावाको सूचना',
      message: 'Night temperatures in mid-hills forecasted below 9°C. Ensure polyhouse side curtains are tightly secured by 4:00 PM.',
      severity: 'warning',
      action_tab: 'dashboard'
    },
    {
      id: 'a4',
      title: '⏰ Harvest approaching',
      title_ne: '⏰ फसल टिप्ने समय नजिकिँदैछ',
      message: 'Tunnel #1 cucumbers will reach commercial fruit length (18-22 cm) in 6 days.',
      severity: 'primary',
      action_tab: 'farm_mgmt'
    }
  ];

  return (
    <div className="container py-4 fade-in" style={{ maxWidth: '850px' }}>
      {/* Title */}
      <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
        <div>
          <h1 className="fs-3 fw-bold text-dark mb-1 d-flex align-items-center gap-2">
            <span className="text-success">🔔</span>
            <span>{language === 'ne' ? 'कृषि अलर्ट तथा सूचनाहरू' : 'Agricultural Alerts & Updates'}</span>
          </h1>
          <p className="text-muted small mb-0">
            {language === 'ne'
              ? 'बजार मूल्य, मौसम र रोप्ने विन्डोबारे महत्वपूर्ण सूचनाहरू।'
              : 'Important notices regarding market price shifts, weather advisories, and crop timing.'}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="p-4 text-center text-muted">
          <div className="spinner-border spinner-border-sm text-success me-2" role="status"></div>
          Loading alerts...
        </div>
      ) : (
        <div className="space-y-3">
          {sampleAlerts.map((item) => {
            const alertClass =
              item.severity === 'critical'
                ? 'alert-danger'
                : item.severity === 'warning'
                ? 'alert-warning'
                : item.severity === 'info'
                ? 'alert-info'
                : item.severity === 'primary'
                ? 'alert-primary'
                : 'alert-success';

            return (
              <div
                key={item.id}
                className={`alert ${alertClass} shadow-sm d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center p-3 mb-3 border-0`}
              >
                <div className="me-3 mb-2 mb-sm-0">
                  <h6 className="alert-heading fw-bold mb-1">
                    {language === 'ne' && item.title_ne ? item.title_ne : item.title}
                  </h6>
                  <p className="mb-0 small opacity-90">
                    {language === 'ne' && item.message_ne ? item.message_ne : item.message}
                  </p>
                </div>

                {item.action_tab && (
                  <button
                    onClick={() => setActiveTab(item.action_tab)}
                    className="btn btn-sm btn-light border fw-semibold text-dark text-nowrap align-self-end align-self-sm-center"
                  >
                    View →
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
