import mongoose from 'mongoose';

const therapySchema = new mongoose.Schema({
    name: { type: String, required: true },
    duration: { type: Number, required: true }, // in minutes
    price: { type: Number, required: true },
    isActive: { type: Boolean, default: true }
}, {
    timestamps: true
});

const therapyModel = mongoose.models.therapy || mongoose.model('therapy', therapySchema);
export default therapyModel;
