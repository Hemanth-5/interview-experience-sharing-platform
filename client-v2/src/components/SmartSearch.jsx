import { useState, useEffect, useRef } from 'react';
import { Search, Clock, Building, MapPin, User, TrendingUp, X } from 'lucide-react';
import { createApiUrl } from '../config/api';
import axios from 'axios';

const SmartSearch = ({ onSearch, className = '', initialValue = '', placeholder = "Search companies, roles, or keywords..." }) => {
  const [query, setQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [trendingSearches, setTrendingSearches] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  
  const searchRef = useRef(null);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  // Update query when initialValue changes
  useEffect(() => {
    setQuery(initialValue);
  }, [initialValue]);

  // Load recent searches from localStorage and trending from backend
  useEffect(() => {
    const recent = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    setRecentSearches(recent.slice(0, 5));
    
    // Fetch trending searches from backend
    fetchTrendingSearches();
  }, []);

  // Fetch trending searches from backend
  const fetchTrendingSearches = async () => {
    try {
      const response = await axios.get(
        createApiUrl('/api/search/trending'),
        { withCredentials: true }
      );
      
      if (response.data.success) {
        setTrendingSearches(response.data.trending || []);
      }
    } catch (error) {
      console.error('Error fetching trending searches:', error);
      // Fallback to empty array if backend fails
      setTrendingSearches([]);
    }
  };

  // Refresh trending searches periodically (every 5 minutes)
  useEffect(() => {
    const interval = setInterval(fetchTrendingSearches, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto-complete search suggestions
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          createApiUrl(`/api/search/suggestions?q=${encodeURIComponent(query)}`),
          { withCredentials: true }
        );
        
        if (response.data.success) {
          setSuggestions(response.data.suggestions || []);
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    const totalItems = suggestions.length + recentSearches.length + trendingSearches.length;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex(prev => prev < totalItems - 1 ? prev + 1 : prev);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex(prev => prev > -1 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0) {
          const allItems = [...suggestions, ...recentSearches, ...trendingSearches];
          if (allItems[activeIndex]) {
            handleSearch(allItems[activeIndex].query || allItems[activeIndex]);
          }
        } else if (query.trim()) {
          handleSearch(query);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setActiveIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleSearch = (searchQuery) => {
    const finalQuery = searchQuery || query;
    if (!finalQuery.trim()) return;

    // Add to recent searches
    const updated = [finalQuery, ...recentSearches.filter(s => s !== finalQuery)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));

    // Execute search
    onSearch(finalQuery);
    setQuery(finalQuery);
    setIsOpen(false);
    setActiveIndex(-1);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  const renderSuggestionItem = (item, index, type, icon) => {
    const isActive = index === activeIndex;
    const displayText = item.query || item;
    const description = item.description || null;
    const count = item.count || null;
    
    // Choose icon based on item type or fallback to provided icon
    let itemIcon = icon;
    if (item.icon) {
      switch (item.icon) {
        case 'building':
          itemIcon = <Building className="w-4 h-4" />;
          break;
        case 'user':
          itemIcon = <User className="w-4 h-4" />;
          break;
        case 'tag':
          itemIcon = <Search className="w-4 h-4" />;
          break;
        default:
          itemIcon = icon;
      }
    }
    
    return (
      <div
        key={`${type}-${index}`}
        className={`px-4 py-3 cursor-pointer transition-colors flex items-center space-x-3 ${
          isActive ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-secondary/50'
        }`}
        onClick={() => handleSearch(displayText)}
      >
        <div className="w-5 h-5 text-muted-foreground flex-shrink-0">
          {itemIcon}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">
            {displayText}
          </p>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        {count && (
          <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">
            {count} results
          </span>
        )}
      </div>
    );
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-muted-foreground" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search companies, roles, or keywords..."
          className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
        />
        {loading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card/95 backdrop-blur-sm border border-border rounded-xl shadow-2xl z-[9999] max-h-96 overflow-y-auto">
          {/* Suggestions from search */}
          {suggestions.length > 0 && (
            <div>
              <div className="px-4 py-2 border-b border-border">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Suggestions
                </h4>
              </div>
              {suggestions.map((suggestion, index) =>
                renderSuggestionItem(suggestion, index, 'suggestion', <Search className="w-4 h-4" />)
              )}
            </div>
          )}

          {/* Recent searches */}
          {recentSearches.length > 0 && (
            <div>
              <div className="px-4 py-2 border-b border-border flex items-center justify-between">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Recent Searches
                </h4>
                <button
                  onClick={clearRecentSearches}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Clear
                </button>
              </div>
              {recentSearches.map((search, index) =>
                renderSuggestionItem(
                  search, 
                  suggestions.length + index, 
                  'recent', 
                  <Clock className="w-4 h-4" />
                )
              )}
            </div>
          )}

          {/* Trending searches */}
          {trendingSearches.length > 0 && query.length < 2 && (
            <div>
              <div className="px-4 py-2 border-b border-border">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Trending Searches
                </h4>
              </div>
              {trendingSearches.map((trend, index) =>
                renderSuggestionItem(
                  trend, 
                  suggestions.length + recentSearches.length + index, 
                  'trending', 
                  <TrendingUp className="w-4 h-4" />
                )
              )}
            </div>
          )}

          {/* No results */}
          {query.length >= 2 && suggestions.length === 0 && !loading && (
            <div className="px-4 py-6 text-center text-muted-foreground">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No suggestions found</p>
              <p className="text-xs">Try searching for company names or job roles</p>
            </div>
          )}

          {/* Search tips */}
          {query.length === 0 && recentSearches.length === 0 && (
            <div className="px-4 py-6 text-center text-muted-foreground">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm mb-2">Start typing to search</p>
              <div className="text-xs space-y-1">
                <p>Try: "Google SDE", "Microsoft", "Frontend Developer"</p>
                <p>Use quotes for exact phrases</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SmartSearch;