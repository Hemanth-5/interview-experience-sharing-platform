import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

/**
 * SearchableDropdown - A reusable dropdown component with search functionality
 * @param {object} props
 * @param {string} props.value - The selected value
 * @param {function} props.onChange - Callback when value changes
 * @param {Array<string>} props.options - Array of option strings
 * @param {string} [props.placeholder] - Placeholder text
 * @param {string} [props.className] - Additional CSS classes
 * @param {React.Component} [props.icon] - Icon component to display on the left
 * @param {boolean} [props.required] - Whether the field is required
 */
const SearchableDropdown = ({ 
  value, 
  onChange, 
  options, 
  placeholder, 
  className = "",
  icon: Icon,
  required = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (option) => {
    onChange(option);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleInputClick = () => {
    setIsOpen(!isOpen);
    setSearchTerm('');
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setIsOpen(true);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
        )}
        <input
          type="text"
          className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-10 py-3 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-background text-foreground cursor-pointer`}
          value={isOpen ? searchTerm : value}
          onClick={handleInputClick}
          onChange={handleSearchChange}
          placeholder={placeholder}
          required={required}
          autoComplete="off"
        />
        <ChevronDown 
          className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </div>
      
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option, index) => (
              <div
                key={index}
                className="px-4 py-2 hover:bg-secondary cursor-pointer text-foreground"
                onClick={() => handleSelect(option)}
              >
                {option}
              </div>
            ))
          ) : (
            <div className="px-4 py-2 text-muted-foreground">
              No options found
            </div>
          )}
        </div>
      )}
      
      {/* Overlay to close dropdown when clicking outside */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default SearchableDropdown;
