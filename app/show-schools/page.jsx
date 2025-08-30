'use client';

import { useState, useEffect, useMemo } from 'react';
import '../show-schools/pageshow.css';

// Mapping of states to their top 5 cities for schools
const stateCityMap = {
  "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Tirupati", "Kurnool"],
  "Bihar": ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Purnia"],
  "Delhi": ["New Delhi", "Dwarka", "Rohini", "Saket", "Karol Bagh"],
  "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar"],
  "Karnataka": ["Bangalore", "Mysore", "Mangalore", "Hubli", "Belgaum"],
  "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Kollam", "Palakkad"],
  "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik", "Thane"],
  "Punjab": ["Amritsar", "Ludhiana", "Jalandhar", "Patiala", "Bathinda"],
  "Rajasthan": ["Jaipur", "Udaipur", "Jodhpur", "Kota", "Bikaner"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem"],
  "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Khammam"],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Noida", "Agra", "Varanasi"],
  "West Bengal": ["Kolkata", "Howrah", "Durgapur", "Siliguri", "Asansol"]
};

const boards = ["State", "CBSE", "ICSE", "IGCSE", "IB"];

export default function ShowSchoolsPage() {
  const [allSchools, setAllSchools] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [boardFilter, setBoardFilter] = useState('');
  const [stateFilter, setStateFilter] = useState('');
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

  // Get cities for the selected state
  const filteredCities = stateFilter ? stateCityMap[stateFilter] || [] : [];

  // Apply all filters
  const filteredSchools = useMemo(() => {
    return allSchools.filter(school => {
      const nameMatches = school.name.toLowerCase().includes(searchTerm.toLowerCase());
      const boardMatches = boardFilter ? school.board === boardFilter : true;
      const stateMatches = stateFilter ? school.state === stateFilter : true;
      const cityMatches = cityFilter ? school.city === cityFilter : true;
      return nameMatches && boardMatches && stateMatches && cityMatches;
    });
  }, [allSchools, searchTerm, boardFilter, stateFilter, cityFilter]);

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
              <div className="school-detailstop">
                <h2 className="school-name" title={school.name}>{school.name}</h2>
                <p className="school-board">{school.board}</p>
              </div>
              <p className="school-address" title={school.address}>{school.address}</p>
              <p className="school-city">{school.city}</p>
              <p className="school-state">{school.state}</p>
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
          <select
            className="search-input"
            value={boardFilter}
            onChange={(e) => setBoardFilter(e.target.value)}
          >
            <option value="">All Boards</option>
            {boards.map(board => (
              <option key={board} value={board}>{board}</option>
            ))}
          </select>
          <select
            className="search-input"
            value={stateFilter}
            onChange={(e) => {
              setStateFilter(e.target.value);
              setCityFilter('');
            }}
          >
            <option value="">All States</option>
            {Object.keys(stateCityMap).map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
          <select
            className="search-input"
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            disabled={!stateFilter}
          >
            <option value="">All Cities</option>
            {filteredCities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>
        {renderContent()}
      </div>
    </div>
  );
}
