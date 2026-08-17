import React, { useEffect, useState, useContext } from 'react';
import { AdminContext } from '../../context/AdminContext';
import { DoctorContext } from '../../context/DoctorContext';
import { authService } from '../../services/authService';
import { toast } from 'react-toastify';
import { assets } from '../../assets/assets';

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
        <p className='text-gray-500'>Loading profile...</p>
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
    <div className='m-5 w-full max-w-lg'>
      <h1 className='text-lg font-medium mb-4'>My Profile</h1>
      <div className='bg-white p-6 rounded-lg border flex flex-col gap-4'>
        <div className='flex items-center gap-4'>
          <img 
            src={profile.image || assets.upload_area} 
            alt="Profile" 
            className='w-24 h-24 rounded-full bg-gray-100 object-cover'
          />
          <div>
            <h2 className='text-2xl font-semibold text-gray-800'>{profile.name}</h2>
            <p className='text-gray-500 capitalize'>{profile.role}</p>
          </div>
        </div>
        
        <div className='mt-4'>
          <p className='text-gray-500 text-sm'>Email</p>
          <p className='text-gray-800 font-medium'>{profile.email}</p>
        </div>

        {profile.speciality && (
          <div className='mt-2'>
            <p className='text-gray-500 text-sm'>Speciality</p>
            <p className='text-gray-800 font-medium'>{profile.speciality}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyProfile;
