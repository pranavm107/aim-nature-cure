import React, { useContext, useState } from 'react'
import { assets } from '../assets/assets'
import { DoctorContext } from '../context/DoctorContext'
import { AdminContext } from '../context/AdminContext'
import { useNavigate } from 'react-router-dom'
import NotificationsPanel from './NotificationsPanel'

const Navbar = () => {
  const { dToken, setDToken } = useContext(DoctorContext)
  const { aToken, setAToken } = useContext(AdminContext)
  const [showNotifications, setShowNotifications] = useState(false)

  const navigate = useNavigate()

  const logout = () => {
    navigate('/login')
    dToken && setDToken('')
    dToken && localStorage.removeItem('dToken')
    aToken && setAToken('')
    aToken && localStorage.removeItem('aToken')
  }

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications)
  }

  return (
    <div className='flex justify-between items-center px-4 sm:px-10 py-3 border-b bg-white relative z-50'>
      <div className='flex items-center gap-2 text-xs'>
        <img onClick={() => navigate('/')} className='w-36 sm:w-40 cursor-pointer' src={assets.admin_logo} alt="Logo" />
        <p className='border px-2.5 py-0.5 rounded-full border-gray-500 text-gray-600'>{aToken ? 'Admin' : 'Doctor'}</p>
      </div>
      
      <div className='flex items-center gap-4 sm:gap-6'>
        <button 
          onClick={toggleNotifications} 
          className='relative p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors'
          title="Notifications"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          </svg>
        </button>

        <NotificationsPanel isOpen={showNotifications} onClose={() => setShowNotifications(false)} />

        <div onClick={() => navigate('/profile')} className='w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center cursor-pointer overflow-hidden border border-primary/20 hover:shadow-md transition-shadow'>
           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-primary">
            <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
          </svg>
        </div>

        <button onClick={logout} className='bg-primary text-white text-sm px-6 py-2 rounded-full hidden sm:block'>Logout</button>
      </div>
    </div>
  )
}

export default Navbar