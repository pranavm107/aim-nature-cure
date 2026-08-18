import therapySessionModel from '../models/therapySessionModel.js';
import patientPackageModel from '../models/patientPackageModel.js';
import therapyPackageModel from '../models/therapyPackageModel.js';
import therapyModel from '../models/therapyModel.js';

// POST /patients/:patientId/therapy-assignments
const assignTherapyOrPackage = async (req, res) => {
    try {
        const { patientId } = req.params;
        const { type, itemId, assignedDocId, docId } = req.body;

        const doctorId = docId || assignedDocId;
        if (!doctorId) {
            return res.status(400).json({ success: false, message: 'Doctor ID required' });
        }

        let patientPackage;
        let sessionDocs = [];

        if (type === 'package') {
            const packageId = itemId;
            const pkg = await therapyPackageModel.findById(packageId);
            if (!pkg) return res.status(404).json({ success: false, message: 'Package not found' });

            let totalSessions = 0;
            pkg.includedTherapies.forEach(t => totalSessions += t.count);

            patientPackage = new patientPackageModel({
                patient: patientId,
                doctor: doctorId,
                therapyPackage: packageId,
                isPackage: true,
                totalSessions
            });
            await patientPackage.save();

            for (const item of pkg.includedTherapies) {
                for (let i = 0; i < item.count; i++) {
                    sessionDocs.push({
                        patient: patientId,
                        doctor: doctorId,
                        therapy: item.therapy,
                        patientPackage: patientPackage._id,
                        scheduledDate: null,
                        status: 'Pending'
                    });
                }
            }
            sessionDocs = await therapySessionModel.insertMany(sessionDocs);

        } else if (type === 'therapy') {
            const therapyId = itemId;
            const th = await therapyModel.findById(therapyId);
            if (!th) return res.status(404).json({ success: false, message: 'Therapy not found' });
            
            const count = 1;
            patientPackage = new patientPackageModel({
                patient: patientId,
                doctor: doctorId,
                therapy: therapyId,
                isPackage: false,
                totalSessions: count
            });
            await patientPackage.save();

            for (let i = 0; i < count; i++) {
                sessionDocs.push({
                    patient: patientId,
                    doctor: doctorId,
                    therapy: therapyId,
                    patientPackage: patientPackage._id,
                    scheduledDate: null,
                    status: 'Pending'
                });
            }
            sessionDocs = await therapySessionModel.insertMany(sessionDocs);
        } else {
            return res.status(400).json({ success: false, message: 'Must provide valid type (therapy/package) and itemId' });
        }

        res.status(201).json({ success: true, message: 'Assignment successful', sessions: sessionDocs });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// GET /patients/:patientId/therapy-assignments
const getPatientAssignments = async (req, res) => {
    try {
        const { patientId } = req.params;
        let query = { patient: patientId };
        if (req.body.docId) query.doctor = req.body.docId;

        const assignments = await patientPackageModel.find(query)
            .populate('therapyPackage', 'name totalPrice')
            .populate('therapy', 'name price')
            .sort({ createdAt: -1 });
        res.json({ success: true, assignments });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// GET /patients/:patientId/therapy-sessions
const getPatientSessions = async (req, res) => {
    try {
        const { patientId } = req.params;
        let query = { patient: patientId };
        if (req.body.docId) query.doctor = req.body.docId;

        const sessions = await therapySessionModel.find(query)
            .populate('therapy', 'name duration')
            .populate('patientPackage')
            .sort({ scheduledDate: 1, createdAt: 1 });
        res.json({ success: true, sessions });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// GET /therapy-sessions
const getAllSessions = async (req, res) => {
    try {
        let query = {};
        if (req.body.docId) {
            query.doctor = req.body.docId; // Scoped to doctor if authDoctor middleware is used
        }
        const sessions = await therapySessionModel.find(query)
            .populate('therapy', 'name duration')
            .populate('patientPackage')
            .sort({ scheduledDate: 1, createdAt: 1 });
        res.json({ success: true, sessions });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// PATCH /therapy-sessions/:id/complete
const completeSession = async (req, res) => {
    try {
        const { id } = req.params;
        const { notes, completionDate, docId } = req.body;
        
        const session = await therapySessionModel.findById(id);
        if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
        
        if (docId && session.doctor.toString() !== docId.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized to modify this session' });
        }

        if (session.status === 'Completed') {
            return res.status(400).json({ success: false, message: 'Session is already completed' });
        }
        
        session.status = 'Completed';
        session.notes = notes;
        session.completionDate = completionDate || new Date();
        await session.save();

        // Update patientPackage counters
        const pkg = await patientPackageModel.findById(session.patientPackage);
        if (pkg) {
            pkg.completedSessions += 1;
            if (pkg.completedSessions >= pkg.totalSessions) {
                pkg.status = 'Completed';
            }
            await pkg.save();
        }

        res.json({ success: true, message: 'Session completed', session });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// PATCH /therapy-sessions/:id/reschedule
const rescheduleSession = async (req, res) => {
    try {
        const { id } = req.params;
        const { date, scheduledDate, docId } = req.body;
        const newDate = date || scheduledDate;
        
        const session = await therapySessionModel.findById(id);
        if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
        
        if (docId && session.doctor.toString() !== docId.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized to modify this session' });
        }

        if (session.status === 'Completed') {
            return res.status(400).json({ success: false, message: 'Cannot reschedule a completed session' });
        }

        session.scheduledDate = newDate;
        await session.save();
        
        res.json({ success: true, message: 'Session rescheduled', session });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export { assignTherapyOrPackage, getPatientAssignments, getPatientSessions, getAllSessions, completeSession, rescheduleSession };
