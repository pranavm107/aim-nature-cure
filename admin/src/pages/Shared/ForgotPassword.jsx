import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const onSubmitHandler = (event) => {
    event.preventDefault();
    // Mock functionality
    toast.success('Password reset link sent to ' + email);
    setTimeout(() => {
      navigate('/login');
    }, 2000);
  };

  return (
    <form onSubmit={onSubmitHandler} className='min-h-[80vh] flex items-center'>
      <div className='flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-[#5E5E5E] text-sm shadow-lg bg-white'>
        <p className='text-2xl font-semibold m-auto text-primary'>Forgot Password</p>
        <p className='text-xs text-center m-auto mb-3'>Enter your registered email address to receive a password reset link.</p>
        <div className='w-full'>
          <p>Email</p>
          <input 
            onChange={(e) => setEmail(e.target.value)} 
            value={email} 
            className='border border-[#DADADA] rounded w-full p-2 mt-1' 
            type="email" 
            required 
          />
        </div>
        <button className='bg-primary text-white w-full py-2 rounded-md text-base mt-2'>Send Reset Link</button>
        <p className='mt-2'>Remember your password? <span onClick={() => navigate('/login')} className='text-primary underline cursor-pointer'>Login here</span></p>
      </div>
    </form>
  );
};

export default ForgotPassword;
