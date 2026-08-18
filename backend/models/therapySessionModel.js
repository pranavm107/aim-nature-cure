import mongoose from 'mongoose';

const therapySessionSchema = new mongoose.Schema({
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'doctor', required: true },
    therapy: { type: mongoose.Schema.Types.ObjectId, ref: 'therapy', required: true },
    patientPackage: { type: mongoose.Schema.Types.ObjectId, ref: 'patientPackage', required: true },
    scheduledDate: { type: Date, default: null }, // Null initially as per decision
    status: { type: String, enum: ['Pending', 'Completed', 'Cancelled'], default: 'Pending' },
    completionDate: { type: Date },
    notes: { type: String }
}, {
    timestamps: true
});

const therapySessionModel = mongoose.models.therapySession || mongoose.model('therapySession', therapySessionSchema);
export default therapySessionModel;
