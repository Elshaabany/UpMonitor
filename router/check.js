import { Router } from 'express';
const router = Router();

import {
	postCheck,
	getCheck,
	getChecks,
	putCheck,
	deleteCheck,
} from '../controllers/check.js';
import { isAuth } from '../middlewares/auth.js';
import { validCheck, mongoId } from '../middlewares/validation.js';

router.use(isAuth);

router.post('/', validCheck, postCheck);

router.get('/', getChecks);

router.get('/:checkId', mongoId('checkId'), getCheck);

router.put('/:checkId', mongoId('checkId'), validCheck, putCheck);

router.delete('/:checkId', mongoId('checkId'), deleteCheck);

export default router;
