import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import SortableTable from '../../components/SortableTable';
import toast from 'react-hot-toast';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({ name: '', email: '', address: '', role: '' });
  const [sortBy, setSortBy] = useState('name');
  const [order, setOrder] = useState('ASC');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = { ...filters, sortBy, order };
      const res = await api.get('/admin/users', { params });
      setUsers(res.data);
    } catch {
      toast.error('Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [sortBy, order]);

  const handleFilterChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });
  const handleSort = (field, newOrder) => { setSortBy(field); setOrder(newOrder); };

  const columns = [
    { field: 'name', label: 'Name', sortable: true },
    { field: 'email', label: 'Email', sortable: true },
    { field: 'address', label: 'Address', sortable: true },
    { field: 'role', label: 'Role', sortable: true, render: (row) => (
      <span className={`badge badge-${row.role}`}>{row.role.replace('_', ' ')}</span>
    )},
    { field: 'actions', label: 'Actions', sortable: false, render: (row) => (
      <button className="btn-view" onClick={() => navigate(`/admin/users/${row.id}`)}>View</button>
    )},
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2 className="page-title">Users</h2>
          <p className="page-subtitle">Manage all users on the platform</p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/admin/users/add')}>+ Add User</button>
      </div>

      <div className="filter-bar">
        <input name="name" placeholder="Filter by name..." value={filters.name} onChange={handleFilterChange} />
        <input name="email" placeholder="Filter by email..." value={filters.email} onChange={handleFilterChange} />
        <input name="address" placeholder="Filter by address..." value={filters.address} onChange={handleFilterChange} />
        <select name="role" value={filters.role} onChange={handleFilterChange}>
          <option value="">All Roles</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
          <option value="store_owner">Store Owner</option>
        </select>
        <button className="btn-filter" onClick={fetchUsers}>Apply</button>
        <button className="btn-reset" onClick={() => { setFilters({ name: '', email: '', address: '', role: '' }); setTimeout(fetchUsers, 0); }}>Reset</button>
      </div>

      {loading ? <div className="loading-state">Loading...</div> : (
        <SortableTable columns={columns} data={users} onSort={handleSort} sortBy={sortBy} sortOrder={order} />
      )}
    </div>
  );
};

export default AdminUsers;
