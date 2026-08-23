import React, { useContext, useEffect } from 'react';
import { DoctorContext } from '../../context/DoctorContext';
import { assets } from '../../assets/assets';
import { AppContext } from '../../context/AppContext';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/layout/PageHeader';
import { useNavigate } from 'react-router-dom';
import { Users, FileText, Clock, IndianRupee, ListChecks, X, Check } from 'lucide-react';

const DoctorDashboard = () => {

  const { dToken, dashData, getDashData, cancelAppointment, completeAppointment } = useContext(DoctorContext)
  const { slotDateFormat, currency } = useContext(AppContext)
  const navigate = useNavigate();

  useEffect(() => {
    if (dToken) {
      getDashData()
    }
  }, [dToken])

  return dashData && (
    <PageContainer>
      <PageHeader title="Doctor Dashboard" subtitle="Overview of your clinical and financial activities" />

      {/* Main KPI Grid */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
        <div className='flex items-center gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-lg transition-shadow cursor-pointer' onClick={() => navigate('/doctor/patients')}>
          <div className="bg-primary/10 p-3 rounded-full text-primary">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <p className='text-xl font-semibold text-slate-800'>{dashData.patients}</p>
            <p className='text-slate-500 text-sm'>My Patients</p>
          </div>
        </div>
        
        <div className='flex items-center gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-lg transition-shadow cursor-pointer' onClick={() => navigate('/doctor/history')}>
          <div className="bg-blue-50 p-3 rounded-full text-blue-500">
            <FileText className="w-8 h-8" />
          </div>
          <div>
            <p className='text-xl font-semibold text-slate-800'>{dashData.todayConsultations}</p>
            <p className='text-slate-500 text-sm'>Consultations</p>
          </div>
        </div>

        <div className='flex items-center gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-lg transition-shadow cursor-pointer' onClick={() => navigate('/doctor/follow-ups')}>
          <div className="bg-orange-50 p-3 rounded-full text-orange-500">
            <Clock className="w-8 h-8" />
          </div>
          <div>
            <p className='text-xl font-semibold text-slate-800'>{dashData.pendingFollowUps}</p>
            <p className='text-slate-500 text-sm'>Pending Follow-ups</p>
          </div>
        </div>

        <div className='flex items-center gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-lg transition-shadow cursor-pointer' onClick={() => navigate('/doctor/revenue')}>
          <div className="bg-emerald-50 p-3 rounded-full text-emerald-500">
            <IndianRupee className="w-8 h-8" />
          </div>
          <div>
            <p className='text-xl font-semibold text-slate-800'>{currency}{dashData.earnings}</p>
            <p className='text-slate-500 text-sm'>Today's Revenue</p>
          </div>
        </div>
      </div>

      {/* Secondary KPI Grid */}
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8'>
        <div className='bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center cursor-pointer hover:shadow-lg transition-shadow' onClick={() => navigate('/doctor/revenue')}>
          <div>
            <p className='text-slate-500 text-sm font-medium'>Monthly Revenue</p>
            <p className='text-2xl font-bold text-slate-800 mt-1'>{currency}{dashData.monthlyRevenue.toLocaleString()}</p>
          </div>
          <div className="bg-emerald-50 text-emerald-600 p-2 rounded-lg font-semibold text-sm">+12%</div>
        </div>

        <div className='bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center cursor-pointer hover:shadow-lg transition-shadow' onClick={() => navigate('/doctor/tasks')}>
          <div>
            <p className='text-slate-500 text-sm font-medium'>Pending Tasks</p>
            <p className='text-2xl font-bold text-slate-800 mt-1'>{dashData.pendingTasks}</p>
          </div>
          <div className="bg-amber-50 text-amber-600 p-2 rounded-lg font-semibold text-sm">Action Required</div>
        </div>

        <div className='bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center cursor-pointer hover:shadow-lg transition-shadow' onClick={() => navigate('/doctor/therapy-sessions')}>
          <div>
            <p className='text-slate-500 text-sm font-medium'>Active Therapy Sessions</p>
            <p className='text-2xl font-bold text-slate-800 mt-1'>{dashData.activeTherapySessions}</p>
          </div>
          <div className="bg-purple-50 text-purple-600 p-2 rounded-lg font-semibold text-sm">Ongoing</div>
        </div>
      </div>

      <div className='bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden'>
        <div className='flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50'>
          <div className="flex items-center gap-2.5">
            <ListChecks className="w-5 h-5 text-slate-500" />
            <p className='font-semibold text-slate-800'>Upcoming Appointments</p>
          </div>
          <button onClick={() => navigate('/doctor/appointments')} className="text-sm font-medium text-primary hover:underline">View All</button>
        </div>

        <div className='pt-2 pb-2'>
          {dashData.latestAppointments.length === 0 ? (
             <div className="p-8 text-center text-slate-500">No upcoming appointments</div>
          ) : (
            dashData.latestAppointments.map((item, index) => (
              <div className='flex items-center px-6 py-3 gap-4 hover:bg-slate-50 border-b border-slate-100 last:border-0 transition-colors' key={index}>
                <img className='rounded-full w-12 h-12 object-cover border border-slate-200' src={item.userData.image} alt="" />
                <div className='flex-1 text-sm'>
                  <p className='text-slate-800 font-semibold text-base'>{item.userData.name}</p>
                  <p className='text-slate-500 mt-0.5'>Date: <span className="font-medium text-slate-700">{slotDateFormat(item.slotDate)}</span></p>
                </div>
                {item.cancelled
                  ? <p className='text-red-500 text-sm font-medium bg-red-50 px-3 py-1 rounded-full'>Cancelled</p>
                  : item.isCompleted
                    ? <p className='text-emerald-600 text-sm font-medium bg-emerald-50 px-3 py-1 rounded-full'>Completed</p>
                    : <div className='flex gap-2'>
                      <button onClick={() => cancelAppointment(item._id)} className='w-10 h-10 flex items-center justify-center rounded-full hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors group' title="Cancel Appointment">
                        <X className="w-5 h-5" />
                      </button>
                      <button onClick={() => completeAppointment(item._id)} className='w-10 h-10 flex items-center justify-center rounded-full hover:bg-emerald-50 text-slate-400 hover:text-emerald-500 transition-colors group' title="Complete Appointment">
                        <Check className="w-5 h-5" />
                      </button>
                    </div>
                }
              </div>
            ))
          )}
        </div>
      </div>
    </PageContainer>
  )
}

export default DoctorDashboard