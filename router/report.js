import { Router } from 'express';
const router = Router();

import { getReports, getReport } from '../controllers/report.js';
import { isAuth } from '../middlewares/auth.js';
import { mongoId } from '../middlewares/validation.js';

router.use(isAuth);

router.get('/', getReports);

router.get('/:checkId', mongoId('checkId'), getReport);

export default router;
