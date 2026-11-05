import React, { useState, useEffect, useRef, useCallback } from 'react';
import { patientService } from '../../services/patientService';
import { Search, ChevronDown, Check, User, Phone, X, Loader2 } from 'lucide-react';

const PAGE_SIZE = 15;

const PatientSelectDropdown = ({
  value,
  onChange,
  required = false,
  placeholder = "Search and select a patient..."
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [patients, setPatients] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const containerRef = useRef(null);
  const listRef = useRef(null);
  const searchInputRef = useRef(null);
  const searchDebounceRef = useRef(null);

  // Fetch first page or search results
  const fetchPatients = useCallback(async (search = '', reset = true) => {
    if (reset) {
      setLoading(true);
    }
    try {
      const res = await patientService.getPatients({
        search,
        page: 0,
        size: PAGE_SIZE
      });

      if (res.success) {
        const list = res.patients || [];
        setPatients(list);
        setPage(0);
        const total = res.pagination?.totalElements ?? list.length;
        const totalPages = res.pagination?.totalPages ?? 1;
        setTotalElements(total);
        setHasMore(totalPages > 1);
      } else {
        setPatients([]);
        setHasMore(false);
      }
    } catch (err) {
      console.error('Error fetching patients:', err);
      setPatients([]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchPatients('', true);
  }, [fetchPatients]);

  // If a value is provided, resolve the selected patient object
  useEffect(() => {
    if (!value) {
      setSelectedPatient(null);
      return;
    }

    // Try finding in loaded list
    const found = patients.find(p => (p.uuid === value || p._id === value || p.id === value));
    if (found) {
      setSelectedPatient(found);
      return;
    }

    // Otherwise fetch specifically by ID
    let isCancelled = false;
    patientService.getPatientById(value).then(res => {
      if (!isCancelled && res.success && res.patient) {
        setSelectedPatient(res.patient);
      }
    }).catch(err => {
      console.warn('Could not fetch selected patient details:', err);
    });

    return () => {
      isCancelled = true;
    };
  }, [value, patients]);

  // Handle Search Input Change with Debounce
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    searchDebounceRef.current = setTimeout(() => {
      fetchPatients(query, true);
    }, 300);
  };

  // Infinite Scroll Handler: "Keep scrolling"
  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    // Check if scrolled within 60px of the bottom
    if (scrollHeight - scrollTop - clientHeight < 60) {
      if (hasMore && !loadingMore && !loading) {
        loadMorePatients();
      }
    }
  };

  const loadMorePatients = async () => {
    if (!hasMore || loadingMore || loading) return;

    setLoadingMore(true);
    const nextPage = page + 1;

    try {
      const res = await patientService.getPatients({
        search: searchQuery,
        page: nextPage,
        size: PAGE_SIZE
      });

      if (res.success) {
        const nextList = res.patients || [];
        setPatients(prev => {
          const seen = new Set(prev.map(p => p.uuid || p._id));
          const uniqueNew = nextList.filter(p => !seen.has(p.uuid || p._id));
          return [...prev, ...uniqueNew];
        });
        setPage(nextPage);
        const totalPages = res.pagination?.totalPages ?? 1;
        setHasMore(nextPage < totalPages - 1);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error('Error loading more patients on scroll:', err);
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  };

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

  // Focus search input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  const handleSelect = (patient) => {
    const selectedId = patient.uuid || patient._id;
    setSelectedPatient(patient);
    onChange(selectedId, patient);
    setIsOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    setSelectedPatient(null);
    onChange('', null);
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Hidden input to support HTML5 required validation */}
      {required && (
        <input 
          type="text" 
          value={value || ''} 
          required 
          onChange={() => {}} 
          className="sr-only" 
          tabIndex={-1} 
        />
      )}

      {/* Trigger Button */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
        className={`w-full bg-white border rounded-lg px-3.5 py-2.5 text-sm text-slate-800 flex items-center justify-between cursor-pointer transition-all shadow-sm ${
          isOpen 
            ? 'border-primary ring-2 ring-primary/20' 
            : 'border-slate-300 hover:border-slate-400'
        }`}
      >
        <div className="flex items-center gap-2.5 truncate">
          <User className="w-4 h-4 text-primary shrink-0" />
          {selectedPatient ? (
            <div className="flex items-center gap-2 truncate">
              <span className="font-semibold text-slate-800 truncate">
                {selectedPatient.name}
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary font-mono font-medium">
                {selectedPatient.patientId || selectedPatient.idNumber || 'ID'}
              </span>
              {selectedPatient.phone && (
                <span className="text-xs text-slate-500 hidden sm:inline">
                  • {selectedPatient.phone}
                </span>
              )}
            </div>
          ) : (
            <span className="text-slate-400">{placeholder}</span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          {selectedPatient && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
              title="Clear selection"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
          {/* Search Header */}
          <div className="p-2.5 border-b border-slate-100 bg-slate-50/80">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search by name, ID (e.g. AIM...), or phone..."
                className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-8 py-2 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    fetchPatients('', true);
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Scrollable Patient List: "Keep scrolling" */}
          <div
            ref={listRef}
            onScroll={handleScroll}
            className="max-h-64 overflow-y-auto divide-y divide-slate-100 text-sm"
          >
            {loading ? (
              <div className="p-8 text-center text-slate-500 flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                <span className="text-xs">Loading patients...</span>
              </div>
            ) : patients.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                No patients found {searchQuery ? `matching "${searchQuery}"` : ''}
              </div>
            ) : (
              patients.map((p) => {
                const patientId = p.uuid || p._id;
                const isSelected = value === patientId;
                const displayId = p.patientId || p.idNumber;

                return (
                  <div
                    key={patientId}
                    onClick={() => handleSelect(p)}
                    className={`px-3.5 py-2.5 cursor-pointer transition-colors flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-slate-900 truncate">
                          {p.name}
                        </span>
                        {displayId && (
                          <span className="text-[11px] font-mono px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded font-medium">
                            {displayId}
                          </span>
                        )}
                        {p.gender && (
                          <span className="text-[10px] uppercase font-bold text-slate-400">
                            • {p.gender}
                          </span>
                        )}
                        {p.age != null && (
                          <span className="text-[10px] text-slate-400">
                            {p.age} yrs
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                        {p.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {p.phone}
                          </span>
                        )}
                        {p.doctorName && (
                          <span className="text-slate-500">
                            Doctor: <strong className="font-medium text-slate-600">{p.doctorName}</strong>
                          </span>
                        )}
                      </div>
                    </div>

                    {isSelected && (
                      <Check className="w-4 h-4 text-primary shrink-0" />
                    )}
                  </div>
                );
              })
            )}

            {/* Loading More Spinner on Scroll */}
            {loadingMore && (
              <div className="p-3 text-center text-xs text-slate-500 flex items-center justify-center gap-2 bg-slate-50/50">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span>Loading more patients...</span>
              </div>
            )}
          </div>

          {/* List Footer with Scroll Info */}
          {!loading && patients.length > 0 && (
            <div className="px-3 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>
                Showing {patients.length} {totalElements ? `of ${totalElements}` : ''} patients
              </span>
              {hasMore ? (
                <span className="text-primary font-medium">Scroll down for more ↓</span>
              ) : (
                <span className="text-slate-400">All patients loaded ✓</span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PatientSelectDropdown;

