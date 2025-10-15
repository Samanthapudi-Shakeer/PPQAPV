import React from "react";
import { useLocation } from "react-router-dom";
import { Search, XCircle } from "lucide-react";
import clsx from "clsx";
import { useGlobalSearch } from "../context/GlobalSearchContext";

const EXCLUDED_PATHS = ["/login"];

const GlobalSearchBar = () => {
  const location = useLocation();
  const { searchTerm, setSearchTerm } = useGlobalSearch();

  if (EXCLUDED_PATHS.includes(location.pathname)) {
    return null;
  }

  const handleClear = () => {
    setSearchTerm("");
  };

  return (
    <div className="global-search-shell">
      <div className="global-search-container">
        <Search aria-hidden="true" className="global-search-icon" size={18} />
        <input
          type="search"
          className="global-search-input"
          placeholder="Search across projects, users, and plan content"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          aria-label="Global search"
        />
        <button
          type="button"
          className={clsx("global-search-clear", { "is-visible": Boolean(searchTerm) })}
          onClick={handleClear}
          aria-label="Clear global search"
        >
          <XCircle aria-hidden="true" size={16} />
        </button>
      </div>
    </div>
  );
};

export default GlobalSearchBar;
