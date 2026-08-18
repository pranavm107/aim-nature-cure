import express from 'express';
import { assignTherapyOrPackage, getPatientAssignments, getPatientSessions, getAllSessions, completeSession, rescheduleSession } from '../controllers/therapySessionController.js';
import authDoctor from '../middleware/authDoctor.js';
import authUser from '../middleware/authUser.js';

const sessionRouter = express.Router();

// Actually these might be accessed by both admin and doctor depending on the view, but the spec says Doctor for assignment, Both for viewing. 
// For now, we will add authDoctor to write actions.

// Base path when mounted should be /api
sessionRouter.post('/patients/:patientId/therapy-assignments', authDoctor, assignTherapyOrPackage);
sessionRouter.get('/patients/:patientId/therapy-assignments', getPatientAssignments); // both
sessionRouter.get('/patients/:patientId/therapy-sessions', getPatientSessions); // both

sessionRouter.patch('/therapy-sessions/:id/complete', authDoctor, completeSession);
sessionRouter.patch('/therapy-sessions/:id/reschedule', authDoctor, rescheduleSession);
sessionRouter.get('/therapy-sessions', authDoctor, getAllSessions);

export default sessionRouter;
