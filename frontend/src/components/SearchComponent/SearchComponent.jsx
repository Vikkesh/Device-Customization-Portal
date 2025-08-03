import React, { useEffect, useState, useRef } from 'react';
import styles from './SearchComponent.module.css';

const SearchComponent = ({ 
  onSearchResults, 
  data = [], 
  searchFields = [], 
  placeholder = 'Search...' 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const inputRef = useRef(null);

  const handleInputChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
     if (inputRef.current) inputRef.current.blur();
    // Form submission is handled by useEffect for real-time search
  };

  // Real-time search effect
  useEffect(() => {
    if (!searchTerm.trim()) {
      // If search term is empty, return empty array to show all data
      onSearchResults([]);
      return;
    }

    const filteredResults = data.filter(item => {
      return searchFields.some(field => {
        const fieldValue = item[field];
        if (fieldValue === null || fieldValue === undefined) return false;
        return fieldValue.toString().toLowerCase().includes(searchTerm.toLowerCase());
      });
    });

    onSearchResults(filteredResults);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]); // Only depend on searchTerm to avoid infinite loops

  return (
    <form onSubmit={handleSubmit} className={styles.searchForm}>
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={handleInputChange}
        className={styles.searchInput}
      />
      <button type="submit" className={styles.searchButton}>
        Search
      </button>
    </form>
  );
};

export default SearchComponent;
