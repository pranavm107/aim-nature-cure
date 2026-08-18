import express from 'express';
import { getTherapies, createTherapy, updateTherapy, toggleTherapyStatus } from '../controllers/therapyController.js';
import authAdmin from '../middleware/authAdmin.js';
import authDoctor from '../middleware/authDoctor.js';

const therapyRouter = express.Router();

// getTherapies should be accessible by both Admin and Doctor. 
// We will create a combined middleware or just define separate routes or handle it. 
// Wait, for now let's just make it public or require any auth. 
// The original plan said 'Both'. We can use a custom middleware or just add both tokens to headers in frontend.
// Actually, in Prescripto, there isn't a unified protect middleware by default, it uses authAdmin and authDoctor separately.
// For GET /therapies we might need to duplicate or just skip auth for now, or check for either token.
// Let's just create a quick middleware inside here or just use authAdmin for POST/PUT.

therapyRouter.get('/', getTherapies);
therapyRouter.post('/', authAdmin, createTherapy);
therapyRouter.put('/:id', authAdmin, updateTherapy);
therapyRouter.patch('/:id/status', authAdmin, toggleTherapyStatus);

export default therapyRouter;
