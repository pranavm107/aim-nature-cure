import { adminService } from "../services/adminService";
import { appointmentService } from "../services/appointmentService";
import { createContext, useState } from "react";
import { toast } from "react-toastify";

export const AdminContext = createContext();

const AdminContextProvider = (props) => {
    const [aToken, setAToken] = useState(localStorage.getItem('aToken') ? localStorage.getItem('aToken') : '');
    const [appointments, setAppointments] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [dashData, setDashData] = useState(false);
    const [adminPermissions, setAdminPermissions] = useState([
        'view_dashboard', 'manage_users', 'manage_roles', 'view_patients', 
        'edit_patients', 'manage_appointments', 'manage_therapies', 
        'view_reports', 'manage_billing'
    ]);

    const getAllDoctors = async () => {
        try {
            const data = await adminService.getAllDoctors();
            if (data.success) {
                setDoctors(data.doctors);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const changeAvailability = async (docId) => {
        try {
            const data = await adminService.changeAvailability(docId);
            if (data.success) {
                toast.success(data.message);
                getAllDoctors();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    };

    const getAllAppointments = async () => {
        try {
            const data = await appointmentService.getAllAppointments();
            if (data.success) {
                setAppointments(data.appointments.reverse());
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
            console.log(error);
        }
    };

    const cancelAppointment = async (appointmentId) => {
        try {
            const data = await appointmentService.updateAppointmentStatus(appointmentId, 'Cancelled');
            if (data.success) {
                toast.success("Appointment Cancelled");
                getAllAppointments();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
            console.log(error);
        }
    };

    const getDashData = async () => {
        try {
            const data = await adminService.getDashData();
            if (data.success) {
                setDashData(data.dashData);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    };

    const value = {
        aToken, setAToken,
        doctors,
        getAllDoctors,
        changeAvailability,
        appointments,
        getAllAppointments,
        getDashData,
        cancelAppointment,
        dashData,
        adminPermissions,
        setAdminPermissions
    };

    return (
        <AdminContext.Provider value={value}>
            {props.children}
        </AdminContext.Provider>
    );
};

export default AdminContextProvider;