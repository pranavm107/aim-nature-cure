import mongoose from 'mongoose';

const patientPackageSchema = new mongoose.Schema({
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'doctor', required: true },
    therapyPackage: { type: mongoose.Schema.Types.ObjectId, ref: 'therapyPackage' }, // optional if standalone therapy assignment
    therapy: { type: mongoose.Schema.Types.ObjectId, ref: 'therapy' }, // optional if package assignment
    isPackage: { type: Boolean, required: true },
    totalSessions: { type: Number, required: true },
    completedSessions: { type: Number, default: 0 },
    assignedDate: { type: Date, default: Date.now },
    status: { type: String, enum: ['Active', 'Completed', 'Cancelled'], default: 'Active' }
}, {
    timestamps: true
});

const patientPackageModel = mongoose.models.patientPackage || mongoose.model('patientPackage', patientPackageSchema);
export default patientPackageModel;
