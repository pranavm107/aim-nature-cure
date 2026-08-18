import therapyPackageModel from '../models/therapyPackageModel.js';

const mapPackageForFrontend = (pkg) => {
    return {
        _id: pkg._id,
        name: pkg.name,
        price: pkg.totalPrice,
        status: pkg.isActive,
        therapies: pkg.includedTherapies.map(t => ({
            therapyId: t.therapy._id || t.therapy,
            count: t.count
        }))
    };
};

// GET /packages
const getPackages = async (req, res) => {
    try {
        const { active } = req.query;
        let query = {};
        if (active === 'true') {
            query.isActive = true;
        } else if (active === 'false') {
            query.isActive = false;
        }

        const pkgs = await therapyPackageModel.find(query).sort({ name: 1 });
        res.json({ success: true, packages: pkgs.map(mapPackageForFrontend) });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// POST /packages
const createPackage = async (req, res) => {
    try {
        const { name, price, therapies } = req.body;
        if (!name || !price || !therapies || therapies.length === 0) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        const includedTherapies = therapies.map(t => ({
            therapy: t.therapyId,
            count: t.count
        }));

        const newPackage = new therapyPackageModel({
            name,
            totalPrice: price,
            includedTherapies
        });
        await newPackage.save();

        res.status(201).json({ success: true, message: 'Package created successfully', package: mapPackageForFrontend(newPackage) });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// GET /packages/:id
const getPackageById = async (req, res) => {
    try {
        const { id } = req.params;
        const pkg = await therapyPackageModel.findById(id);
        if (!pkg) {
            return res.status(404).json({ success: false, message: 'Package not found' });
        }
        res.json({ success: true, package: mapPackageForFrontend(pkg) });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// PUT /packages/:id
const updatePackage = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, price, therapies } = req.body;

        const includedTherapies = therapies.map(t => ({
            therapy: t.therapyId,
            count: t.count
        }));

        const pkg = await therapyPackageModel.findByIdAndUpdate(id, { name, totalPrice: price, includedTherapies }, { new: true });
        if (!pkg) {
            return res.status(404).json({ success: false, message: 'Package not found' });
        }

        res.json({ success: true, message: 'Package updated', package: mapPackageForFrontend(pkg) });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// PATCH /packages/:id/status
const togglePackageStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        const pkg = await therapyPackageModel.findById(id);
        if (!pkg) {
            return res.status(404).json({ success: false, message: 'Package not found' });
        }

        pkg.isActive = status !== undefined ? status : !pkg.isActive;
        await pkg.save();

        res.json({ success: true, message: 'Package status updated', package: mapPackageForFrontend(pkg) });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export { getPackages, createPackage, getPackageById, updatePackage, togglePackageStatus };
