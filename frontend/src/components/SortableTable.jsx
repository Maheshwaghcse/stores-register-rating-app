import React, { useState } from 'react';

const SortableTable = ({ columns, data, onSort, sortBy, sortOrder }) => {
  const handleSort = (field) => {
    if (!onSort) return;
    const newOrder = sortBy === field && sortOrder === 'ASC' ? 'DESC' : 'ASC';
    onSort(field, newOrder);
  };

  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.field}
                onClick={() => col.sortable !== false && handleSort(col.field)}
                className={col.sortable !== false ? 'sortable' : ''}
              >
                {col.label}
                {col.sortable !== false && (
                  <span className="sort-icon">
                    {sortBy === col.field ? (sortOrder === 'ASC' ? ' ▲' : ' ▼') : ' ⇅'}
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr><td colSpan={columns.length} className="empty-row">No records found.</td></tr>
          ) : (
            data.map((row, idx) => (
              <tr key={row.id || idx}>
                {columns.map((col) => (
                  <td key={col.field}>
                    {col.render ? col.render(row) : (row[col.field] ?? '—')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default SortableTable;
