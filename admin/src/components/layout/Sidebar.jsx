import React, { useContext, useState, useEffect } from 'react';
import { assets } from '../../assets/assets';
import { NavLink } from 'react-router-dom';
import { DoctorContext } from '../../context/DoctorContext';
import { AdminContext } from '../../context/AdminContext';

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
        <div className="flex justify-center py-2 text-gray-400">
          <span className="text-[10px] font-bold uppercase tracking-widest leading-none block border-b border-gray-200 w-8 pb-1 text-center" title={title}>•••</span>
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
        className='flex items-center justify-between px-4 md:px-6 py-2 cursor-pointer text-gray-500 hover:text-gray-800 transition-colors'
        onClick={() => setExpanded(!expanded)}
      >
        <span className='text-xs font-semibold uppercase tracking-wider'>{title}</span>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 20 20" 
          fill="currentColor" 
          className={`w-4 h-4 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
        >
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
        </svg>
      </div>
      <div className={`overflow-hidden transition-all duration-300 ${expanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <ul className='text-[#515151]'>
          {children}
        </ul>
      </div>
    </div>
  );
};

const SidebarLink = ({ to, icon, label, isCollapsed = false, onClick }) => {
  return (
    <li>
      <NavLink 
        to={to} 
        onClick={onClick}
        className={({ isActive }) => `
          flex items-center gap-3 py-3 px-4 md:px-6 cursor-pointer transition-colors
          ${isCollapsed ? 'justify-center md:px-2 min-w-0 w-12 h-12 mx-auto rounded-xl mb-1' : ''}
          ${isActive 
            ? (isCollapsed ? 'bg-primary/10 text-primary' : 'bg-[#F2F3FF] border-r-4 border-primary text-primary') 
            : 'hover:bg-gray-50'
          }
        `}
        title={isCollapsed ? label : undefined}
      >
        <img className={`min-w-5 opacity-70 ${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'}`} src={icon} alt='' />
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
        <SidebarLink to='/admin-dashboard' icon={assets.home_icon} label='Dashboard' isCollapsed={isCollapsed} onClick={onClose} />
      </SidebarSection>
      
      <SidebarSection title="People" isCollapsed={isCollapsed}>
        <SidebarLink to='/doctor-list' icon={assets.people_icon} label='Doctors' isCollapsed={isCollapsed} onClick={onClose} />
        <SidebarLink to='/add-doctor' icon={assets.add_icon} label='Add Doctor' isCollapsed={isCollapsed} onClick={onClose} />
        <SidebarLink to='/patients' icon={assets.people_icon} label='Patients' isCollapsed={isCollapsed} onClick={onClose} />
        <SidebarLink to='/admin/users' icon={assets.people_icon} label='User Mgmt' isCollapsed={isCollapsed} onClick={onClose} />
      </SidebarSection>
      
      <SidebarSection title="Operations" isCollapsed={isCollapsed}>
        <SidebarLink to='/all-appointments' icon={assets.appointment_icon} label='Appointments' isCollapsed={isCollapsed} onClick={onClose} />
        <SidebarLink to='/admin/therapies' icon={assets.appointment_icon} label='Therapies' isCollapsed={isCollapsed} onClick={onClose} />
        <SidebarLink to='/admin/packages' icon={assets.appointment_icon} label='Packages' isCollapsed={isCollapsed} onClick={onClose} />
        <SidebarLink to='/admin/follow-ups' icon={assets.appointment_icon} label='Follow-Ups' isCollapsed={isCollapsed} onClick={onClose} />
      </SidebarSection>
      
      <SidebarSection title="Financials" isCollapsed={isCollapsed}>
        <SidebarLink to='/admin/invoices' icon={assets.appointment_icon} label='Invoices' isCollapsed={isCollapsed} onClick={onClose} />
        <SidebarLink to='/admin/record-payment' icon={assets.appointment_icon} label='Payments' isCollapsed={isCollapsed} onClick={onClose} />
        <SidebarLink to='/admin/revenue' icon={assets.appointment_icon} label='Revenue' isCollapsed={isCollapsed} onClick={onClose} />
        <SidebarLink to='/admin/comparison' icon={assets.appointment_icon} label='Comparisons' isCollapsed={isCollapsed} onClick={onClose} />
        <SidebarLink to='/admin/incentive-config' icon={assets.appointment_icon} label='Incentive Config' isCollapsed={isCollapsed} onClick={onClose} />
        <SidebarLink to='/admin/incentive-approval' icon={assets.appointment_icon} label='Incentive Approval' isCollapsed={isCollapsed} onClick={onClose} />
      </SidebarSection>
      
      <SidebarSection title="Reports" isCollapsed={isCollapsed}>
        <SidebarLink to='/admin/leads' icon={assets.appointment_icon} label='Lead Sources' isCollapsed={isCollapsed} onClick={onClose} />
        <SidebarLink to='/admin/social-review' icon={assets.appointment_icon} label='Social Media' isCollapsed={isCollapsed} onClick={onClose} />
        <SidebarLink to='/admin/daily-reports' icon={assets.appointment_icon} label='Daily Reports' isCollapsed={isCollapsed} onClick={onClose} />
        <SidebarLink to='/admin/reports' icon={assets.appointment_icon} label='General Reports' isCollapsed={isCollapsed} onClick={onClose} />
      </SidebarSection>
    </div>
  );

  const doctorNav = (
    <div className="mt-4 pb-20">
      <SidebarSection title="Overview" isCollapsed={isCollapsed}>
        <SidebarLink to='/doctor-dashboard' icon={assets.home_icon} label='Dashboard' isCollapsed={isCollapsed} onClick={onClose} />
        <SidebarLink to='/doctor/tasks' icon={assets.appointment_icon} label='My Tasks' isCollapsed={isCollapsed} onClick={onClose} />
      </SidebarSection>
      
      <SidebarSection title="Clinical" isCollapsed={isCollapsed}>
        <SidebarLink to='/patients' icon={assets.people_icon} label='My Patients' isCollapsed={isCollapsed} onClick={onClose} />
        <SidebarLink to='/doctor/consultation' icon={assets.appointment_icon} label='New Consultation' isCollapsed={isCollapsed} onClick={onClose} />
        <SidebarLink to='/doctor/history' icon={assets.appointment_icon} label='Consultation History' isCollapsed={isCollapsed} onClick={onClose} />
        <SidebarLink to='/doctor/therapy-assignment' icon={assets.appointment_icon} label='Therapy Assignment' isCollapsed={isCollapsed} onClick={onClose} />
        <SidebarLink to='/doctor/therapy-sessions' icon={assets.appointment_icon} label='Therapy Sessions' isCollapsed={isCollapsed} onClick={onClose} />
        <SidebarLink to='/doctor-appointments' icon={assets.appointment_icon} label='Appointments' isCollapsed={isCollapsed} onClick={onClose} />
      </SidebarSection>
      
      <SidebarSection title="Follow-Ups" isCollapsed={isCollapsed}>
        <SidebarLink to='/doctor/follow-ups' icon={assets.appointment_icon} label='Follow-Up List' isCollapsed={isCollapsed} onClick={onClose} />
      </SidebarSection>
      
      <SidebarSection title="Financials" isCollapsed={isCollapsed}>
        <SidebarLink to='/doctor/revenue' icon={assets.appointment_icon} label='My Revenue' isCollapsed={isCollapsed} onClick={onClose} />
        <SidebarLink to='/doctor/incentive' icon={assets.appointment_icon} label='My Incentive' isCollapsed={isCollapsed} onClick={onClose} />
      </SidebarSection>

      <SidebarSection title="Personal" isCollapsed={isCollapsed}>
        <SidebarLink to='/doctor/social-submission' icon={assets.appointment_icon} label='Social Submission' isCollapsed={isCollapsed} onClick={onClose} />
        <SidebarLink to='/doctor/daily-report' icon={assets.appointment_icon} label='Daily Closing Report' isCollapsed={isCollapsed} onClick={onClose} />
        <SidebarLink to='/doctor/notes' icon={assets.appointment_icon} label='Personal Notes' isCollapsed={isCollapsed} onClick={onClose} />
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
          bg-white border-r border-gray-200
          transition-all duration-300 ease-in-out
          flex flex-col
          ${isCollapsed ? 'lg:w-[80px]' : 'w-[260px]'}
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Mobile Header (Only visible on mobile drawer) */}
        <div className="h-[73px] flex items-center justify-between px-4 border-b lg:hidden flex-shrink-0">
          <img className="w-32" src={assets.admin_logo} alt="AIM Nature Cure Logo" />
          <button 
            onClick={onClose}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
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
