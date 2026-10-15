import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown, X, Search } from 'lucide-react';

const MultiSelect = ({
  label,
  options = [],
  value = [],
  onChange,
  placeholder = "Select options...",
  required = false,
  className = "",
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt =>
    (opt.label || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isSelected = (val) => value.includes(val);

  const toggleOption = (val) => {
    if (disabled) return;
    if (isSelected(val)) {
      onChange(value.filter(v => v !== val));
    } else {
      onChange([...value, val]);
    }
  };

  const removeOption = (e, val) => {
    e.stopPropagation();
    if (disabled) return;
    onChange(value.filter(v => v !== val));
  };

  const handleSelectAll = (e) => {
    e.stopPropagation();
    if (disabled) return;
    const allFilteredVals = filteredOptions.map(o => o.value);
    const newSelected = Array.from(new Set([...value, ...allFilteredVals]));
    onChange(newSelected);
  };

  const handleClearAll = (e) => {
    e.stopPropagation();
    if (disabled) return;
    onChange([]);
  };

  // Get selected option objects
  const selectedOptions = options.filter(opt => value.includes(opt.value));

  return (
    <div className={`flex-1 flex flex-col gap-1.5 relative ${className}`} ref={containerRef}>
      {label && (
        <div className="flex justify-between items-center text-sm font-bold text-slate-700 mb-1">
          <span>{label} {required && <span className="text-red-500">*</span>}</span>
          {value.length > 0 && (
            <span className="text-xs text-primary font-semibold">
              {value.length} selected
            </span>
          )}
        </div>
      )}

      {/* Trigger Box */}
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`min-h-[42px] bg-white border rounded-lg px-3 py-2 shadow-sm transition-all flex items-center justify-between gap-2 cursor-pointer ${
          isOpen ? 'ring-2 ring-primary/20 border-primary' : 'border-slate-300 hover:border-slate-400'
        } ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-50' : ''}`}
      >
        <div className="flex flex-wrap items-center gap-1.5 flex-1 min-w-0">
          {selectedOptions.length === 0 ? (
            <span className="text-sm text-slate-400 select-none">{placeholder}</span>
          ) : (
            selectedOptions.map(opt => (
              <span
                key={opt.value}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary border border-primary/20"
              >
                <span>{opt.label}</span>
                <button
                  type="button"
                  onClick={(e) => removeOption(e, opt.value)}
                  className="hover:bg-primary/20 p-0.5 rounded-full transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0 text-slate-400">
          {value.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="hover:text-slate-600 p-0.5 transition-colors"
              title="Clear all"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180 text-primary' : ''}`} />
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl z-50 overflow-hidden">
          {/* Search Bar */}
          <div className="p-2 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-400 ml-1" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search therapies..."
              className="w-full bg-transparent text-sm text-slate-800 placeholder:text-slate-400 outline-none"
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
            {searchQuery && (
              <button 
                type="button" 
                onClick={(e) => { e.stopPropagation(); setSearchQuery(''); }}
                className="text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Actions */}
          <div className="px-3 py-1.5 border-b border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
            <span>{filteredOptions.length} available</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-primary hover:underline font-semibold"
              >
                Select All
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={handleClearAll}
                className="text-slate-500 hover:underline"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-56 overflow-y-auto py-1 divide-y divide-slate-50">
            {filteredOptions.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">
                No matching options found
              </div>
            ) : (
              filteredOptions.map(opt => {
                const checked = isSelected(opt.value);
                return (
                  <div
                    key={opt.value}
                    onClick={() => toggleOption(opt.value)}
                    className={`flex items-center justify-between px-3.5 py-2.5 text-sm cursor-pointer transition-colors ${
                      checked 
                        ? 'bg-primary/5 text-primary font-medium' 
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                        checked ? 'bg-primary border-primary text-white' : 'border-slate-300 bg-white'
                      }`}>
                        {checked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span className="truncate">{opt.label}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiSelect;
