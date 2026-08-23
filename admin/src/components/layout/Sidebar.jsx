import React, { useContext, useState, useEffect } from 'react';
import { assets } from '../../assets/assets';
import { NavLink } from 'react-router-dom';
import { DoctorContext } from '../../context/DoctorContext';
import { AdminContext } from '../../context/AdminContext';
import { 
  LayoutDashboard, Users, UserPlus, Calendar, Activity, 
  Package, Clock, Receipt, IndianRupee, LineChart, 
  Settings, CheckCircle, BarChart, FileText, CheckSquare, 
  Stethoscope, BookOpen, ChevronDown, MoreHorizontal, X
} from 'lucide-react';

// Helper component for expandable sections
const SidebarSection = ({ title, children, defaultExpanded = true, isCollapsed = false }) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  // Auto-collapse when sidebar collapses, restore when expands
  useEffect(() => {
    if (isCollapsed) {
      setExpanded(false);
    } else {
      setExpanded(defaultExpanded);
    }
  }, [isCollapsed, defaultExpanded]);

  if (isCollapsed) {
    return (
      <div className="mb-2">
        <div className="flex justify-center py-2 text-slate-400">
          <MoreHorizontal className="w-5 h-5 opacity-50" />
        </div>
        <ul className="flex flex-col items-center">
          {children}
        </ul>
      </div>
    );
  }

  return (
    <div className='mb-4'>
      <div 
        className='flex items-center justify-between px-4 md:px-6 py-2 cursor-pointer text-slate-500 hover:text-slate-800 transition-colors'
        onClick={() => setExpanded(!expanded)}
      >
        <span className='text-xs font-semibold uppercase tracking-wider'>{title}</span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
      </div>
      <div className={`overflow-hidden transition-all duration-300 ${expanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <ul className='text-[#515151]'>
          {children}
        </ul>
      </div>
    </div>
  );
};

const SidebarLink = ({ to, icon: Icon, label, isCollapsed = false, onClick }) => {
  return (
    <li>
      <NavLink 
        to={to} 
        onClick={onClick}
        className={({ isActive }) => `
          flex items-center gap-3 py-3 px-4 md:px-6 cursor-pointer transition-colors
          ${isCollapsed ? 'justify-center md:px-2 min-w-0 w-12 h-12 mx-auto rounded-xl mb-1' : ''}
          ${isActive 
            ? (isCollapsed ? 'bg-primary/10 text-primary' : 'bg-primary/10 border-r-4 border-primary text-primary') 
            : 'hover:bg-slate-50 text-slate-600'
          }
        `}
        title={isCollapsed ? label : undefined}
      >
        <Icon className={`flex-shrink-0 ${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'}`} strokeWidth={2} />
        {!isCollapsed && <p className='whitespace-nowrap text-sm font-medium'>{label}</p>}
      </NavLink>
    </li>
  );
};

const Sidebar = ({ isOpen, onClose }) => {
  const { dToken } = useContext(DoctorContext);
  const { aToken } = useContext(AdminContext);

  // Handle collapsed state (laptop screen 1024px-1279px)
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && window.innerWidth < 1280) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const adminNav = (
    <div className="mt-4 pb-20">
      <SidebarSection title="Overview" isCollapsed={isCollapsed}>
        <SidebarLink to='/admin-dashboard' icon={LayoutDashboard} label='Dashboard' isCollapsed={isCollapsed} onClick={onClose} />
      </SidebarSection>
      
      <SidebarSection title="People" isCollapsed={isCollapsed}>
        <SidebarLink to='/doctor-list' icon={Stethoscope} label='Doctors' isCollapsed={isCollapsed} onClick={onClose} />
        <SidebarLink to='/add-doctor' icon={UserPlus} label='Add Doctor' isCollapsed={isCollapsed} onClick={onClose} />
        <SidebarLink to='/patients' icon={Users} label='Patients' isCollapsed={isCollapsed} onClick={onClose} />
        <SidebarLink to='/admin/users' icon={Settings} label='User Mgmt' isCollapsed={isCollapsed} onClick={onClose} />
      </SidebarSection>
      
      <SidebarSection title="Operations" isCollapsed={isCollapsed}>
        <SidebarLink to='/all-appointments' icon={Calendar} label='Appointments' isCollapsed={isCollapsed} onClick={onClose} />
        <SidebarLink to='/admin/therapies' icon={Activity} label='Therapies' isCollapsed={isCollapsed} onClick={onClose} />
        <SidebarLink to='/admin/packages' icon={Package} label='Packages' isCollapsed={isCollapsed} onClick={onClose} />
        <SidebarLink to='/admin/follow-ups' icon={Clock} label='Follow-Ups' isCollapsed={isCollapsed} onClick={onClose} />
      </SidebarSection>
      
      <SidebarSection title="Financials" isCollapsed={isCollapsed}>
        <SidebarLink to='/admin/invoices' icon={Receipt} label='Invoices' isCollapsed={isCollapsed} onClick={onClose} />
        <SidebarLink to='/admin/record-payment' icon={IndianRupee} label='Payments' isCollapsed={isCollapsed} onClick={onClose} />
        <SidebarLink to='/admin/revenue' icon={LineChart} label='Revenue' isCollapsed={isCollapsed} onClick={onClose} />
        <SidebarLink to='/admin/comparison' icon={BarChart} label='Comparisons' isCollapsed={isCollapsed} onClick={onClose} />
        <SidebarLink to='/admin/incentive-config' icon={Settings} label='Incentive Config' isCollapsed={isCollapsed} onClick={onClose} />
        <SidebarLink to='/admin/incentive-approval' icon={CheckCircle} label='Incentive Approval' isCollapsed={isCollapsed} onClick={onClose} />
      </SidebarSection>
      
      <SidebarSection title="Reports" isCollapsed={isCollapsed}>
        <SidebarLink to='/admin/leads' icon={FileText} label='Lead Sources' isCollapsed={isCollapsed} onClick={onClose} />
        <SidebarLink to='/admin/social-review' icon={Users} label='Social Media' isCollapsed={isCollapsed} onClick={onClose} />
        <SidebarLink to='/admin/daily-reports' icon={FileText} label='Daily Reports' isCollapsed={isCollapsed} onClick={onClose} />
        <SidebarLink to='/admin/reports' icon={BarChart} label='General Reports' isCollapsed={isCollapsed} onClick={onClose} />
      </SidebarSection>
    </div>
  );

  const doctorNav = (
    <div className="mt-4 pb-20">
      <SidebarSection title="Overview" isCollapsed={isCollapsed}>
        <SidebarLink to='/doctor-dashboard' icon={LayoutDashboard} label='Dashboard' isCollapsed={isCollapsed} onClick={onClose} />
        <SidebarLink to='/doctor/tasks' icon={CheckSquare} label='My Tasks' isCollapsed={isCollapsed} onClick={onClose} />
      </SidebarSection>
      
      <SidebarSection title="Clinical" isCollapsed={isCollapsed}>
        <SidebarLink to='/patients' icon={Users} label='My Patients' isCollapsed={isCollapsed} onClick={onClose} />
        <SidebarLink to='/doctor/consultation' icon={Activity} label='New Consultation' isCollapsed={isCollapsed} onClick={onClose} />
        <SidebarLink to='/doctor/history' icon={FileText} label='Consultation History' isCollapsed={isCollapsed} onClick={onClose} />
        <SidebarLink to='/doctor/therapy-assignment' icon={Package} label='Therapy Assignment' isCollapsed={isCollapsed} onClick={onClose} />
        <SidebarLink to='/doctor/therapy-sessions' icon={CheckCircle} label='Therapy Sessions' isCollapsed={isCollapsed} onClick={onClose} />
      </SidebarSection>
      
      <SidebarSection title="Follow-Ups" isCollapsed={isCollapsed}>
        <SidebarLink to='/doctor/follow-ups' icon={Clock} label='Follow-Up List' isCollapsed={isCollapsed} onClick={onClose} />
      </SidebarSection>
      
      <SidebarSection title="Financials" isCollapsed={isCollapsed}>
        <SidebarLink to='/doctor/revenue' icon={IndianRupee} label='My Revenue' isCollapsed={isCollapsed} onClick={onClose} />
        <SidebarLink to='/doctor/incentive' icon={Receipt} label='My Incentive' isCollapsed={isCollapsed} onClick={onClose} />
      </SidebarSection>

      <SidebarSection title="Personal" isCollapsed={isCollapsed}>
        <SidebarLink to='/doctor/social-submission' icon={Users} label='Social Submission' isCollapsed={isCollapsed} onClick={onClose} />
        <SidebarLink to='/doctor/daily-report' icon={FileText} label='Daily Closing Report' isCollapsed={isCollapsed} onClick={onClose} />
        <SidebarLink to='/doctor/notes' icon={BookOpen} label='Personal Notes' isCollapsed={isCollapsed} onClick={onClose} />
      </SidebarSection>
    </div>
  );

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/50 z-40 lg:hidden transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          bg-white border-r border-slate-200
          transition-all duration-300 ease-in-out
          flex flex-col
          ${isCollapsed ? 'lg:w-[80px]' : 'w-[260px]'}
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Mobile Header (Only visible on mobile drawer) */}
        <div className="h-[73px] flex items-center justify-between px-4 border-b border-slate-200 lg:hidden flex-shrink-0">
          <img className="w-32" src={assets.admin_logo} alt="AIM Nature Cure Logo" />
          <button 
            onClick={onClose}
            className="p-2 text-slate-500 hover:bg-slate-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
          {aToken ? adminNav : dToken ? doctorNav : null}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
