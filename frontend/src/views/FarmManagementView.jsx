import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../api/client';

export default function FarmManagementView() {
  const { language } = useApp();
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedFarmDetail, setSelectedFarmDetail] = useState(null);

  // New Farm form state
  const [farmName, setFarmName] = useState('');
  const [farmLocation, setFarmLocation] = useState('Kathmandu');
  const [tunnelCount, setTunnelCount] = useState(2);
  const [totalArea, setTotalArea] = useState(500);
  const [currentCrop, setCurrentCrop] = useState('Tomato');

  const loadFarms = async () => {
    setLoading(true);
    try {
      const data = await api.getFarms();
      if (data && data.length > 0) {
        setFarms(data);
      } else {
        // Sample baseline farms if none created
        setFarms([
          {
            id: 'farm-001',
            name: 'Kirtipur Green Farm',
            location: 'Kirtipur-4, Kathmandu',
            tunnel_count: 2,
            total_area_sqm: 500,
            current_crop: 'Tomato',
            planting_date: '2026-09-01',
            expected_harvest: '2026-12-05',
            progress_pct: 78,
            days_remaining: 15
          },
          {
            id: 'farm-002',
            name: 'Panauti Agro Tunnel Unit',
            location: 'Panauti-2, Kavre',
            tunnel_count: 3,
            total_area_sqm: 750,
            current_crop: 'Cucumber',
            planting_date: '2026-09-15',
            expected_harvest: '2026-11-20',
            progress_pct: 54,
            days_remaining: 35
          }
        ]);
      }
    } catch (err) {
      console.error('Failed to load farms:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFarms();
  }, []);

  const handleCreateFarm = (e) => {
    e.preventDefault();
    if (!farmName.trim()) return;

    const newFarm = {
      id: `farm-${Date.now()}`,
      name: farmName,
      location: farmLocation,
      tunnel_count: parseInt(tunnelCount) || 1,
      total_area_sqm: parseFloat(totalArea) || 250,
      current_crop: currentCrop,
      planting_date: '2026-09-20',
      expected_harvest: '2026-12-25',
      progress_pct: 15,
      days_remaining: 85
    };

    setFarms([newFarm, ...farms]);
    setShowAddModal(false);
    setFarmName('');
  };

  return (
    <div className="container py-4 fade-in">
      {/* Top Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2 mb-4 pb-2 border-bottom">
        <div>
          <h1 className="fs-3 fw-bold text-dark mb-1 d-flex align-items-center gap-2">
            <span className="text-success">🏡</span>
            <span>{language === 'ne' ? 'मेरो फार्म व्यवस्थापन' : 'My Farms & Crop Cycles'}</span>
          </h1>
          <p className="text-muted small mb-0">
            {language === 'ne'
              ? 'टनेल फार्महरूको सूची, सक्रिय बाली चक्र र फसल प्रगति ट्र्याक गर्नुहोस्।'
              : 'Manage registered farm units, monitor live tunnel crop cycles, and track harvest progress.'}
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="btn btn-agri d-flex align-items-center gap-1.5"
        >
          <i className="bi bi-plus-circle"></i>
          <span>{language === 'ne' ? 'नयाँ फार्म थप्नुहोस्' : 'Add Farm'}</span>
        </button>
      </div>

      {/* Farms List */}
      <div className="row g-4">
        {farms.map((farm) => (
          <div key={farm.id} className="col-12 col-md-6">
            <div className="card agri-card p-4 shadow-sm h-100 d-flex flex-column justify-content-between">
              <div>
                {/* Header */}
                <div className="d-flex justify-content-between align-items-start mb-3 pb-2 border-bottom">
                  <div>
                    <h3 className="fs-5 fw-bold text-dark mb-0">{farm.name}</h3>
                    <span className="text-muted small d-flex align-items-center gap-1 mt-0.5">
                      <i className="bi bi-geo-alt text-danger"></i>
                      <span>{farm.location}</span>
                    </span>
                  </div>
                  <span className="badge bg-success-subtle text-success border border-success-subtle px-2.5 py-1">
                    {farm.tunnel_count || 1} Tunnels
                  </span>
                </div>

                {/* Farm Meta */}
                <div className="row g-2 mb-3 small">
                  <div className="col-6">
                    <span className="text-muted d-block">Total Land Area:</span>
                    <span className="fw-bold text-dark">{farm.total_area_sqm} m²</span>
                  </div>
                  <div className="col-6">
                    <span className="text-muted d-block">Current Crop:</span>
                    <span className="fw-bold text-success">{farm.current_crop || 'Tomato'}</span>
                  </div>
                </div>

                {/* Crop Cycle Progress */}
                <div className="p-3 bg-light rounded mb-3">
                  <div className="d-flex justify-content-between align-items-center small mb-1">
                    <span className="fw-bold text-dark">
                      Crop Cycle ({farm.current_crop || 'Tomato'})
                    </span>
                    <span className="fw-bold text-success">
                      {farm.progress_pct || 78}%
                    </span>
                  </div>
                  <div className="progress" style={{ height: '8px' }}>
                    <div
                      className="progress-bar bg-success"
                      role="progressbar"
                      style={{ width: `${farm.progress_pct || 78}%` }}
                      aria-valuenow={farm.progress_pct || 78}
                      aria-valuemin="0"
                      aria-valuemax="100"
                    ></div>
                  </div>
                  <div className="d-flex justify-content-between align-items-center text-muted text-xs mt-2">
                    <span>Planted: {farm.planting_date || '2026-09-01'}</span>
                    <span className="fw-bold text-dark">
                      ⏳ {farm.days_remaining || 15} days remaining
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons: View, Edit */}
              <div className="d-flex gap-2 pt-2 border-top">
                <button
                  onClick={() => setSelectedFarmDetail(farm)}
                  className="btn btn-outline-agri w-50 small fw-bold"
                >
                  <i className="bi bi-eye me-1"></i>
                  View Details
                </button>
                <button
                  onClick={() => alert(`Editing settings for ${farm.name}`)}
                  className="btn btn-soft-agri w-50 small fw-bold"
                >
                  <i className="bi bi-pencil me-1"></i>
                  Edit Farm
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Farm Modal */}
      {showAddModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content agri-card border-0">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold text-dark">
                  <i className="bi bi-plus-circle me-1 text-success"></i>
                  Add New Farm Unit
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowAddModal(false)}
                ></button>
              </div>
              <form onSubmit={handleCreateFarm}>
                <div className="modal-body p-4 space-y-3">
                  <div className="mb-2">
                    <label className="form-label">Farm Name</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Kathmandu Agro Tunnel"
                      value={farmName}
                      onChange={(e) => setFarmName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-2">
                    <label className="form-label">Location (District / Ward)</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Kirtipur, Kathmandu"
                      value={farmLocation}
                      onChange={(e) => setFarmLocation(e.target.value)}
                      required
                    />
                  </div>

                  <div className="row g-2 mb-2">
                    <div className="col-6">
                      <label className="form-label">Tunnel Count</label>
                      <input
                        type="number"
                        className="form-control"
                        value={tunnelCount}
                        onChange={(e) => setTunnelCount(e.target.value)}
                        min="1"
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label">Total Area (m²)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={totalArea}
                        onChange={(e) => setTotalArea(e.target.value)}
                        min="50"
                      />
                    </div>
                  </div>

                  <div className="mb-2">
                    <label className="form-label">Current Crop</label>
                    <select
                      className="form-select"
                      value={currentCrop}
                      onChange={(e) => setCurrentCrop(e.target.value)}
                    >
                      <option value="Tomato">Tomato (गोलभेडा)</option>
                      <option value="Cucumber">Cucumber (काँक्रो)</option>
                      <option value="Capsicum">Capsicum (भेडे खुर्सानी)</option>
                      <option value="Chilli">Chilli (खुर्सानी)</option>
                      <option value="Cauliflower">Cauliflower (काउली)</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer border-top">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-agri btn-sm">
                    Save Farm
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Farm Detail Modal */}
      {selectedFarmDetail && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content agri-card border-0">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold text-dark">{selectedFarmDetail.name}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedFarmDetail(null)}
                ></button>
              </div>
              <div className="modal-body p-4">
                <div className="small space-y-2 mb-3">
                  <div className="d-flex justify-content-between py-1 border-bottom">
                    <span className="text-muted">Location:</span>
                    <span className="fw-bold">{selectedFarmDetail.location}</span>
                  </div>
                  <div className="d-flex justify-content-between py-1 border-bottom">
                    <span className="text-muted">Registered Tunnels:</span>
                    <span className="fw-bold">{selectedFarmDetail.tunnel_count || 2} Units</span>
                  </div>
                  <div className="d-flex justify-content-between py-1 border-bottom">
                    <span className="text-muted">Total Area:</span>
                    <span className="fw-bold">{selectedFarmDetail.total_area_sqm} m²</span>
                  </div>
                  <div className="d-flex justify-content-between py-1 border-bottom">
                    <span className="text-muted">Active Crop:</span>
                    <span className="fw-bold text-success">{selectedFarmDetail.current_crop}</span>
                  </div>
                  <div className="d-flex justify-content-between py-1 border-bottom">
                    <span className="text-muted">Planting Date:</span>
                    <span className="fw-bold">{selectedFarmDetail.planting_date}</span>
                  </div>
                  <div className="d-flex justify-content-between py-1">
                    <span className="text-muted">Expected Harvest:</span>
                    <span className="fw-bold text-primary">{selectedFarmDetail.expected_harvest}</span>
                  </div>
                </div>

                <div className="p-3 bg-light rounded text-center">
                  <span className="text-muted text-xs d-block mb-1">Harvest Timeline</span>
                  <span className="fs-5 fw-bold text-success">
                    {selectedFarmDetail.days_remaining} Days Remaining
                  </span>
                </div>
              </div>
              <div className="modal-footer border-top">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setSelectedFarmDetail(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
