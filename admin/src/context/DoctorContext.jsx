import { createContext, useState } from "react";
import { doctorService } from "../services/doctorService";
import { appointmentService } from "../services/appointmentService";
import { toast } from 'react-toastify';

export const DoctorContext = createContext();

const DoctorContextProvider = (props) => {
    const [dToken, setDToken] = useState(localStorage.getItem('dToken') ? localStorage.getItem('dToken') : '');
    const [appointments, setAppointments] = useState([]);
    const [dashData, setDashData] = useState(false);
    const [profileData, setProfileData] = useState(false);

    const getAppointments = async () => {
        try {
            const data = await appointmentService.getDoctorAppointments();
            if (data.success) {
                setAppointments(data.appointments.reverse());
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    };

    const getProfileData = async () => {
        try {
            const data = await doctorService.getProfileData();
            setProfileData(data.profileData);
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    };

    const cancelAppointment = async (appointmentId) => {
        try {
            const data = await appointmentService.updateAppointmentStatus(appointmentId, 'Cancelled');
            if (data.success) {
                toast.success("Appointment Cancelled");
                getAppointments();
                getDashData();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
            console.log(error);
        }
    };

    const completeAppointment = async (appointmentId) => {
        try {
            const data = await appointmentService.updateAppointmentStatus(appointmentId, 'Completed');
            if (data.success) {
                toast.success("Appointment Completed");
                getAppointments();
                getDashData();
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
            const data = await doctorService.getDashData();
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
        dToken, setDToken,
        appointments,
        getAppointments,
        cancelAppointment,
        completeAppointment,
        dashData, getDashData,
        profileData, setProfileData,
        getProfileData,
    };

    return (
        <DoctorContext.Provider value={value}>
            {props.children}
        </DoctorContext.Provider>
    );
};

export default DoctorContextProvider;