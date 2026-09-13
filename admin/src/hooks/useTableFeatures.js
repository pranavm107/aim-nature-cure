import { useState, useMemo } from 'react';

export const useTableFeatures = (data, searchKeys = [], defaultSort = null) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState(defaultSort);
  const [filters, setFilters] = useState({});

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      if (!value || value === 'All') {
        delete newFilters[key];
      } else {
        newFilters[key] = value;
      }
      return newFilters;
    });
  };

  const processedData = useMemo(() => {
    let result = [...(data || [])];

    // 1. Search
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(item => {
        return searchKeys.some(key => {
          const val = key.split('.').reduce((o, i) => (o ? o[i] : null), item);
          return val && String(val).toLowerCase().includes(lowerSearch);
        });
      });
    }

    // 2. Filter
    if (Object.keys(filters).length > 0) {
      result = result.filter(item => {
        return Object.entries(filters).every(([key, value]) => {
          const itemVal = key.split('.').reduce((o, i) => (o ? o[i] : null), item);
          return itemVal === value;
        });
      });
    }

    // 3. Sort
    if (sortConfig) {
      result.sort((a, b) => {
        const valA = sortConfig.key.split('.').reduce((o, i) => (o ? o[i] : null), a);
        const valB = sortConfig.key.split('.').reduce((o, i) => (o ? o[i] : null), b);
        
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, searchTerm, filters, sortConfig, searchKeys]);

  return {
    searchTerm,
    setSearchTerm,
    filters,
    handleFilterChange,
    sortConfig,
    handleSort,
    processedData
  };
};
