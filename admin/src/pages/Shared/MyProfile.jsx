import React, { useEffect, useState, useContext } from 'react';
import { AdminContext } from '../../context/AdminContext';
import { DoctorContext } from '../../context/DoctorContext';
import { authService } from '../../services/authService';
import { toast } from 'react-toastify';
import { assets } from '../../assets/assets';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/layout/PageHeader';

const MyProfile = () => {
  const { aToken } = useContext(AdminContext);
  const { dToken } = useContext(DoctorContext);
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const role = aToken ? 'admin' : 'doctor';
        const response = await authService.getProfile(role);
        if (response.success) {
          setProfile(response.data);
        } else {
          toast.error('Failed to load profile');
        }
      } catch (error) {
        toast.error('Error fetching profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [aToken, dToken]);

  if (loading) {
    return (
      <div className='m-5 w-full flex justify-center items-center h-40'>
        <p className='text-slate-500'>Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className='m-5 w-full flex justify-center items-center h-40'>
        <p className='text-red-500'>Profile not found</p>
      </div>
    );
  }

  return (
    <PageContainer>
      <PageHeader title="My Profile" subtitle="Manage your personal information" />
      <div className='bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-sm max-w-2xl flex flex-col gap-6'>
        <div className='flex flex-col sm:flex-row items-center gap-6'>
          <img 
            src={profile.image || assets.upload_area} 
            alt="Profile" 
            className='w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-slate-50 object-cover border-4 border-slate-100 shadow-sm'
          />
          <div className='text-center sm:text-left'>
            <h2 className='text-2xl font-bold text-slate-800'>{profile.name}</h2>
            <p className='text-primary bg-primary/10 inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 capitalize'>{profile.role}</p>
          </div>
        </div>
        
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4 pt-6 border-t border-slate-100'>
          <div>
            <p className='text-slate-500 text-sm mb-1'>Email Address</p>
            <p className='text-slate-800 font-medium'>{profile.email}</p>
          </div>

          {profile.speciality && (
            <div>
              <p className='text-slate-500 text-sm mb-1'>Speciality</p>
              <p className='text-slate-800 font-medium'>{profile.speciality}</p>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
};

export default MyProfile;
