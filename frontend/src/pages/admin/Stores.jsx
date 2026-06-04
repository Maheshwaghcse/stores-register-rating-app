import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import SortableTable from '../../components/SortableTable';
import StarRating from '../../components/StarRating';
import toast from 'react-hot-toast';

const AdminStores = () => {
  const [stores, setStores] = useState([]);
  const [filters, setFilters] = useState({ name: '', email: '', address: '' });
  const [sortBy, setSortBy] = useState('name');
  const [order, setOrder] = useState('ASC');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchStores = async () => {
    setLoading(true);
    try {
      const params = { ...filters, sortBy, order };
      const res = await api.get('/admin/stores', { params });
      setStores(res.data);
    } catch {
      toast.error('Failed to load stores.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStores(); }, [sortBy, order]);

  const handleFilterChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });
  const handleSort = (field, newOrder) => { setSortBy(field); setOrder(newOrder); };

  const columns = [
    { field: 'name', label: 'Store Name', sortable: true },
    { field: 'email', label: 'Email', sortable: true },
    { field: 'address', label: 'Address', sortable: true },
    { field: 'avgRating', label: 'Rating', sortable: false, render: (row) => (
      row.avgRating
        ? <div className="rating-cell"><StarRating value={Math.round(row.avgRating)} readonly /><span>{row.avgRating}</span></div>
        : <span className="no-rating">No ratings</span>
    )},
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2 className="page-title">Stores</h2>
          <p className="page-subtitle">All registered stores on the platform</p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/admin/stores/add')}>+ Add Store</button>
      </div>

      <div className="filter-bar">
        <input name="name" placeholder="Filter by name..." value={filters.name} onChange={handleFilterChange} />
        <input name="email" placeholder="Filter by email..." value={filters.email} onChange={handleFilterChange} />
        <input name="address" placeholder="Filter by address..." value={filters.address} onChange={handleFilterChange} />
        <button className="btn-filter" onClick={fetchStores}>Apply</button>
        <button className="btn-reset" onClick={() => { setFilters({ name: '', email: '', address: '' }); setTimeout(fetchStores, 0); }}>Reset</button>
      </div>

      {loading ? <div className="loading-state">Loading...</div> : (
        <SortableTable columns={columns} data={stores} onSort={handleSort} sortBy={sortBy} sortOrder={order} />
      )}
    </div>
  );
};

export default AdminStores;
