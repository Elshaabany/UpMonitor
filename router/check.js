import { Router } from 'express';
const router = Router();

import { postCheck, getCheck, putCheck, deleteCheck } from '../controllers/check.js';
import { isAuth } from '../middlewares/auth.js';

router.use(isAuth);

router.post('/', postCheck);

// router.get('/', getChecks);

router.get('/:checkId', getCheck);

router.put('/:checkId', putCheck);

router.delete('/:checkId', deleteCheck);

export default router;