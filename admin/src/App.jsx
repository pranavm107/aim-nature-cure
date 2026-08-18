import React, { useContext } from 'react'
import { DoctorContext } from './context/DoctorContext';
import { AdminContext } from './context/AdminContext';
import { Route, Routes, Navigate, useLocation } from 'react-router-dom'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AppShell from './components/layout/AppShell';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Admin/Dashboard';
import AllAppointments from './pages/Admin/AllAppointments';
import AddDoctor from './pages/Admin/AddDoctor';
import DoctorsList from './pages/Admin/DoctorsList';
import Login from './pages/Login';
import DoctorAppointments from './pages/Doctor/DoctorAppointments';
import DoctorDashboard from './pages/Doctor/DoctorDashboard';
import DoctorProfile from './pages/Doctor/DoctorProfile';
import Placeholder from './pages/Placeholder';
import ForgotPassword from './pages/Shared/ForgotPassword';
import MyProfile from './pages/Shared/MyProfile';
import PatientList from './pages/Shared/PatientList';
import PatientRegistration from './pages/Shared/PatientRegistration';
import PatientDetail from './pages/Shared/PatientDetail';
import NewConsultation from './pages/Doctor/NewConsultation';
import Therapies from './pages/Admin/Therapies';
import Packages from './pages/Admin/Packages';
import TherapyAssignment from './pages/Doctor/TherapyAssignment';
import TherapySessions from './pages/Doctor/TherapySessions';

const App = () => {
  const { dToken } = useContext(DoctorContext)
  const { aToken } = useContext(AdminContext)
  const location = useLocation()

  // Determine if we show the layout shell (navbar/sidebar)
  const isAuthRoute = location.pathname === '/login' || location.pathname === '/forgot-password';
  const isAuthenticated = aToken || dToken;

  return (
    <AppShell isAuthRoute={isAuthRoute} isAuthenticated={isAuthenticated}>
      <ToastContainer />
      <Routes>
        {/* Public Routes */}
        <Route path='/login' element={!isAuthenticated ? <Login /> : <Navigate to={aToken ? '/admin-dashboard' : '/doctor-dashboard'} />} />
            <Route path='/forgot-password' element={<ForgotPassword />} />
            
            {/* Root Redirect */}
            <Route path='/' element={<Navigate to={isAuthenticated ? (aToken ? '/admin-dashboard' : '/doctor-dashboard') : '/login'} />} />

            {/* Admin Routes */}
            <Route path='/admin-dashboard' element={<ProtectedRoute role="admin"><Dashboard /></ProtectedRoute>} />
            <Route path='/admin/users' element={<ProtectedRoute role="admin"><Placeholder /></ProtectedRoute>} />
            <Route path='/add-doctor' element={<ProtectedRoute role="admin"><AddDoctor /></ProtectedRoute>} />
            <Route path='/doctor-list' element={<ProtectedRoute role="admin"><DoctorsList /></ProtectedRoute>} />
            <Route path='/admin/therapies' element={<ProtectedRoute role="admin"><Therapies /></ProtectedRoute>} />
            <Route path='/admin/packages' element={<ProtectedRoute role="admin"><Packages /></ProtectedRoute>} />
            <Route path='/all-appointments' element={<ProtectedRoute role="admin"><AllAppointments /></ProtectedRoute>} />
            <Route path='/admin/invoices' element={<ProtectedRoute role="admin"><Placeholder /></ProtectedRoute>} />
            <Route path='/admin/record-payment' element={<ProtectedRoute role="admin"><Placeholder /></ProtectedRoute>} />
            <Route path='/admin/revenue' element={<ProtectedRoute role="admin"><Placeholder /></ProtectedRoute>} />
            <Route path='/admin/comparison' element={<ProtectedRoute role="admin"><Placeholder /></ProtectedRoute>} />
            <Route path='/admin/incentive-config' element={<ProtectedRoute role="admin"><Placeholder /></ProtectedRoute>} />
            <Route path='/admin/incentive-approval' element={<ProtectedRoute role="admin"><Placeholder /></ProtectedRoute>} />
            <Route path='/admin/follow-ups' element={<ProtectedRoute role="admin"><Placeholder /></ProtectedRoute>} />
            <Route path='/admin/leads' element={<ProtectedRoute role="admin"><Placeholder /></ProtectedRoute>} />
            <Route path='/admin/social-review' element={<ProtectedRoute role="admin"><Placeholder /></ProtectedRoute>} />
            <Route path='/admin/daily-reports' element={<ProtectedRoute role="admin"><Placeholder /></ProtectedRoute>} />
            <Route path='/admin/reports' element={<ProtectedRoute role="admin"><Placeholder /></ProtectedRoute>} />

            {/* Doctor Routes */}
            <Route path='/doctor-dashboard' element={<ProtectedRoute role="doctor"><DoctorDashboard /></ProtectedRoute>} />
            <Route path='/doctor/consultation' element={<ProtectedRoute role="doctor"><Placeholder /></ProtectedRoute>} />
            <Route path='/doctor/history' element={<ProtectedRoute role="doctor"><Placeholder /></ProtectedRoute>} />
            <Route path='/doctor/therapy-assignment' element={<ProtectedRoute role="doctor"><TherapyAssignment /></ProtectedRoute>} />
            <Route path='/doctor/therapy-sessions' element={<ProtectedRoute role="doctor"><TherapySessions /></ProtectedRoute>} />
            <Route path='/doctor/revenue' element={<ProtectedRoute role="doctor"><Placeholder /></ProtectedRoute>} />
            <Route path='/doctor/incentive' element={<ProtectedRoute role="doctor"><Placeholder /></ProtectedRoute>} />
            <Route path='/doctor/follow-ups' element={<ProtectedRoute role="doctor"><Placeholder /></ProtectedRoute>} />
            <Route path='/doctor/social-submission' element={<ProtectedRoute role="doctor"><Placeholder /></ProtectedRoute>} />
            <Route path='/doctor/notes' element={<ProtectedRoute role="doctor"><Placeholder /></ProtectedRoute>} />
            <Route path='/doctor/tasks' element={<ProtectedRoute role="doctor"><Placeholder /></ProtectedRoute>} />
            <Route path='/doctor/daily-report' element={<ProtectedRoute role="doctor"><Placeholder /></ProtectedRoute>} />
            
            {/* Legacy Doctor Routes (to be removed eventually) */}
            <Route path='/doctor-appointments' element={<ProtectedRoute role="doctor"><DoctorAppointments /></ProtectedRoute>} />
            <Route path='/doctor-profile' element={<ProtectedRoute role="doctor"><DoctorProfile /></ProtectedRoute>} />

            {/* Shared Authenticated Routes */}
            <Route path='/profile' element={<MyProfile />} />
            <Route path='/patients' element={<PatientList />} />
            <Route path='/add-patient' element={<PatientRegistration />} />
            <Route path='/patient/:id' element={<PatientDetail />} />
            <Route path='/patient/:id/new-consultation' element={<NewConsultation />} />

        {/* Catch All */}
        <Route path='*' element={<Navigate to="/" />} />
      </Routes>
    </AppShell>
  )
}

export default App