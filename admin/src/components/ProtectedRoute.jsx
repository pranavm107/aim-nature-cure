import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AdminContext } from '../context/AdminContext';
import { DoctorContext } from '../context/DoctorContext';

const ProtectedRoute = ({ role, children }) => {
  const { aToken } = useContext(AdminContext);
  const { dToken } = useContext(DoctorContext);

  if (role === 'admin' && !aToken) {
    return <Navigate to="/" />;
  }

  if (role === 'doctor' && !dToken) {
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;
