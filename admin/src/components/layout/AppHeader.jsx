import React, { useContext, useState } from 'react';
import { assets } from '../../assets/assets';
import { DoctorContext } from '../../context/DoctorContext';
import { AdminContext } from '../../context/AdminContext';
import { useNavigate } from 'react-router-dom';
import NotificationsPanel from '../NotificationsPanel';

const AppHeader = ({ onMenuClick }) => {
  const { dToken, setDToken } = useContext(DoctorContext);
  const { aToken, setAToken } = useContext(AdminContext);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const navigate = useNavigate();
  const role = aToken ? 'Admin' : 'Doctor';

  const logout = () => {
    navigate('/login');
    if (dToken) {
      setDToken('');
      localStorage.removeItem('dToken');
    }
    if (aToken) {
      setAToken('');
      localStorage.removeItem('aToken');
    }
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (showProfileMenu) setShowProfileMenu(false);
  };

  const toggleProfileMenu = () => {
    setShowProfileMenu(!showProfileMenu);
    if (showNotifications) setShowNotifications(false);
  };

  return (
    <header className="flex justify-between items-center px-4 md:px-6 h-[73px] border-b bg-white flex-shrink-0 z-30">
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Menu */}
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="Open navigation menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>

        {/* Brand */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <img className="w-32 md:w-36" src={assets.admin_logo} alt="AIM Nature Cure Logo" />
          <span className="hidden sm:inline-block border px-2 py-0.5 rounded-full border-gray-300 text-gray-500 text-[10px] font-medium tracking-wide uppercase">
            {role}
          </span>
        </div>
      </div>
      
      <div className="flex items-center gap-2 sm:gap-4 relative">
        {/* Notifications */}
        <button 
          onClick={toggleNotifications} 
          className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="Notifications"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          </svg>
        </button>

        <NotificationsPanel isOpen={showNotifications} onClose={() => setShowNotifications(false)} />

        {/* User Profile Dropdown Toggle */}
        <button 
          onClick={toggleProfileMenu}
          className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center cursor-pointer overflow-hidden border border-primary/20 hover:shadow-md transition-shadow focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="User menu"
          aria-expanded={showProfileMenu}
        >
           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-primary">
            <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
          </svg>
        </button>

        {/* User Profile Dropdown Menu */}
        {showProfileMenu && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
            <div className="absolute right-0 top-12 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 sm:hidden">
                <p className="text-sm font-medium text-gray-900">{role} User</p>
                <p className="text-xs text-gray-500 truncate">user@aimnaturecure.com</p>
              </div>
              <div className="py-1">
                <button 
                  onClick={() => { navigate('/profile'); setShowProfileMenu(false); }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  My Profile
                </button>
                <button 
                  onClick={logout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
};

export default AppHeader;
