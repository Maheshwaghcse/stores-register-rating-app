import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import StarRating from '../../components/StarRating';
import toast from 'react-hot-toast';

const UserStores = () => {
  const [stores, setStores] = useState([]);
  const [filters, setFilters] = useState({ name: '', address: '' });
  const [sortBy, setSortBy] = useState('name');
  const [order, setOrder] = useState('ASC');
  const [loading, setLoading] = useState(true);
  const [ratingModal, setRatingModal] = useState(null); // { storeId, storeTitle, ratingId, current }
  const [ratingVal, setRatingVal] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const fetchStores = async () => {
    setLoading(true);
    try {
      const res = await api.get('/stores', { params: { ...filters, sortBy, order } });
      setStores(res.data);
    } catch {
      toast.error('Failed to load stores.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStores(); }, [sortBy, order]);

  const openModal = (store) => {
    setRatingModal({ storeId: store.id, storeTitle: store.name, ratingId: store.userRatingId, current: store.userRating });
    setRatingVal(store.userRating || 0);
  };

  const closeModal = () => { setRatingModal(null); setRatingVal(0); };

  const handleRatingSubmit = async () => {
    if (!ratingVal) { toast.error('Please select a rating.'); return; }
    setSubmitting(true);
    try {
      if (ratingModal.ratingId) {
        await api.put(`/stores/ratings/${ratingModal.ratingId}`, { rating: ratingVal });
        toast.success('Rating updated!');
      } else {
        await api.post('/stores/ratings', { store_id: ratingModal.storeId, rating: ratingVal });
        toast.success('Rating submitted!');
      }
      closeModal();
      fetchStores();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit rating.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) setOrder(order === 'ASC' ? 'DESC' : 'ASC');
    else { setSortBy(field); setOrder('ASC'); }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2 className="page-title">Stores</h2>
          <p className="page-subtitle">Browse and rate registered stores</p>
        </div>
      </div>

      <div className="filter-bar">
        <input name="name" placeholder="Search by name..." value={filters.name}
          onChange={e => setFilters({ ...filters, name: e.target.value })} />
        <input name="address" placeholder="Search by address..." value={filters.address}
          onChange={e => setFilters({ ...filters, address: e.target.value })} />
        <button className="btn-filter" onClick={fetchStores}>Search</button>
        <button className="btn-reset" onClick={() => { setFilters({ name: '', address: '' }); setTimeout(fetchStores, 0); }}>Reset</button>
        <div className="sort-controls">
          <span>Sort:</span>
          <button className={`sort-btn ${sortBy === 'name' ? 'active' : ''}`} onClick={() => handleSort('name')}>
            Name {sortBy === 'name' ? (order === 'ASC' ? '▲' : '▼') : ''}
          </button>
          <button className={`sort-btn ${sortBy === 'address' ? 'active' : ''}`} onClick={() => handleSort('address')}>
            Address {sortBy === 'address' ? (order === 'ASC' ? '▲' : '▼') : ''}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">Loading stores...</div>
      ) : (
        <div className="store-grid">
          {stores.length === 0 ? (
            <div className="empty-state">No stores found.</div>
          ) : stores.map(store => (
            <div key={store.id} className="store-card">
              <div className="store-card-header">
                <div className="store-icon">🏪</div>
                <div className="store-info">
                  <h3 className="store-name">{store.name}</h3>
                  <p className="store-address">📍 {store.address}</p>
                </div>
              </div>
              <div className="store-card-body">
                <div className="rating-row">
                  <span className="rating-label">Overall Rating</span>
                  <div className="rating-display">
                    {store.avgRating ? (
                      <>
                        <StarRating value={Math.round(store.avgRating)} readonly />
                        <span className="rating-num">{store.avgRating}</span>
                      </>
                    ) : <span className="no-rating">Not rated yet</span>}
                  </div>
                </div>
                <div className="rating-row">
                  <span className="rating-label">Your Rating</span>
                  <div className="rating-display">
                    {store.userRating ? (
                      <><StarRating value={store.userRating} readonly /><span className="rating-num">{store.userRating}</span></>
                    ) : <span className="no-rating">Not rated</span>}
                  </div>
                </div>
              </div>
              <div className="store-card-footer">
                <button className="btn-rate" onClick={() => openModal(store)}>
                  {store.userRating ? '✏️ Modify Rating' : '⭐ Rate Store'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rating Modal */}
      {ratingModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{ratingModal.ratingId ? 'Update Rating' : 'Rate Store'}</h3>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-body">
              <p className="modal-store-name">{ratingModal.storeTitle}</p>
              <div className="modal-stars">
                <StarRating value={ratingVal} onChange={setRatingVal} />
              </div>
              <p className="modal-hint">Select a rating from 1 to 5 stars</p>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={closeModal}>Cancel</button>
              <button className="btn-primary" onClick={handleRatingSubmit} disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Rating'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserStores;
