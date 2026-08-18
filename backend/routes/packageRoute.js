import express from 'express';
import { getPackages, createPackage, getPackageById, updatePackage, togglePackageStatus } from '../controllers/packageController.js';
import authAdmin from '../middleware/authAdmin.js';

const packageRouter = express.Router();

packageRouter.get('/', getPackages);
packageRouter.get('/:id', getPackageById);
packageRouter.post('/', authAdmin, createPackage);
packageRouter.put('/:id', authAdmin, updatePackage);
packageRouter.patch('/:id/status', authAdmin, togglePackageStatus);

export default packageRouter;
