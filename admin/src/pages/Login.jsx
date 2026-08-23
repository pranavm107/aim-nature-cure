import React, { useContext, useState } from 'react';
import { DoctorContext } from '../context/DoctorContext';
import { AdminContext } from '../context/AdminContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { InputField, PrimaryButton } from '../components/common/FormFields';

const Login = () => {
  const [state, setState] = useState('Admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { setDToken } = useContext(DoctorContext);
  const { setAToken } = useContext(AdminContext);
  const navigate = useNavigate();

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      if (state === 'Admin') {
        const data = await authService.loginAdmin(email, password);
        if (data.success) {
          setAToken(data.token);
          localStorage.setItem('aToken', data.token);
          localStorage.setItem('userRole', 'admin');
          toast.success('Admin logged in successfully');
          navigate('/admin-dashboard');
        } else {
          toast.error(data.message);
        }
      } else {
        const data = await authService.loginDoctor(email, password);
        if (data.success) {
          setDToken(data.token);
          localStorage.setItem('dToken', data.token);
          localStorage.setItem('userRole', 'doctor');
          toast.success('Doctor logged in successfully');
          navigate('/doctor-dashboard');
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      // Error is handled by toast
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmitHandler} className='min-h-[80vh] flex items-center justify-center bg-slate-50'>
      <div className='flex flex-col gap-5 items-start p-8 min-w-[340px] sm:min-w-96 border border-slate-200 rounded-xl text-slate-600 text-sm shadow-xl bg-white'>
        <p className='text-2xl font-semibold m-auto'>
          <span className='text-primary'>{state}</span> Login
        </p>
        
        <InputField 
          label="Email" 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
          className="w-full"
        />
        
        <InputField 
          label="Password" 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required 
          className="w-full"
        />
        
        <div className='w-full text-right mt-[-10px]'>
          <span onClick={() => navigate('/forgot-password')} className='text-xs text-primary cursor-pointer hover:underline'>Forgot Password?</span>
        </div>

        <PrimaryButton 
          type="submit" 
          className='w-full py-2 rounded-md text-base px-0' 
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </PrimaryButton>
        
        {state === 'Admin' ? (
          <p className='m-auto'>Doctor Login? <span onClick={() => setState('Doctor')} className='text-primary underline cursor-pointer'>Click here</span></p>
        ) : (
          <p className='m-auto'>Admin Login? <span onClick={() => setState('Admin')} className='text-primary underline cursor-pointer'>Click here</span></p>
        )}
      </div>
    </form>
  );
};

export default Login;