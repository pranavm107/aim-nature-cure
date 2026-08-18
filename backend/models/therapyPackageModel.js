import mongoose from 'mongoose';

const therapyPackageSchema = new mongoose.Schema({
    name: { type: String, required: true },
    totalPrice: { type: Number, required: true },
    includedTherapies: [{
        therapy: { type: mongoose.Schema.Types.ObjectId, ref: 'therapy', required: true },
        count: { type: Number, required: true }
    }],
    isActive: { type: Boolean, default: true }
}, {
    timestamps: true
});

const therapyPackageModel = mongoose.models.therapyPackage || mongoose.model('therapyPackage', therapyPackageSchema);
export default therapyPackageModel;
