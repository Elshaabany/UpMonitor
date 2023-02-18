const express = require('express');
const router = express.Router();

const userController = require('../controllers/user');

const {isAuth} = require('../middlewares/auth');
const validator = require('../middlewares/validation');

router.post('/signup', validator.signUp, userController.postSignup);

router.post('/verify', isAuth,  userController.postVerify);

router.post('/signin', validator.signIn, userController.postSignin);

module.exports = router;