import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AdminContext } from '../context/AdminContext';
import { DoctorContext } from '../context/DoctorContext';

const ProtectedRoute = ({ role, requiredPermission, children }) => {
  const { aToken, adminPermissions } = useContext(AdminContext);
  const { dToken } = useContext(DoctorContext);

  if (role === 'admin' && !aToken) {
    return <Navigate to="/" />;
  }

  if (role === 'doctor' && !dToken) {
    return <Navigate to="/" />;
  }

  if (requiredPermission && role === 'admin') {
    if (!adminPermissions || !adminPermissions.includes(requiredPermission)) {
      // User doesn't have permission, redirect to dashboard or show unauthorized
      return <Navigate to="/admin-dashboard" />;
    }
  }

  const mustChange = localStorage.getItem('mustChangePassword') === 'true';
  const isResetRoute = window.location.pathname === '/force-password-reset';

  if (mustChange && !isResetRoute) {
    return <Navigate to="/force-password-reset" />;
  }

  // If they are on reset route but don't need to change password, send them to dashboard
  if (isResetRoute && !mustChange) {
    return <Navigate to={role === 'admin' ? '/admin-dashboard' : '/doctor-dashboard'} />;
  }

  return children;
};

export default ProtectedRoute;
