import React, { useContext, useState } from 'react'
import { assets } from '../assets/assets'
import { DoctorContext } from '../context/DoctorContext'
import { AdminContext } from '../context/AdminContext'
import { useNavigate } from 'react-router-dom'
import NotificationsPanel from './NotificationsPanel'
import { Bell, User } from 'lucide-react'

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
    <div className='flex justify-between items-center px-4 sm:px-10 py-3 border-b border-slate-200 bg-white relative z-50'>
      <div className='flex items-center gap-3 text-xs'>
        <img onClick={() => navigate('/')} className='w-36 sm:w-40 cursor-pointer' src={assets.admin_logo} alt="Logo" />
        <p className='border px-2.5 py-0.5 rounded-full border-slate-300 bg-slate-50 text-slate-700 font-medium'>{aToken ? 'Admin' : 'Doctor'}</p>
      </div>
      
      <div className='flex items-center gap-4 sm:gap-6'>
        <button 
          onClick={toggleNotifications} 
          className='relative p-2 text-slate-500 hover:text-primary hover:bg-slate-50 rounded-full transition-colors'
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
        </button>

        <NotificationsPanel isOpen={showNotifications} onClose={() => setShowNotifications(false)} />

        <div onClick={() => navigate('/profile')} className='w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center cursor-pointer overflow-hidden border border-slate-200 hover:border-primary hover:text-primary text-slate-500 transition-colors'>
           <User className="w-5 h-5" />
        </div>

        <button onClick={logout} className='bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 shadow-sm text-sm font-medium px-5 py-1.5 rounded-md hidden sm:block transition-colors'>Logout</button>
      </div>
    </div>
  )
}

export default Navbar