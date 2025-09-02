"use client";

import { useState, useEffect, useMemo } from "react";
import LanguageIcon from '@mui/icons-material/Language';
import "../show-schools/pageshow.css";

// Mapping of states to their top 5 cities for schools
const stateCityMap = {
  "Andhra Pradesh": ["Visakhapatnam","Vijayawada","Guntur","Madanapalle",],
  Assam: ["Balipara","Guwahati"],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Noida", "Agra", "Varanasi"],
  Bihar: ["Patna"],
  Gujarat: ["Ahmedabad"],
  Karnataka: ["Bangalore"],
  Kerala: ["Thiruvananthapuram", "Kochi", "Kottayam"],
  Maharashtra: ["Mumbai", "Pune", "Nagpur", "Nashik", "Thane"],
  Punjab: ["Amritsar", "Ludhiana",  "Patiala"],
  Rajasthan: ["Jaipur", "Udaipur", "Jodhpur", "Kota", "Bikaner"],
  "Tamil Nadu": [
    "Chennai",
    "Coimbatore",
    "Madurai",
    "Tiruchirappalli",
    "Salem",
  ],
  
  "West Bengal": ["Kolkata", "Howrah", "Durgapur", "Siliguri", "Asansol"],
};

const boards = ["State", "CBSE", "ICSE", "IGCSE","ISC", "IB"];

const type = ["Boys school", "Girls school", "Coeducation"];

export default function ShowSchoolsPage() {
  const [allSchools, setAllSchools] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [boardFilter, setBoardFilter] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const res = await fetch("/api/schools");
        if (!res.ok) throw new Error(`Failed to fetch: ${res.statusText}`);
        const result = await res.json();
        if (result.success) {
          setAllSchools(result.data || []);
          setStatus("success");
        } else {
          throw new Error(result.error);
        }
      } catch (e) {
        setError(e.message);
        setStatus("error");
      }
    };
    fetchSchools();
  }, []);

  // Get cities for the selected state
  const filteredCities = stateFilter ? stateCityMap[stateFilter] || [] : [];
const normalizeToArray = (val) => {
  if (!val) return [];
  if (Array.isArray(val)) return val.map(v => String(v).trim());
  // handle comma/pipe/semicolon separated lists or plus signs
  return String(val)
    .split(/[,;|+]/)
    .map(v => v.trim())
    .filter(Boolean);
};

const filteredSchools = useMemo(() => {
  const search = searchTerm.toLowerCase().trim();

  return allSchools.filter((school) => {
    // name match
    const nameMatches = !search || (school.name || "").toLowerCase().includes(search);

    // board match (school may have multiple)
    const schoolBoards = normalizeToArray(school.board || school.boards);
    const boardMatches = !boardFilter || schoolBoards.some(b => b.toLowerCase() === boardFilter.toLowerCase());

    // state/city exact match (single value fields)
    const stateMatches = !stateFilter || school.state === stateFilter;
    const cityMatches = !cityFilter || school.city === cityFilter;

    // type match (support multiple types if present)
    const schoolTypes = normalizeToArray(school.type || school.types);
    const typeMatches = !typeFilter || schoolTypes.some(t => t.toLowerCase() === typeFilter.toLowerCase());

    return nameMatches && boardMatches && stateMatches && cityMatches && typeMatches;
  });
}, [allSchools, searchTerm, boardFilter, stateFilter, cityFilter, typeFilter]);

  const renderContent = () => {
    if (status === "loading")
      return (
        <div
          className="dotted-loader"
          role="status"
          aria-label="Loading schools"
          aria-busy="true"
          aria-live="polite"
        >
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
        </div>
      );

    if (status === "error")
      return <div className="school-error">Error loading schools: {error}</div>;
    if (filteredSchools.length === 0)
      return (
        <div className="school-empty">
          No schools found. Try adjusting your search.
        </div>
      );

    return (
      <div className="school-grid">
        {filteredSchools.map((school) => (
          <div key={school.id} className="school-card">
            <img
              src={school.image}
              alt={`Image of ${school.name}`}
              className="school-image"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://placehold.co/600x400?text=No+Image";
              }}
            />
            <div className="school-details">
              <div className="school-detailstop">
                <h2 className="school-name" title={school.name}>
                  {school.name}
                </h2>
                <p className="school-board">{school.board}</p>
              </div>
              <p className="school-address" title={school.address}>
                {school.address}
              </p>
              <p className="school-city">{school.city}</p>
              <p className="school-state">{school.state}</p> 
              <div className="school-websection">
                <LanguageIcon/>
                <a href={school.website} target="blank" className="school-website" title={school.website}>
                  {school.website}
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="page-container">
      <div className="page-inner">
        <div className="page-search">
          <div className="header-section">
            <div className="header-text">
              <h1 className="page-title">School Finder</h1>
              <p className="page-subtitle">Find the perfect school for you.</p>
            </div>
            <a href="/add-school" className="add-button">
              + <span className="addscl">Add New School</span>
            </a>
          </div>

          <button
            className="search-toggle"
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? "Hide Search Options" : "Search Options"}
          </button>

          <div className={`search-section ${showFilters ? "open" : ""}`}>
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
              {boards.map((board) => (
                <option key={board} value={board}>
                  {board}
                </option>
              ))}
            </select>
            <select
              className="search-input"
              value={stateFilter}
              onChange={(e) => {
                setStateFilter(e.target.value);
                setCityFilter("");
              }}
            >
              <option value="">All States</option>
              {Object.keys(stateCityMap).map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
            <select
              className="search-input"
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              disabled={!stateFilter}
            >
              {!stateFilter ? (
                <option value="">Select State to select city</option>
              ) : (
                <>
                  <option value="">All Cities</option>
                  {filteredCities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </>
              )}
            </select>

            <select
              className="search-input"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">All Types</option>
              {type.map((schoolType) => (
                <option key={schoolType} value={schoolType}>
                  {schoolType}
                </option>
              ))}
            </select>
          </div>
        </div>
        {renderContent()}
      </div>
    </div>
  );
}
