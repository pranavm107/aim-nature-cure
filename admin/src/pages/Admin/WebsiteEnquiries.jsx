import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { 
  Globe, Search, RefreshCw, Phone, Mail, MessageSquare, ExternalLink, 
  Eye, CheckCircle2, Clock, Calendar, AlertCircle,
  ChevronRight, ShieldCheck, HelpCircle
} from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/layout/PageHeader';
import Modal from '../../components/common/Modal';
import websiteEnquiryService from '../../services/websiteEnquiryService';

// Status styling definitions
const STATUS_CONFIG = {
  NEW: {
    label: 'New',
    badgeVariant: 'primary',
    bgClass: 'bg-blue-50 text-blue-700 border-blue-200',
    dotClass: 'bg-blue-500'
  },
  CONTACTED: {
    label: 'Contacted',
    badgeVariant: 'warning',
    bgClass: 'bg-amber-50 text-amber-700 border-amber-200',
    dotClass: 'bg-amber-500'
  },
  CONFIRMED: {
    label: 'Confirmed',
    badgeVariant: 'success',
    bgClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dotClass: 'bg-emerald-500'
  },
  CANCELLED: {
    label: 'Cancelled',
    badgeVariant: 'danger',
    bgClass: 'bg-rose-50 text-rose-700 border-rose-200',
    dotClass: 'bg-rose-500'
  }
};


