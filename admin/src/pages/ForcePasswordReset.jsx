import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authService } from '../services/authService';
import { InputField, PrimaryButton } from '../components/common/FormFields';

const ForcePasswordReset = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    const email = localStorage.getItem('userEmail');
    if (!email) {
      toast.error("Session expired, please login again");
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.firstLoginPasswordReset(email, oldPassword, newPassword);
      if (res.success) {
        toast.success(res.message);
        // Clean up session and redirect to login
        localStorage.removeItem('aToken');
        localStorage.removeItem('dToken');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('mustChangePassword');
        navigate('/login');
      } else {
        toast.error(res.message || "Failed to reset password");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className='min-h-[80vh] flex items-center justify-center bg-slate-50'>
      <div className='flex flex-col gap-5 items-start p-8 min-w-[340px] sm:min-w-96 border border-slate-200 rounded-xl text-slate-600 text-sm shadow-xl bg-white'>
        <p className='text-2xl font-semibold m-auto text-primary text-center'>
          Welcome to AIM Nature Cure
        </p>
        <p className="text-center text-slate-500 mb-2">
          For security reasons, you must change your auto-generated password before accessing the system.
        </p>
        
        <form onSubmit={handleReset} className="w-full flex flex-col gap-4">
          <InputField 
            label="Current Password" 
            type="password" 
            value={oldPassword} 
            onChange={(e) => setOldPassword(e.target.value)} 
            required 
            className="w-full"
            placeholder="The password you just used to login"
          />
          
          <InputField 
            label="New Password" 
            type="password" 
            value={newPassword} 
            onChange={(e) => setNewPassword(e.target.value)} 
            required 
            className="w-full"
            placeholder="Enter new password"
          />
          
          <InputField 
            label="Confirm New Password" 
            type="password" 
            value={confirmPassword} 
            onChange={(e) => setConfirmPassword(e.target.value)} 
            required 
            className="w-full"
            placeholder="Confirm new password"
          />
          
          <PrimaryButton 
            type="submit" 
            className='w-full py-2 rounded-md text-base px-0 mt-2' 
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Set Password'}
          </PrimaryButton>
        </form>

        <button onClick={handleLogout} className="text-sm text-slate-400 hover:text-slate-600 underline mx-auto mt-2">
          Cancel and Logout
        </button>
      </div>
    </div>
  );
};

export default ForcePasswordReset;
