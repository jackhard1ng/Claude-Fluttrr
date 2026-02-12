import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Sliders } from 'lucide-react';

const SearchBar = ({
  placeholder = 'Search events, places, people...',
  value = '',
  onChange,
  onSubmit,
  onFocus,
  onClear,
  showFilters = false,
  onFilterClick,
  autoFocus = false,
  size = 'default',
  className = '',
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit && onSubmit(value);
  };

  const handleClear = () => {
    onChange && onChange('');
    onClear && onClear();
    inputRef.current?.focus();
  };

  return (
    <form
      className={`search-bar ${size === 'lg' ? 'search-bar-lg' : ''} ${isFocused ? 'search-bar-focused' : ''} ${className}`}
      onSubmit={handleSubmit}
    >
      <div className="search-bar-inner">
        <Search
          size={size === 'lg' ? 20 : 18}
          className="search-bar-icon"
        />
        <input
          ref={inputRef}
          type="text"
          className="search-bar-input"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange && onChange(e.target.value)}
          onFocus={() => {
            setIsFocused(true);
            onFocus && onFocus();
          }}
          onBlur={() => setIsFocused(false)}
        />
        {value && (
          <button
            type="button"
            className="search-bar-clear"
            onClick={handleClear}
          >
            <X size={16} />
          </button>
        )}
        {showFilters && (
          <button
            type="button"
            className="search-bar-filter-btn"
            onClick={onFilterClick}
          >
            <Sliders size={18} />
          </button>
        )}
      </div>
    </form>
  );
};

export default SearchBar;
