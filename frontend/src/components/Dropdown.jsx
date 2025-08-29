import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const Dropdown = ({
    options = [],
    defaultValue = null,
    placeholder = "Select an option",
    onChange,
    className = "",
    disabled = false,
    width = "min-w-[150px]",
    showIcons = true,
    showDescriptions = false,
    variant = "default" // "default", "compact", "detailed"
}) => {
  const [selectedValue, setSelectedValue] = useState(defaultValue || options[0]?.value || '');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleOptionSelect = (option) => {
    setSelectedValue(option.value);
    setIsDropdownOpen(false);
    onChange?.(option.value, option);
  };

  const selectedOption = options.find(option => option.value === selectedValue);
  const displayText = selectedOption?.label || placeholder;

  // Variant styles
  const getButtonStyles = () => {
    const baseStyles = "flex items-center justify-between bg-white border-2 border-gray-200 hover:border-teal-300 transition-all duration-200 shadow-xs hover:shadow-md";
    
    switch (variant) {
      case "compact":
        return `${baseStyles} rounded-xl px-3 py-2`;
      case "detailed":
        return `${baseStyles} rounded-2xl px-5 py-2`;
      default:
        return `${baseStyles} rounded-2xl px-5 py-1.5`;
    }
  };

  const getDropdownStyles = () => {
    switch (variant) {
      case "compact":
        return "w-full bg-white border border-gray-200 rounded-xl shadow-lg";
      case "detailed":
        return "w-80 bg-white border-2 border-gray-200 rounded-2xl shadow-xl";
      default:
        return "w-full bg-white border-2 border-gray-200 rounded-2xl shadow-xl";
    }
  };

  if (disabled) {
    return (
      <div className={`${getButtonStyles()} opacity-50 cursor-not-allowed ${width} ${className}`}>
        <div className="flex items-center space-x-2">
          {showIcons && selectedOption?.icon && (
            <span className="text-gray-400">{selectedOption.icon}</span>
          )}
          <span className="font-medium text-gray-500 text-sm">{displayText}</span>
        </div>
        <ChevronDown className="w-5 h-5 text-gray-300 ml-3" />
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className={`${getButtonStyles()} ${width}`}
      >
        <div className="flex items-center space-x-2 flex-1">
          {showIcons && selectedOption?.icon && (
            <span className="text-teal-600">{selectedOption.icon}</span>
          )}
          <div className="text-left flex-1">
            <span className="font-medium text-gray-900 text-sm">
              {displayText}
            </span>
            {showDescriptions && selectedOption?.description && variant === "detailed" && (
              <div className="text-xs text-gray-500 mt-0.5">
                {selectedOption.description}
              </div>
            )}
          </div>
        </div>
        <ChevronDown 
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ml-3 ${
            isDropdownOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10"
            onClick={() => setIsDropdownOpen(false)}
          />
          
          {/* Dropdown Content */}
          <div className={`absolute right-0 top-full mt-2 ${getDropdownStyles()} z-20 overflow-hidden`}>
            <div className="p-2">
              {options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleOptionSelect(option)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-150 ${
                    selectedValue === option.value
                      ? 'bg-gradient-to-r from-teal-50 to-teal-100 text-teal-700 border border-teal-200'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  {showIcons && option.icon && (
                    <span className={selectedValue === option.value ? 'text-teal-600' : 'text-gray-500'}>
                      {option.icon}
                    </span>
                  )}
                  <div className="flex-1 text-left">
                    <div className="font-medium text-sm">{option.label}</div>
                    {showDescriptions && option.description && (
                      <div className="text-xs opacity-75 mt-0.5">{option.description}</div>
                    )}
                  </div>
                  {selectedValue === option.value && (
                    <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dropdown; 