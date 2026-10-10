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
      const loginRes = await authService.login(email, password);

      if (loginRes.success) {
        // Temporarily store token for getCurrentUser to use
        localStorage.setItem('token', loginRes.token);

        // Fetch current user to determine role
        const userRes = await authService.getCurrentUser(email);

        if (userRes.success) {
          let { role, user } = userRes;

          // Fallback deep unwrap if authService failed to unwrap
          if (!role || typeof role === 'object') {
            const possibleUser = user?.result || user?.user || user;
            role = possibleUser?.role || possibleUser?.roleName || possibleUser?.type || role;
          }

          // If role is still an object (e.g. { name: 'ADMIN' }), extract the name
          if (role && typeof role === 'object') {
            role = role.name || role.roleName || role.value || JSON.stringify(role);
          }

          const normalizedRole = role ? String(role).toUpperCase() : 'UNDEFINED';

          if (normalizedRole === 'ADMIN') {
            setAToken(loginRes.token);
            localStorage.setItem('aToken', loginRes.token);
            localStorage.setItem('userRole', 'admin');
            localStorage.setItem('userEmail', email);
            localStorage.removeItem('token'); // clean up generic token

            toast.success('Admin logged in successfully');
            navigate('/admin-dashboard');
          } else if (normalizedRole === 'DOCTOR') {
            setDToken(loginRes.token);
            localStorage.setItem('dToken', loginRes.token);
            localStorage.setItem('userRole', 'doctor');
            localStorage.setItem('userEmail', email);
            const doctorUuid = possibleUser?.uuid || possibleUser?.id || '';
            if (doctorUuid) {
              localStorage.setItem('doctorId', doctorUuid);
              document.cookie = `doctorId=${doctorUuid}; path=/; max-age=86400`;
            }
            localStorage.removeItem('token'); // clean up generic token

            toast.success('Doctor logged in successfully');
            navigate('/doctor-dashboard');
          } else {
            localStorage.removeItem('token');
            // Show the raw object to the user so they can help us debug
            toast.error(`Auth Res: ${JSON.stringify(userRes)}`, { autoClose: false });
          }
        } else {
          localStorage.removeItem('token');
          toast.error(userRes.message || 'Failed to retrieve user details');
        }
      } else {
        toast.error(loginRes.message || 'Login failed');
      }
    } catch (error) {
      toast.error('An error occurred during login');
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
