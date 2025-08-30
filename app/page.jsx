'use client';

import { useState, useEffect, useMemo } from 'react';
import './showpage.css';

export default function ShowSchoolsPage() {
  const [allSchools, setAllSchools] = useState([]);
  const [status, setStatus] = useState('loading'); // loading, error, success
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [cityFilter, setCityFilter] = useState('');

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const res = await fetch('/api/schools');
        if (!res.ok) throw new Error(`Failed to fetch: ${res.statusText}`);

        const result = await res.json();
        if (result.success) {
          setAllSchools(result.data || []);
          setStatus('success');
        } else {
          throw new Error(result.error);
        }
      } catch (e) {
        setError(e.message);
        setStatus('error');
      }
    };
    fetchSchools();
  }, []);

  const filteredSchools = useMemo(() => {
    return allSchools.filter(school => {
      const nameMatches = school.name.toLowerCase().includes(searchTerm.toLowerCase());
      const cityMatches = cityFilter ? school.city.toLowerCase().includes(cityFilter.toLowerCase()) : true;
      return nameMatches && cityMatches;
    });
  }, [allSchools, searchTerm, cityFilter]);

  const renderContent = () => {
    if (status === 'loading') return <div className="school-loading">Loading schools...</div>;
    if (status === 'error') return <div className="school-error">Error loading schools: {error}</div>;
    if (filteredSchools.length === 0) return <div className="school-empty">No schools found. Try adjusting your search.</div>;
    
    return (
      <div className="school-grid">
        {filteredSchools.map((school) => (
          <div key={school.id} className="school-card">
            <img
              src={school.image}
              alt={`Image of ${school.name}`}
              className="school-image"
              onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/600x400?text=No+Image'; }}
            />
            <div className="school-details">
              <h2 className="school-name" title={school.name}>{school.name}</h2>
              <p className="school-address" title={school.address}>{school.address}</p>
              <p className="school-city">{school.city}</p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="page-container">
      <div className="page-inner">
        <div className="header-section">
          <div className="header-text">
            <h1 className="page-title">School Directory</h1>
            <p className="page-subtitle">Find the perfect school for you.</p>
          </div>
          <a href="/add-school" className="add-button">+ Add New School</a>
        </div>
        <div className="search-section">
          <input 
            type="text"
            placeholder="Search by school name..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <input 
            type="text"
            placeholder="Filter by city..."
            className="search-input"
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
          />
        </div>
        {renderContent()}
      </div>
    </div>
  );
}
