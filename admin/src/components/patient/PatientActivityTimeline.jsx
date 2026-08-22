import React, { useState, useEffect } from 'react';
import { patientActivityService } from '../../services/patientActivityService';
import { toast } from 'react-toastify';
import Badge from '../common/Badge';

const PatientActivityTimeline = ({ patientId }) => {
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterType, setFilterType] = useState('All');
  const [sortOrder, setSortOrder] = useState('Newest');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Expand state
  const [expandedIds, setExpandedIds] = useState(new Set());

  useEffect(() => {
    fetchActivity();
  }, [patientId]);

  const fetchActivity = async () => {
    setLoading(true);
    try {
      const res = await patientActivityService.getPatientActivity(patientId);
      if (res.success) {
        setActivities(res.activities);
        applyFilters(res.activities, 'All', 'Newest', '');
      }
    } catch (err) {
      toast.error("Failed to load timeline");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (data, type, sort, query) => {
    let result = [...data];

    if (type !== 'All') {
      result = result.filter(a => a.type === type.toUpperCase());
    }

    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(a => 
        a.title.toLowerCase().includes(q) || 
        (a.description && a.description.toLowerCase().includes(q))
      );
    }

    if (sort === 'Oldest') {
      result.sort((a, b) => a.rawDate - b.rawDate);
    } else {
      result.sort((a, b) => b.rawDate - a.rawDate);
    }

    setFilteredActivities(result);
  };

  useEffect(() => {
    applyFilters(activities, filterType, sortOrder, searchQuery);
  }, [filterType, sortOrder, searchQuery]);

  const toggleExpand = (id) => {
    const newSet = new Set(expandedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setExpandedIds(newSet);
  };

  const getIconForType = (type) => {
    switch(type) {
      case 'CONSULTATION': 
        return <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>;
      case 'DOCUMENT':
        return <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
      case 'FOLLOW-UP':
        return <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
      case 'FINANCIAL':
        return <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
      case 'THERAPY':
        return <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
      default:
        return <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" /></svg>;
    }
  };

  const getBadgeVariant = (type) => {
    switch(type) {
      case 'CONSULTATION': return 'primary';
      case 'FOLLOW-UP': return 'success';
      case 'DOCUMENT': return 'warning'; // Purple isn't default, fallback to warning style
      case 'FINANCIAL': return 'danger'; // Orange fallback
      default: return 'neutral';
    }
  };

  return (
    <div className="bg-white border rounded-xl p-6 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4 border-b pb-4">
        <h2 className="text-lg font-semibold text-gray-800">Patient Activity</h2>
        
        <div className="flex flex-wrap gap-3">
          <input 
            type="text" 
            placeholder="Search activity..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-primary"
          />
          <select 
            value={filterType} 
            onChange={e => setFilterType(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-primary bg-white"
          >
            <option value="All">All Types</option>
            <option value="Consultation">Consultations</option>
            <option value="Therapy">Therapies</option>
            <option value="Follow-up">Follow-ups</option>
            <option value="Document">Documents</option>
            <option value="Financial">Financial</option>
          </select>
          <select 
            value={sortOrder} 
            onChange={e => setSortOrder(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-primary bg-white"
          >
            <option value="Newest">Newest First</option>
            <option value="Oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-500">Loading timeline...</div>
      ) : filteredActivities.length === 0 ? (
        <div className="text-center py-10 text-gray-500 bg-gray-50 rounded border border-dashed">
          <p>No activity found matching the criteria.</p>
        </div>
      ) : (
        <div className="relative pl-6 border-l-2 border-gray-100 space-y-8 ml-3">
          {filteredActivities.map((act) => {
            const isExpanded = expandedIds.has(act._id);
            const hasDetails = act.details && Object.values(act.details).some(v => v);

            return (
              <div key={act._id} className="relative">
                {/* Timeline Node */}
                <div className="absolute -left-[35px] bg-white p-1 rounded-full border shadow-sm">
                  {getIconForType(act.type)}
                </div>
                
                <div className="bg-white border rounded-lg shadow-sm overflow-hidden hover:border-gray-300 transition-colors">
                  <div 
                    className={`p-4 flex flex-col md:flex-row justify-between gap-4 ${hasDetails ? 'cursor-pointer hover:bg-gray-50' : ''}`}
                    onClick={() => hasDetails && toggleExpand(act._id)}
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={getBadgeVariant(act.type)}>{act.type}</Badge>
                        <span className="text-xs text-gray-500 font-medium">{new Date(act.date).toLocaleString()}</span>
                      </div>
                      <h4 className="font-bold text-gray-800 text-base">{act.title}</h4>
                      {act.description && <p className="text-sm text-gray-600 mt-1">{act.description}</p>}
                    </div>
                    
                    <div className="flex flex-col justify-start md:items-end text-sm">
                      <p className="text-gray-500 text-xs uppercase font-semibold">Performed By</p>
                      <p className="font-medium text-gray-800">{act.performedBy}</p>
                      {hasDetails && (
                        <button className="text-xs text-primary mt-2 flex items-center gap-1 font-medium hover:underline">
                          {isExpanded ? 'Show Less' : 'Show Details'}
                          <svg className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expanded Details Area */}
                  {isExpanded && hasDetails && (
                    <div className="bg-gray-50 p-4 border-t text-sm">
                      <div className="grid grid-cols-1 gap-3">
                        {Object.entries(act.details).map(([key, value]) => {
                          if (!value) return null;
                          // Format key from CamelCase to Spaced
                          const formattedKey = key.replace(/([A-Z])/g, ' $1').trim();
                          return (
                            <div key={key}>
                              <span className="font-semibold text-gray-700 block mb-0.5 text-xs uppercase tracking-wide">{formattedKey}</span>
                              <span className="text-gray-800 whitespace-pre-wrap">{value}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PatientActivityTimeline;
