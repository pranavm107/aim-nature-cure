import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { InputField, PrimaryButton } from '../../components/common/FormFields';

import { authService } from '../../services/authService';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    setLoading(true);
    
    try {
      const res = await authService.forgotPassword(email);
      if (res.success) {
        toast.success(res.message);
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        toast.error(res.message || 'Failed to send reset link');
      }
    } catch (error) {
      toast.error('An error occurred');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmitHandler} className='min-h-[80vh] flex items-center px-4'>
      <div className='flex flex-col gap-5 m-auto items-start p-8 w-full max-w-md border rounded-xl text-[#5E5E5E] text-sm shadow-lg bg-white'>
        <p className='text-2xl font-semibold m-auto text-primary'>Forgot Password</p>
        <p className='text-xs text-center m-auto mb-3 text-gray-500'>Enter your registered email address to receive a password reset link.</p>
        <InputField 
          label="Email" 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
          className="w-full"
        />
        <PrimaryButton 
          type="submit" 
          className='w-full py-2.5 rounded-md text-base mt-2'
          disabled={loading}
        >
          {loading ? 'Sending...' : 'Send Reset Link'}
        </PrimaryButton>
        <p className='mt-2 m-auto text-sm'>Remember your password? <span onClick={() => navigate('/login')} className='text-primary underline cursor-pointer hover:text-primary/80'>Login here</span></p>
      </div>
    </form>
  );
};

export default ForgotPassword;
