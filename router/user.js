import { Router } from 'express';
const router = Router();

import { postSignup, postVerify, postSignin } from '../controllers/user.js';

import { isAuth } from '../middlewares/auth.js';
import { signUp, signIn, verificationCode } from '../middlewares/validation.js';

router.post('/signup', signUp, postSignup);

router.post('/verify', verificationCode, isAuth, postVerify);

router.post('/signin', signIn, postSignin);

export default router;
