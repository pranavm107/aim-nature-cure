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
import DoctorDashboard from './pages/Doctor/DoctorDashboard';
import ForgotPassword from './pages/Shared/ForgotPassword';
import ForcePasswordReset from './pages/ForcePasswordReset';
import MyProfile from './pages/Shared/MyProfile';
import PatientList from './pages/Shared/PatientList';
import PatientRegistration from './pages/Shared/PatientRegistration';
import PatientDetail from './pages/Shared/PatientDetail';
import CaseSheet from './pages/Shared/CaseSheet';
import NewConsultation from './pages/Doctor/NewConsultation';
import ConsultationHistory from './pages/Doctor/ConsultationHistory';
import Therapies from './pages/Admin/Therapies';
import Packages from './pages/Admin/Packages';
import TherapyAssignment from './pages/Doctor/TherapyAssignment';
import TherapySessions from './pages/Doctor/TherapySessions';
import InvoiceList from './pages/Admin/InvoiceList';
import InvoiceDetail from './pages/Admin/InvoiceDetail';
import DoctorRevenue from './pages/Admin/DoctorRevenue';
import DoctorComparison from './pages/Admin/DoctorComparison';
import IncentiveConfig from './pages/Admin/IncentiveConfig';
import IncentiveApproval from './pages/Admin/IncentiveApproval';
import AdminFollowUpOverview from './pages/Admin/AdminFollowUpOverview';
import MyRevenue from './pages/Doctor/MyRevenue';
import MyIncentive from './pages/Doctor/MyIncentive';
import FollowUpList from './pages/Doctor/FollowUpList';
import Leads from './pages/Admin/Leads';
import SocialReview from './pages/Admin/SocialReview';
import SocialSubmission from './pages/Doctor/SocialSubmission';
import AdminDailyReports from './pages/Admin/AdminDailyReports';
import AdminReports from './pages/Admin/AdminReports';
import UserManagement from './pages/Admin/UserManagement';
import UserDetail from './pages/Admin/UserDetail';
import DoctorDetail from './pages/Admin/DoctorDetail';
import AppointmentDetail from './pages/Admin/AppointmentDetail';
import DoctorNotes from './pages/Doctor/DoctorNotes';
import DoctorTasks from './pages/Doctor/DoctorTasks';
import DoctorDailyReport from './pages/Doctor/DoctorDailyReport';

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
            <Route path='/force-password-reset' element={isAuthenticated ? <ForcePasswordReset /> : <Navigate to="/login" />} />
            
            {/* Root Redirect */}
            <Route path='/' element={<Navigate to={isAuthenticated ? (aToken ? '/admin-dashboard' : '/doctor-dashboard') : '/login'} />} />

            {/* Admin Routes */}
            <Route path='/admin-dashboard' element={<ProtectedRoute role="admin"><Dashboard /></ProtectedRoute>} />
            <Route path='/admin/users' element={<ProtectedRoute role="admin"><UserManagement /></ProtectedRoute>} />
            <Route path='/admin/users/:id' element={<ProtectedRoute role="admin"><UserDetail /></ProtectedRoute>} />
            <Route path='/add-doctor' element={<ProtectedRoute role="admin"><AddDoctor /></ProtectedRoute>} />
            <Route path='/doctor-list' element={<ProtectedRoute role="admin"><DoctorsList /></ProtectedRoute>} />
            <Route path='/admin/doctors/:id' element={<ProtectedRoute role="admin"><DoctorDetail /></ProtectedRoute>} />
            <Route path='/admin/therapies' element={<ProtectedRoute role="admin"><Therapies /></ProtectedRoute>} />
            <Route path='/admin/packages' element={<ProtectedRoute role="admin"><Packages /></ProtectedRoute>} />
            <Route path='/all-appointments' element={<ProtectedRoute role="admin"><AllAppointments /></ProtectedRoute>} />
            <Route path='/admin/appointments/:id' element={<ProtectedRoute role="admin"><AppointmentDetail /></ProtectedRoute>} />
            <Route path='/admin/invoices' element={<ProtectedRoute role="admin"><InvoiceList /></ProtectedRoute>} />
            <Route path='/admin/invoices/:id' element={<ProtectedRoute role="admin"><InvoiceDetail /></ProtectedRoute>} />
            {/* Payment is handled via modal inside InvoiceDetail */}
            <Route path='/admin/revenue' element={<ProtectedRoute role="admin"><DoctorRevenue /></ProtectedRoute>} />
            <Route path='/admin/comparison' element={<ProtectedRoute role="admin"><DoctorComparison /></ProtectedRoute>} />
            <Route path='/admin/incentive-config' element={<ProtectedRoute role="admin"><IncentiveConfig /></ProtectedRoute>} />
            <Route path='/admin/incentive-approval' element={<ProtectedRoute role="admin"><IncentiveApproval /></ProtectedRoute>} />
            <Route path='/admin/follow-ups' element={<ProtectedRoute role="admin"><AdminFollowUpOverview /></ProtectedRoute>} />
            <Route path='/admin/leads' element={<ProtectedRoute role="admin"><Leads /></ProtectedRoute>} />
            <Route path='/admin/social-review' element={<ProtectedRoute role="admin"><SocialReview /></ProtectedRoute>} />
            <Route path='/admin/daily-reports' element={<ProtectedRoute role="admin"><AdminDailyReports /></ProtectedRoute>} />
            <Route path='/admin/reports' element={<ProtectedRoute role="admin"><AdminReports /></ProtectedRoute>} />

            {/* Doctor Routes */}
            <Route path='/doctor-dashboard' element={<ProtectedRoute role="doctor"><DoctorDashboard /></ProtectedRoute>} />
            <Route path='/doctor/consultation' element={<ProtectedRoute role="doctor"><NewConsultation /></ProtectedRoute>} />
            <Route path='/doctor/history' element={<ProtectedRoute role="doctor"><ConsultationHistory /></ProtectedRoute>} />
            <Route path='/doctor/therapy-assignment' element={<ProtectedRoute role="doctor"><TherapyAssignment /></ProtectedRoute>} />
            <Route path='/doctor/therapy-sessions' element={<ProtectedRoute role="doctor"><TherapySessions /></ProtectedRoute>} />
            <Route path='/doctor/revenue' element={<ProtectedRoute role="doctor"><MyRevenue /></ProtectedRoute>} />
            <Route path='/doctor/incentive' element={<ProtectedRoute role="doctor"><MyIncentive /></ProtectedRoute>} />
            <Route path='/doctor/follow-ups' element={<ProtectedRoute role="doctor"><FollowUpList /></ProtectedRoute>} />
            <Route path='/doctor/social-submission' element={<ProtectedRoute role="doctor"><SocialSubmission /></ProtectedRoute>} />
            <Route path='/doctor/notes' element={<ProtectedRoute role="doctor"><DoctorNotes /></ProtectedRoute>} />
            <Route path='/doctor/tasks' element={<ProtectedRoute role="doctor"><DoctorTasks /></ProtectedRoute>} />
            <Route path='/doctor/daily-report' element={<ProtectedRoute role="doctor"><DoctorDailyReport /></ProtectedRoute>} />
            
            {/* Shared Authenticated Routes */}
            <Route path='/profile' element={<MyProfile />} />
            <Route path='/patients' element={<PatientList />} />
            <Route path='/add-patient' element={<PatientRegistration />} />
            <Route path='/patient/:id' element={<PatientDetail />} />
            <Route path='/patient/:id/case-sheet' element={<CaseSheet />} />
            <Route path='/patient/:id/new-consultation' element={<NewConsultation />} />

        {/* Catch All */}
        <Route path='*' element={<Navigate to="/" />} />
      </Routes>
    </AppShell>
  )
}

export default App