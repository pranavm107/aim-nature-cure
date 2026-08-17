import React, { useContext, useState } from 'react'
import { assets } from '../assets/assets'
import { NavLink } from 'react-router-dom'
import { DoctorContext } from '../context/DoctorContext'
import { AdminContext } from '../context/AdminContext'

// Helper component for expandable sections
const SidebarSection = ({ title, children, defaultExpanded = true }) => {
  const [expanded, setExpanded] = useState(defaultExpanded)

  return (
    <div className='mb-4'>
      <div 
        className='flex items-center justify-between px-3 md:px-9 py-2 cursor-pointer text-gray-500 hover:text-gray-800 transition-colors'
        onClick={() => setExpanded(!expanded)}
      >
        <span className='text-xs font-semibold uppercase tracking-wider hidden md:block'>{title}</span>
        <span className='md:hidden block text-xs font-bold' title={title}>•••</span>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 20 20" 
          fill="currentColor" 
          className={`w-4 h-4 hidden md:block transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
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
  )
}

const SidebarLink = ({ to, icon, label }) => {
  return (
    <NavLink 
      to={to} 
      className={({ isActive }) => `flex items-center gap-3 py-3 px-3 md:px-9 md:min-w-72 cursor-pointer transition-colors ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary text-primary' : 'hover:bg-gray-50'}`}
      title={label}
    >
      <img className='min-w-5 opacity-70' src={icon} alt='' />
      <p className='hidden md:block'>{label}</p>
    </NavLink>
  )
}

const Sidebar = () => {
  const { dToken } = useContext(DoctorContext)
  const { aToken } = useContext(AdminContext)

  return (
    <div className='min-h-[calc(100vh-73px)] bg-white border-r pb-10 flex-shrink-0'>
      {aToken && (
        <div className='mt-5'>
          <SidebarSection title="Overview">
            <SidebarLink to='/admin-dashboard' icon={assets.home_icon} label='Dashboard' />
          </SidebarSection>
          
          <SidebarSection title="People">
            <SidebarLink to='/doctor-list' icon={assets.people_icon} label='Doctors List' />
            <SidebarLink to='/add-doctor' icon={assets.add_icon} label='Add Doctor' />
            <SidebarLink to='/admin/patients' icon={assets.people_icon} label='Patient List' />
            <SidebarLink to='/admin/users' icon={assets.people_icon} label='User Management' />
          </SidebarSection>
          
          <SidebarSection title="Operations">
            <SidebarLink to='/all-appointments' icon={assets.appointment_icon} label='Appointments (Legacy)' />
            <SidebarLink to='/admin/therapies' icon={assets.appointment_icon} label='Therapy Master' />
            <SidebarLink to='/admin/packages' icon={assets.appointment_icon} label='Package Master' />
            <SidebarLink to='/admin/follow-ups' icon={assets.appointment_icon} label='Follow-Up Overview' />
          </SidebarSection>
          
          <SidebarSection title="Financials">
            <SidebarLink to='/admin/invoices' icon={assets.appointment_icon} label='Invoice List' />
            <SidebarLink to='/admin/record-payment' icon={assets.appointment_icon} label='Record Payment' />
            <SidebarLink to='/admin/revenue' icon={assets.appointment_icon} label='Revenue Report' />
            <SidebarLink to='/admin/comparison' icon={assets.appointment_icon} label='Comparison Chart' />
            <SidebarLink to='/admin/incentive-config' icon={assets.appointment_icon} label='Incentive Config' />
            <SidebarLink to='/admin/incentive-approval' icon={assets.appointment_icon} label='Incentive Approval' />
          </SidebarSection>
          
          <SidebarSection title="Reports">
            <SidebarLink to='/admin/leads' icon={assets.appointment_icon} label='Lead Source Report' />
            <SidebarLink to='/admin/social-review' icon={assets.appointment_icon} label='Social Media Review' />
            <SidebarLink to='/admin/daily-reports' icon={assets.appointment_icon} label='Daily Report Review' />
            <SidebarLink to='/admin/reports' icon={assets.appointment_icon} label='General Reports' />
          </SidebarSection>
        </div>
      )}

      {dToken && (
        <div className='mt-5'>
          <SidebarSection title="Overview">
            <SidebarLink to='/doctor-dashboard' icon={assets.home_icon} label='Dashboard' />
            <SidebarLink to='/doctor/tasks' icon={assets.appointment_icon} label='My Tasks' />
          </SidebarSection>
          
          <SidebarSection title="Clinical">
            <SidebarLink to='/doctor/patients' icon={assets.people_icon} label='My Patients' />
            <SidebarLink to='/doctor/consultation' icon={assets.appointment_icon} label='New Consultation' />
            <SidebarLink to='/doctor/history' icon={assets.appointment_icon} label='Consultation History' />
            <SidebarLink to='/doctor/therapy-assignment' icon={assets.appointment_icon} label='Therapy Assignment' />
            <SidebarLink to='/doctor/therapy-sessions' icon={assets.appointment_icon} label='Therapy Sessions' />
            <SidebarLink to='/doctor-appointments' icon={assets.appointment_icon} label='Appointments (Legacy)' />
          </SidebarSection>
          
          <SidebarSection title="Follow-Ups">
            <SidebarLink to='/doctor/follow-ups' icon={assets.appointment_icon} label='Follow-Up List' />
          </SidebarSection>
          
          <SidebarSection title="Financials">
            <SidebarLink to='/doctor/revenue' icon={assets.appointment_icon} label='My Revenue' />
            <SidebarLink to='/doctor/incentive' icon={assets.appointment_icon} label='My Incentive' />
          </SidebarSection>

          <SidebarSection title="Personal & Admin">
            <SidebarLink to='/doctor/social-submission' icon={assets.appointment_icon} label='Social Submission' />
            <SidebarLink to='/doctor/daily-report' icon={assets.appointment_icon} label='Daily Closing Report' />
            <SidebarLink to='/doctor/notes' icon={assets.appointment_icon} label='Personal Notes' />
          </SidebarSection>
        </div>
      )}
    </div>
  )
}

export default Sidebar