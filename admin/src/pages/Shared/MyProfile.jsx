import React, { useEffect, useState, useContext, useRef } from 'react';
import { AdminContext } from '../../context/AdminContext';
import { DoctorContext } from '../../context/DoctorContext';
import { authService } from '../../services/authService';
import { userService } from '../../services/userService';
import { toast } from 'react-toastify';
import { assets } from '../../assets/assets';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/layout/PageHeader';
import { Camera, Mail, Phone, MapPin, Award, Calendar, Edit2, Check, X } from 'lucide-react';

const MyProfile = () => {
  const { aToken } = useContext(AdminContext);
  const { dToken } = useContext(DoctorContext);
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [photoFile, setPhotoFile] = useState(null);
  const [previewPhoto, setPreviewPhoto] = useState(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ name: '', phone: '', address: '', speciality: '' });
  const [saving, setSaving] = useState(false);

  const fileInputRef = useRef(null);

  const fetchProfile = async () => {
    try {
      const role = aToken ? 'admin' : 'doctor';
      const response = await authService.getProfile(role);
      if (response.success) {
        setProfile(response.data);
        setPreviewPhoto(response.data.photo || response.data.image || assets.upload_area);
        setEditData({
          name: response.data.name || '',
          phone: response.data.phone || response.data.phoneNumber || '',
          address: response.data.address || '',
          speciality: response.data.speciality || response.data.specialization || ''
        });
      } else {
        toast.error('Failed to load profile');
      }
    } catch (error) {
      toast.error('Error fetching profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [aToken, dToken]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPreviewPhoto(URL.createObjectURL(file));
      toast.success("Profile photo updated successfully!");
    }
  };

  const handleSave = async () => {
    if (!editData.name.trim()) {
      return toast.error("Name cannot be empty");
    }
    setSaving(true);
    const userId = profile.uuid || profile.id || profile._id;
    
    // Merge existing profile data with editData
    const payload = {
      ...profile,
      name: editData.name,
      phone: editData.phone,
      address: editData.address,
      speciality: editData.speciality
    };

    const response = await userService.updateUser(userId, payload);
    if (response.success) {
      toast.success("Profile updated successfully");
      setIsEditing(false);
      fetchProfile();
    } else {
      toast.error(response.message || "Failed to update profile");
    }
    setSaving(false);
  };

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

  const roleName = profile.role || profile.roleName || profile.type || 'User';
  const isDoctor = roleName.toUpperCase() === 'DOCTOR';

  return (
    <PageContainer>
      <PageHeader title="My Profile" subtitle="Manage your personal information" />
      <div className='bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-4xl flex flex-col gap-8 relative'>
        
        {/* Edit Button */}
        {!isEditing ? (
          <button 
            onClick={() => setIsEditing(true)}
            className="absolute top-8 right-8 flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-sm font-medium transition-colors border border-slate-200"
          >
            <Edit2 className="w-4 h-4" /> Edit Profile
          </button>
        ) : (
          <div className="absolute top-8 right-8 flex items-center gap-3">
            <button 
              onClick={() => {
                setIsEditing(false);
                setEditData({ 
                  name: profile.name || '', 
                  phone: profile.phone || profile.phoneNumber || '',
                  address: profile.address || '',
                  speciality: profile.speciality || profile.specialization || ''
                });
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded text-sm font-medium transition-colors"
              disabled={saving}
            >
              <X className="w-4 h-4" /> Cancel
            </button>
            <button 
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 shadow-sm"
              disabled={saving}
            >
              <Check className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}

        {/* Header Section */}
        <div className='flex flex-col sm:flex-row items-center sm:items-start gap-8'>
          
          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <img 
              src={previewPhoto} 
              alt="Profile" 
              className='w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-slate-50 object-cover border-4 border-slate-100 shadow-md transition-all group-hover:brightness-75'
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-8 h-8 text-white drop-shadow-md" />
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handlePhotoChange} 
              accept="image/*" 
              className="hidden" 
            />
          </div>

          <div className='text-center sm:text-left flex-1 pt-2 sm:pt-4'>
            {isEditing ? (
              <input 
                type="text"
                value={editData.name}
                onChange={(e) => setEditData({...editData, name: e.target.value})}
                className="text-2xl font-bold text-slate-800 border-b-2 border-primary outline-none focus:border-primary bg-slate-50 px-2 py-1 rounded w-full max-w-md transition-all"
                placeholder="Full Name"
              />
            ) : (
              <h2 className='text-3xl font-bold text-slate-800'>{profile.name || '-'}</h2>
            )}
            
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-3">
              <span className='text-primary bg-primary/10 px-4 py-1.5 rounded-full text-sm font-semibold capitalize tracking-wide'>
                {roleName}
              </span>
              {profile.active && (
                <span className='text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full text-xs font-semibold'>
                  Active
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* Personal Information Grid */}
        <div className='mt-2'>
          <h3 className="text-lg font-semibold text-slate-800 mb-6 border-b border-slate-100 pb-3">Personal Information</h3>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
            
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <Mail className="w-5 h-5" />
              </div>
              <div className="w-full">
                <p className='text-slate-500 text-sm font-medium mb-1'>Email Address</p>
                <p className='text-slate-800 font-semibold'>{profile.email || 'Not Provided'}</p>
                {isEditing && <p className="text-xs text-slate-400 mt-1">Email cannot be changed.</p>}
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                <Phone className="w-5 h-5" />
              </div>
              <div className="w-full">
                <p className='text-slate-500 text-sm font-medium mb-1'>Phone Number</p>
                {isEditing ? (
                  <input 
                    type="text"
                    value={editData.phone}
                    onChange={(e) => setEditData({...editData, phone: e.target.value.replace(/[^0-9+]/g, '')})}
                    className="font-semibold text-slate-800 border-b border-primary outline-none focus:border-primary bg-slate-50 px-2 py-1 rounded w-full max-w-xs transition-all"
                    placeholder="Phone Number"
                  />
                ) : (
                  <p className='text-slate-800 font-semibold'>{profile.phone || profile.phoneNumber || 'Not Provided'}</p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="w-full">
                <p className='text-slate-500 text-sm font-medium mb-1'>Address</p>
                {isEditing ? (
                  <input 
                    type="text"
                    value={editData.address}
                    onChange={(e) => setEditData({...editData, address: e.target.value})}
                    className="font-semibold text-slate-800 border-b border-primary outline-none focus:border-primary bg-slate-50 px-2 py-1 rounded w-full transition-all"
                    placeholder="Residential Address"
                  />
                ) : (
                  <p className='text-slate-800 font-semibold'>{profile.address || 'Not Provided'}</p>
                )}
              </div>
            </div>

            {(isDoctor || profile.speciality || profile.specialization) && (
              <div className="flex items-start gap-4">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                  <Award className="w-5 h-5" />
                </div>
                <div className="w-full">
                  <p className='text-slate-500 text-sm font-medium mb-1'>Speciality</p>
                  {isEditing && isDoctor ? (
                    <input 
                      type="text"
                      value={editData.speciality}
                      onChange={(e) => setEditData({...editData, speciality: e.target.value})}
                      className="font-semibold text-slate-800 border-b border-primary outline-none focus:border-primary bg-slate-50 px-2 py-1 rounded w-full transition-all"
                      placeholder="e.g. Neurologist"
                    />
                  ) : (
                    <p className='text-slate-800 font-semibold'>{profile.speciality || profile.specialization || 'Not Provided'}</p>
                  )}
                </div>
              </div>
            )}

            {profile.createdAt && (
              <div className="flex items-start gap-4">
                <div className="p-3 bg-slate-50 text-slate-600 rounded-xl">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className='text-slate-500 text-sm font-medium mb-1'>Joined Date</p>
                  <p className='text-slate-800 font-semibold'>
                    {new Date(profile.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </PageContainer>
  );
};

export default MyProfile;