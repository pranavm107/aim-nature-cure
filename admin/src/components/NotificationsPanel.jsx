import React, { useState, useEffect, useContext } from 'react';
import { followUpService } from '../services/followUpService';
import { DoctorContext } from '../context/DoctorContext';
import { AdminContext } from '../context/AdminContext';
import { useNavigate } from 'react-router-dom';

const NotificationsPanel = ({ isOpen, onClose }) => {
  const { profileData, dToken } = useContext(DoctorContext);
  const { aToken } = useContext(AdminContext);
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      const fetchReminders = async () => {
        try {
          let followUps = [];
          if (dToken && profileData) {
            const res = await followUpService.getDoctorFollowUps(profileData._id);
            followUps = res.followUps;
          } else if (aToken) {
            const res = await followUpService.getAllFollowUps();
            followUps = res.followUps;
          }

          // Filter for pending follow-ups that are due soon (within 3 days) or overdue
          const now = Date.now();
          const threeDays = 3 * 24 * 60 * 60 * 1000;
          
          const urgent = followUps.filter(f => {
            if (f.status === 'Completed' || f.status === 'Cancelled') return false;
            const due = new Date(f.dueDate).getTime();
            return due - now <= threeDays;
          });

          setNotifications(urgent);
        } catch (err) {
          console.error("Error fetching notifications", err);
        }
      };
      
      fetchReminders();
    }
  }, [isOpen, dToken, aToken, profileData]);

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 z-40 bg-transparent"
        onClick={onClose}
      ></div>
      <div className="absolute top-14 right-4 sm:right-10 w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden flex flex-col max-h-[80vh]">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="text-lg font-semibold text-slate-800">Notifications</h3>
          <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full">{notifications.length}</span>
        </div>
        
        <div className="overflow-y-auto flex-1">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <p>No new notifications</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {notifications.map(n => (
                <li 
                  key={n._id} 
                  className="p-4 hover:bg-slate-50 transition-colors cursor-pointer"
                  onClick={() => {
                    navigate(dToken ? '/doctor/follow-ups' : '/admin/follow-ups');
                    onClose();
                  }}
                >
                  <p className="text-sm font-medium text-slate-800 mb-1">Follow-Up Reminder</p>
                  <p className="text-xs text-slate-600 mb-2">
                    Patient <span className="font-semibold text-primary">{n.patientName}</span> is due for a follow-up on {new Date(n.dueDate).toLocaleDateString()}.
                  </p>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${new Date(n.dueDate) < new Date() ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                    {new Date(n.dueDate) < new Date() ? 'Overdue' : 'Due Soon'}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        <div className="p-3 border-t border-slate-100 bg-slate-50 text-center shrink-0">
          <button className="text-sm text-primary hover:underline font-medium" onClick={onClose}>Close panel</button>
        </div>
      </div>
    </>
  );
};

export default NotificationsPanel;