const WebsiteEnquiries = () => {
  // Data state
  const [enquiries, setEnquiries] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter & Pagination state
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);

  // Summary counts
  const [summary, setSummary] = useState({
    total: 0,
    newCount: 0,
    contactedCount: 0,
    confirmedCount: 0
  });

  // Modals state
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);
  const [statusConfirmModal, setStatusConfirmModal] = useState({
    isOpen: false,
    enquiry: null,
    newStatus: ''
  });
  const [whatsAppConfirmModal, setWhatsAppConfirmModal] = useState({
    isOpen: false,
    enquiry: null
  });

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(0);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch summary counts for the tabs/cards
  const loadSummary = useCallback(async () => {
    try {
      const res = await websiteEnquiryService.getEnquirySummary();
      if (res.success) {
        setSummary({
          total: res.total,
          newCount: res.newCount,
          contactedCount: res.contactedCount,
          confirmedCount: res.confirmedCount
        });
      }
    } catch (err) {
      console.error('Failed to load summary counts', err);
    }
  }, []);

  // Fetch enquiries list
  const loadEnquiries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await websiteEnquiryService.getEnquiries({
        page,
        size,
        status: statusFilter === 'ALL' ? '' : statusFilter,
        search: debouncedSearch
      });

      if (res.success) {
        setEnquiries(res.enquiries || []);
        setTotalElements(res.totalElements || 0);
        setTotalPages(res.totalPages || 0);
      } else {
        setError(res.message || 'Failed to fetch website enquiries');
        toast.error(res.message || 'Failed to fetch website enquiries');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Error connecting to backend';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [page, size, statusFilter, debouncedSearch]);

  // Load data on query changes
  useEffect(() => {
    loadEnquiries();
  }, [loadEnquiries]);

  // Load summary on mount
  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  const handleRefresh = () => {
    loadEnquiries();
    loadSummary();
    toast.info('Refreshing website enquiries...');
  };

  // Format date helper
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  // Format timestamp helper
  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return '—';
    try {
      const d = new Date(dateTimeStr);
      if (isNaN(d.getTime())) return dateTimeStr;
      return d.toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return dateTimeStr;
    }
  };

  // Sanitize phone number for WhatsApp URL
  const sanitizePhoneForWhatsApp = (phone) => {
    if (!phone) return '';
    let digits = phone.replace(/[^0-9]/g, '');
    if (digits.length === 10) {
      digits = '91' + digits;
    }
    return digits;
  };

  // Open Details Modal
  const handleOpenDetails = (item) => {
    setSelectedEnquiry(item);
    setIsDetailsOpen(true);
  };

  // Request status change (prompts confirmation for critical statuses)
  const handleRequestStatusChange = (enquiry, targetStatus) => {
    if (!enquiry || !targetStatus || enquiry.status === targetStatus) return;

    if (targetStatus === 'CONFIRMED' || targetStatus === 'CANCELLED') {
      setStatusConfirmModal({
        isOpen: true,
        enquiry,
        newStatus: targetStatus
      });
    } else {
      executeStatusUpdate(enquiry.id, targetStatus);
    }
  };

  // Execute status update API
  const executeStatusUpdate = async (id, newStatus) => {
    setUpdatingStatusId(id);
    try {
      const res = await websiteEnquiryService.updateEnquiryStatus(id, newStatus);
      if (res.success) {
        toast.success(`Enquiry status updated to ${newStatus}`);
        
        // Update local items immediately
        setEnquiries((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status: newStatus, updatedAt: new Date().toISOString() } : item))
        );

        if (selectedEnquiry && selectedEnquiry.id === id) {
          setSelectedEnquiry((prev) => ({ ...prev, status: newStatus, updatedAt: new Date().toISOString() }));
        }

        // Refresh counts
        loadSummary();
      } else {
        toast.error(res.message || 'Failed to update enquiry status');
      }
    } catch (err) {
      toast.error('Error updating enquiry status');
    } finally {
      setUpdatingStatusId(null);
      setStatusConfirmModal({ isOpen: false, enquiry: null, newStatus: '' });
    }
  };

  // Request manual WhatsApp verification
  const handleRequestWhatsAppVerification = (enquiry) => {
    if (!enquiry) return;
    setWhatsAppConfirmModal({
      isOpen: true,
      enquiry
    });
  };

  // Execute manual WhatsApp verification API
  const executeWhatsAppVerification = async () => {
    const enquiry = whatsAppConfirmModal.enquiry;
    if (!enquiry) return;

    setUpdatingStatusId(enquiry.id);
    try {
      const res = await websiteEnquiryService.updateWhatsAppStatus(enquiry.id, 'MESSAGE_RECEIVED');
      if (res.success) {
        toast.success('WhatsApp status marked as MESSAGE_RECEIVED');
        
        // Update local state immediately
        setEnquiries((prev) =>
          prev.map((item) =>
            item.id === enquiry.id
              ? { ...item, whatsappStatus: 'MESSAGE_RECEIVED', updatedAt: new Date().toISOString() }
              : item
          )
        );

        if (selectedEnquiry && selectedEnquiry.id === enquiry.id) {
          setSelectedEnquiry((prev) => ({
            ...prev,
            whatsappStatus: 'MESSAGE_RECEIVED',
            updatedAt: new Date().toISOString()
          }));
        }
      } else {
        toast.error(res.message || 'Failed to update WhatsApp status');
      }
    } catch (err) {
      toast.error('Error updating WhatsApp status');
    } finally {
      setUpdatingStatusId(null);
      setWhatsAppConfirmModal({ isOpen: false, enquiry: null });
    }
  };

  // Helper to extract email if embedded in message (e.g. "Email: user@example.com")
  const extractEmailAndCleanMessage = (rawMessage, rawEmail) => {
    if (rawEmail) return { email: rawEmail, cleanMessage: rawMessage || '' };
    if (!rawMessage) return { email: null, cleanMessage: '' };

    const emailRegex = /email:\s*([^\s,;]+@[^\s,;]+)/i;
    const match = rawMessage.match(emailRegex);
    if (match) {
      const email = match[1];
      const cleanMessage = rawMessage.replace(match[0], '').trim();
      return { email, cleanMessage };
    }
    return { email: null, cleanMessage: rawMessage };
  };

  return (
    <PageContainer>
      {/* Header with Title and Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
        <PageHeader 
          title="Website Enquiries" 
          subtitle="Manage prospective patient appointment enquiries received from the hospital website" 
        />
        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-sm transition-colors disabled:opacity-60"
            title="Refresh website enquiries"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-primary' : 'text-slate-500'}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div 
          onClick={() => { setStatusFilter('ALL'); setPage(0); }}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${statusFilter === 'ALL' ? 'bg-primary/5 border-primary shadow-sm' : 'bg-white border-slate-200 hover:border-slate-300'}`}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Enquiries</p>
            <Globe className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-bold text-slate-800 mt-2">{summary.total}</p>
          <p className="text-[11px] text-slate-400 mt-1">All website submissions</p>
        </div>

        <div 
          onClick={() => { setStatusFilter('NEW'); setPage(0); }}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${statusFilter === 'NEW' ? 'bg-blue-50 border-blue-400 shadow-sm' : 'bg-white border-slate-200 hover:border-blue-200'}`}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">New</p>
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
          </div>
          <p className="text-2xl font-bold text-slate-800 mt-2">{summary.newCount}</p>
          <p className="text-[11px] text-slate-400 mt-1">Awaiting initial contact</p>
        </div>

        <div 
          onClick={() => { setStatusFilter('CONTACTED'); setPage(0); }}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${statusFilter === 'CONTACTED' ? 'bg-amber-50 border-amber-400 shadow-sm' : 'bg-white border-slate-200 hover:border-amber-200'}`}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Contacted</p>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          </div>
          <p className="text-2xl font-bold text-slate-800 mt-2">{summary.contactedCount}</p>
          <p className="text-[11px] text-slate-400 mt-1">Staff in communication</p>
        </div>

        <div 
          onClick={() => { setStatusFilter('CONFIRMED'); setPage(0); }}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${statusFilter === 'CONFIRMED' ? 'bg-emerald-50 border-emerald-400 shadow-sm' : 'bg-white border-slate-200 hover:border-emerald-200'}`}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Confirmed</p>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-slate-800 mt-2">{summary.confirmedCount}</p>
          <p className="text-[11px] text-slate-400 mt-1">Ready for appointment</p>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 mb-6 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 custom-scrollbar">
          {[
            { id: 'ALL', label: 'All' },
            { id: 'NEW', label: 'New' },
            { id: 'CONTACTED', label: 'Contacted' },
            { id: 'CONFIRMED', label: 'Confirmed' },
            { id: 'CANCELLED', label: 'Cancelled' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setStatusFilter(tab.id); setPage(0); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                statusFilter === tab.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Page Size */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          <select
            value={size}
            onChange={(e) => { setSize(Number(e.target.value)); setPage(0); }}
            className="border border-slate-200 rounded-lg px-2.5 py-2 text-xs text-slate-600 focus:outline-none focus:ring-1 focus:ring-primary"
            title="Items per page"
          >
            <option value="10">10 / page</option>
            <option value="25">25 / page</option>
            <option value="50">50 / page</option>
          </select>
        </div>
      </div>

      {/* Main Table or Error / Empty states */}
      {error && !loading && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-6 text-center text-rose-700 mb-6">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
          <h4 className="font-semibold text-sm">Failed to Load Enquiries</h4>
          <p className="text-xs text-rose-600 mt-1">{error}</p>
          <button
            onClick={loadEnquiries}
            className="mt-3 px-4 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-medium hover:bg-rose-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Main Table Card */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden mb-4">
        {/* Desktop & Tablet Table View */}
        <div className="hidden md:block overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[1100px]">
            <thead>
              <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-600 text-[11px] font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-4 w-24">Enquiry ID</th>
                <th className="py-3.5 px-4 min-w-[150px]">Name</th>
                <th className="py-3.5 px-4 min-w-[130px]">Phone Number</th>
                <th className="py-3.5 px-4 min-w-[130px]">Appointment Date</th>
                <th className="py-3.5 px-4 min-w-[110px]">Preferred Time</th>
                <th className="py-3.5 px-4 min-w-[130px]">Service</th>
                <th className="py-3.5 px-4 min-w-[180px]">Message</th>
                <th className="py-3.5 px-4 min-w-[130px]">Enquiry Status</th>
                <th className="py-3.5 px-4 min-w-[130px]">WhatsApp Status</th>
                <th className="py-3.5 px-4 min-w-[150px]">Created At</th>
                <th className="py-3.5 px-4 w-24 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan="11" className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-primary" />
                      <p className="text-sm font-medium text-slate-600">Loading website enquiries...</p>
                    </div>
                  </td>
                </tr>
              ) : enquiries.length === 0 ? (
                <tr>
                  <td colSpan="11" className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Globe className="w-10 h-10 text-slate-300" />
                      <p className="font-semibold text-slate-700 text-sm">No website appointment enquiries found</p>
                      <p className="text-xs text-slate-400">There are no enquiries matching the selected filter or search query.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                enquiries.map((item, index) => {
                  const statusCfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.NEW;
                  const isWhatsAppVerified = item.whatsappStatus === 'MESSAGE_RECEIVED';
                  const waPhone = sanitizePhoneForWhatsApp(item.phoneNumber);
                  const { email, cleanMessage } = extractEmailAndCleanMessage(item.message, item.email);
                  const shortId = item.id ? item.id.slice(0, 8) : `#${(page * size) + index + 1}`;

                  return (
                    <tr
                      key={item.id || index}
                      onClick={() => handleOpenDetails(item)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer text-slate-700 group"
                    >
                      {/* Enquiry ID */}
                      <td className="py-3.5 px-4 font-mono text-xs whitespace-nowrap">
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium" title={item.id}>
                          {shortId}
                        </span>
                      </td>

                      {/* Name */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-900 text-sm group-hover:text-primary transition-colors">
                          {item.name || 'Anonymous'}
                        </div>
                        {email && (
                          <div className="text-[11px] text-slate-400 truncate max-w-[160px]">{email}</div>
                        )}
                      </td>

                      {/* Phone Number */}
                      <td className="py-3.5 px-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        {item.phoneNumber ? (
                          <a
                            href={`tel:${item.phoneNumber}`}
                            className="inline-flex items-center gap-1.5 text-xs text-slate-700 hover:text-primary transition-colors font-medium"
                            title="Call phone number"
                          >
                            <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{item.phoneNumber}</span>
                          </a>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* Appointment Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap font-medium text-slate-800">
                        {formatDate(item.appointmentDate)}
                      </td>

                      {/* Preferred Time */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-semibold uppercase tracking-wider">
                          {item.preferredTime || 'Any Time'}
                        </span>
                      </td>

                      {/* Service */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {item.service || 'General Enquiry'}
                        </span>
                      </td>

                      {/* Message preview */}
                      <td className="py-3.5 px-4 max-w-[220px]">
                        <p className="text-slate-600 truncate" title={cleanMessage || item.message || 'No additional message'}>
                          {cleanMessage || item.message || <span className="text-slate-400 italic">No notes</span>}
                        </p>
                      </td>

                      {/* Enquiry Status Dropdown */}
                      <td className="py-3.5 px-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={item.status || 'NEW'}
                          disabled={updatingStatusId === item.id}
                          onChange={(e) => handleRequestStatusChange(item, e.target.value)}
                          className={`text-xs font-semibold rounded-lg px-2.5 py-1.5 border transition-colors cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary shadow-xs ${statusCfg.bgClass}`}
                        >
                          <option value="NEW">New</option>
                          <option value="CONTACTED">Contacted</option>
                          <option value="CONFIRMED">Confirmed</option>
                          <option value="CANCELLED">Cancelled</option>
                        </select>
                      </td>

                      {/* WhatsApp Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        {isWhatsAppVerified ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Verified</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleRequestWhatsAppVerification(item)}
                            title="Click to manually verify WhatsApp message receipt"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 border border-slate-200 transition-colors"
                          >
                            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                            <span>Not Verified</span>
                          </button>
                        )}
                      </td>

                      {/* Created At */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-500">
                        <span>{formatDateTime(item.createdAt)}</span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenDetails(item)}
                            className="p-1.5 text-slate-500 hover:text-primary hover:bg-slate-100 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {waPhone && (
                            <a
                              href={`https://wa.me/${waPhone}?text=${encodeURIComponent(`Hello ${item.name || ''}, greetings from AIM Nature Cure Hospital regarding your appointment enquiry.`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="Open WhatsApp Chat"
                            >
                              <MessageSquare className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View (< md) */}
        <div className="md:hidden flex flex-col divide-y divide-slate-100">
          {loading ? (
            <div className="p-8 text-center text-slate-400">
              <RefreshCw className="w-6 h-6 animate-spin text-primary mx-auto mb-2" />
              <p className="text-sm font-medium">Loading enquiries...</p>
            </div>
          ) : enquiries.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <Globe className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="font-semibold text-slate-600 text-sm">No website enquiries found</p>
            </div>
          ) : (
            enquiries.map((item, index) => {
              const statusCfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.NEW;
              const isWhatsAppVerified = item.whatsappStatus === 'MESSAGE_RECEIVED';
              const waPhone = sanitizePhoneForWhatsApp(item.phoneNumber);
              const { email, cleanMessage } = extractEmailAndCleanMessage(item.message, item.email);

              return (
                <div
                  key={item.id || index}
                  onClick={() => handleOpenDetails(item)}
                  className="p-4 bg-white hover:bg-slate-50/60 transition-colors flex flex-col gap-3 cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                          #{(page * size) + index + 1}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${statusCfg.bgClass}`}>
                          {statusCfg.label}
                        </span>
                        {isWhatsAppVerified && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>WA Verified</span>
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-semibold text-slate-900 mt-1">{item.name || 'Anonymous'}</h3>
                      {email && (
                        <p className="text-xs text-slate-500 mt-0.5">{email}</p>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 whitespace-nowrap">
                      {formatDate(item.createdAt)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Appointment</span>
                      <span className="font-medium text-slate-800">{formatDate(item.appointmentDate)}</span>
                      <span className="block text-slate-500 text-[10px] uppercase font-medium">{item.preferredTime || 'Any Time'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Service</span>
                      <span className="font-medium text-slate-800">{item.service || 'General Enquiry'}</span>
                    </div>
                  </div>

                  {cleanMessage && (
                    <p className="text-xs text-slate-600 italic bg-slate-50/50 p-2 rounded border border-slate-100 line-clamp-2">
                      &ldquo;{cleanMessage}&rdquo;
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-2">
                      {item.phoneNumber && (
                        <a
                          href={`tel:${item.phoneNumber}`}
                          className="px-2.5 py-1.5 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg inline-flex items-center gap-1.5 text-xs font-medium transition-colors"
                        >
                          <Phone className="w-3.5 h-3.5 text-slate-500" />
                          <span>Call</span>
                        </a>
                      )}
                      {waPhone && (
                        <a
                          href={`https://wa.me/${waPhone}?text=${encodeURIComponent(`Hello ${item.name || ''}, greetings from AIM Nature Cure Hospital.`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1.5 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg inline-flex items-center gap-1.5 text-xs font-medium transition-colors"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                          <span>WhatsApp</span>
                        </a>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenDetails(item)}
                      className="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-medium hover:bg-primary/90 inline-flex items-center gap-1 transition-colors"
                    >
                      <span>Details</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Pagination Controls */}
      {totalElements > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-xl border border-slate-200 mt-4 gap-3 shadow-sm">
          <span className="text-xs text-slate-500">
            Showing <span className="font-semibold text-slate-700">{(page * size) + 1}</span> to{' '}
            <span className="font-semibold text-slate-700">{Math.min((page + 1) * size, totalElements)}</span> of{' '}
            <span className="font-semibold text-slate-700">{totalElements}</span> enquiries
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={page === 0 || loading}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <span className="text-xs text-slate-500 px-2">
              Page {page + 1} of {Math.max(1, totalPages)}
            </span>
            <button
              disabled={(page + 1) * size >= totalElements || loading}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Enquiry Details Modal */}
      {isDetailsOpen && selectedEnquiry && (
        <Modal
          isOpen={isDetailsOpen}
          onClose={() => setIsDetailsOpen(false)}
          title="Website Appointment Enquiry Details"
          footer={
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Current Status:</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${(STATUS_CONFIG[selectedEnquiry.status] || STATUS_CONFIG.NEW).bgClass}`}>
                  {selectedEnquiry.status}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsDetailsOpen(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Close
              </button>
            </div>
          }
        >
          <div className="space-y-5 text-sm">
            {/* Top Identity Block */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <span className="text-[11px] font-mono text-slate-400">ID: {selectedEnquiry.id}</span>
                <h2 className="text-lg font-bold text-slate-900 mt-0.5">{selectedEnquiry.name || 'Anonymous'}</h2>
                <div className="flex items-center gap-3 mt-1.5">
                  <a
                    href={`tel:${selectedEnquiry.phoneNumber}`}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 hover:text-primary transition-colors bg-white px-2.5 py-1 rounded-md border border-slate-200 shadow-sm"
                  >
                    <Phone className="w-3.5 h-3.5 text-primary" />
                    <span>{selectedEnquiry.phoneNumber}</span>
                  </a>

                  {sanitizePhoneForWhatsApp(selectedEnquiry.phoneNumber) && (
                    <a
                      href={`https://wa.me/${sanitizePhoneForWhatsApp(selectedEnquiry.phoneNumber)}?text=${encodeURIComponent(`Hello ${selectedEnquiry.name || ''}, this is AIM Nature Cure Hospital regarding your appointment enquiry.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-50 transition-colors bg-white px-2.5 py-1 rounded-md border border-emerald-200 shadow-sm"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Chat on WhatsApp</span>
                      <ExternalLink className="w-3 h-3 text-emerald-400" />
                    </a>
                  )}
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">Enquiry Source</span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200 mt-1">
                  <Globe className="w-3 h-3 text-indigo-500" />
                  <span>{selectedEnquiry.source || 'WEBSITE'}</span>
                </span>
              </div>
            </div>

            {/* Grid of Key Metadata */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3 bg-white border border-slate-200 rounded-xl">
                <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">Appointment Date</span>
                <p className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  {formatDate(selectedEnquiry.appointmentDate)}
                </p>
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-xl">
                <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">Preferred Time</span>
                <p className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  {selectedEnquiry.preferredTime || 'Any Time'}
                </p>
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-xl">
                <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">Requested Service</span>
                <p className="text-sm font-semibold text-teal-800">
                  {selectedEnquiry.service || 'General Enquiry'}
                </p>
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-xl">
                <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">Created At</span>
                <p className="text-xs text-slate-600 font-medium">
                  {formatDateTime(selectedEnquiry.createdAt)}
                </p>
                {selectedEnquiry.updatedAt && (
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Updated: {formatDateTime(selectedEnquiry.updatedAt)}
                  </p>
                )}
              </div>
            </div>

            {/* Visitor Message */}
            <div>
              <span className="text-xs font-semibold text-slate-700 block mb-1.5">Visitor Message:</span>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                {selectedEnquiry.message ? (
                  selectedEnquiry.message
                ) : (
                  <span className="text-slate-400 italic">No additional message provided by visitor.</span>
                )}
              </div>
            </div>

            {/* Interactive Status Update Section */}
            <div className="border-t border-slate-200 pt-4">
              <span className="text-xs font-semibold text-slate-800 block mb-2">Update Workflow Status:</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { key: 'NEW', label: 'New', color: 'hover:border-blue-400 hover:bg-blue-50' },
                  { key: 'CONTACTED', label: 'Contacted', color: 'hover:border-amber-400 hover:bg-amber-50' },
                  { key: 'CONFIRMED', label: 'Confirmed', color: 'hover:border-emerald-400 hover:bg-emerald-50' },
                  { key: 'CANCELLED', label: 'Cancelled', color: 'hover:border-rose-400 hover:bg-rose-50' }
                ].map((st) => {
                  const isCurrent = selectedEnquiry.status === st.key;
                  return (
                    <button
                      key={st.key}
                      disabled={isCurrent || updatingStatusId === selectedEnquiry.id}
                      onClick={() => handleRequestStatusChange(selectedEnquiry, st.key)}
                      className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all text-center ${
                        isCurrent
                          ? 'bg-slate-900 text-white border-slate-900 cursor-default'
                          : `bg-white text-slate-700 border-slate-200 ${st.color} cursor-pointer`
                      } disabled:opacity-50`}
                    >
                      {st.label} {isCurrent && '✓'}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Manual WhatsApp Verification Section */}
            <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <h4 className="text-xs font-semibold text-emerald-900">WhatsApp Receipt Verification</h4>
                  </div>
                  <p className="text-[11px] text-emerald-700 mt-1 leading-normal">
                    Authorized manual action: Only verify after hospital staff confirms that an incoming message from this visitor was actually received in WhatsApp. Opening or chatting in WhatsApp does NOT auto-verify.
                  </p>
                </div>

                <div>
                  {selectedEnquiry.whatsappStatus === 'MESSAGE_RECEIVED' ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Verified</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      disabled={updatingStatusId === selectedEnquiry.id}
                      onClick={() => handleRequestWhatsAppVerification(selectedEnquiry)}
                      className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50 whitespace-nowrap"
                    >
                      Mark Message Received
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Confirmation Modal for Status Updates (CONFIRMED / CANCELLED) */}
      {statusConfirmModal.isOpen && (
        <Modal
          isOpen={statusConfirmModal.isOpen}
          onClose={() => setStatusConfirmModal({ isOpen: false, enquiry: null, newStatus: '' })}
          title={`Confirm Status Change: ${statusConfirmModal.newStatus}`}
          footer={
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setStatusConfirmModal({ isOpen: false, enquiry: null, newStatus: '' })}
                className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                No, Keep Current
              </button>
              <button
                type="button"
                disabled={updatingStatusId !== null}
                onClick={() => executeStatusUpdate(statusConfirmModal.enquiry.id, statusConfirmModal.newStatus)}
                className={`px-4 py-2 rounded-lg text-xs font-medium text-white transition-colors ${
                  statusConfirmModal.newStatus === 'CONFIRMED'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {updatingStatusId !== null ? 'Updating...' : `Yes, Mark as ${statusConfirmModal.newStatus}`}
              </button>
            </div>
          }
        >
          <div className="space-y-3 text-sm text-slate-600">
            <p>
              Are you sure you want to change the status of enquiry for{' '}
              <strong className="text-slate-900">{statusConfirmModal.enquiry?.name}</strong> to{' '}
              <strong className="text-slate-900">{statusConfirmModal.newStatus}</strong>?
            </p>
            {statusConfirmModal.newStatus === 'CONFIRMED' && (
              <p className="text-xs text-emerald-700 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                Note: This marks the enquiry as confirmed. Staff can then follow standard clinical scheduling procedures.
              </p>
            )}
            {statusConfirmModal.newStatus === 'CANCELLED' && (
              <p className="text-xs text-rose-700 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
                Note: This marks the visitor enquiry as cancelled.
              </p>
            )}
          </div>
        </Modal>
      )}

      {/* Confirmation Modal for Manual WhatsApp Verification */}
      {whatsAppConfirmModal.isOpen && (
        <Modal
          isOpen={whatsAppConfirmModal.isOpen}
          onClose={() => setWhatsAppConfirmModal({ isOpen: false, enquiry: null })}
          title="Verify WhatsApp Message Receipt"
          footer={
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setWhatsAppConfirmModal({ isOpen: false, enquiry: null })}
                className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={updatingStatusId !== null}
                onClick={executeWhatsAppVerification}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
              >
                {updatingStatusId !== null ? 'Verifying...' : 'Confirm Verification'}
              </button>
            </div>
          }
        >
          <div className="space-y-3 text-sm text-slate-600">
            <p>
              Please confirm that hospital staff has received and verified an incoming WhatsApp message from{' '}
              <strong className="text-slate-900">{whatsAppConfirmModal.enquiry?.name}</strong> ({whatsAppConfirmModal.enquiry?.phoneNumber}).
            </p>
            <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg text-xs text-amber-800">
              <strong>Staff Verification Policy:</strong> Do not verify if a WhatsApp message has not actually been received from this visitor.
            </div>
          </div>
        </Modal>
      )}
    </PageContainer>
  );
};

export default WebsiteEnquiries;
