import therapyModel from '../models/therapyModel.js';

const mapTherapyForFrontend = (th) => {
    return {
        _id: th._id,
        name: th.name,
        duration: th.duration,
        price: th.price,
        status: th.isActive
    };
};

// GET /therapies
const getTherapies = async (req, res) => {
    try {
        const { active } = req.query;
        let query = {};
        if (active === 'true') {
            query.isActive = true;
        } else if (active === 'false') {
            query.isActive = false;
        }

        const therapies = await therapyModel.find(query).sort({ name: 1 });
        res.json({ success: true, therapies: therapies.map(mapTherapyForFrontend) });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// POST /therapies
const createTherapy = async (req, res) => {
    try {
        const { name, duration, price } = req.body;
        if (!name || !duration || !price) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        const newTherapy = new therapyModel({
            name,
            duration,
            price
        });
        await newTherapy.save();

        res.status(201).json({ success: true, message: 'Therapy created successfully', therapy: mapTherapyForFrontend(newTherapy) });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// PUT /therapies/:id
const updateTherapy = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, duration, price } = req.body;

        const therapy = await therapyModel.findByIdAndUpdate(id, { name, duration, price }, { new: true });
        if (!therapy) {
            return res.status(404).json({ success: false, message: 'Therapy not found' });
        }

        res.json({ success: true, message: 'Therapy updated', therapy: mapTherapyForFrontend(therapy) });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// PATCH /therapies/:id/status
const toggleTherapyStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const therapy = await therapyModel.findById(id);
        if (!therapy) {
            return res.status(404).json({ success: false, message: 'Therapy not found' });
        }

        therapy.isActive = status !== undefined ? status : !therapy.isActive;
        await therapy.save();

        res.json({ success: true, message: 'Therapy status updated', therapy: mapTherapyForFrontend(therapy) });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export { getTherapies, createTherapy, updateTherapy, toggleTherapyStatus };
