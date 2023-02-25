import { body, check, validationResult } from 'express-validator';
import CustomError from '../helpers/CustomError.js';

const handleErrors = (req, res, next) => {
	const error = validationResult(req);
	if (!error.isEmpty()) {
		throw new CustomError('validation error', 400, error.mapped());
	}
	next();
};

const checkEmail = body('email').trim().isEmail().normalizeEmail({ all_lowercase: true }).withMessage('invalid Email');
const checkPassword = body('password').isStrongPassword;

export const signUp = [
	body('username').isAlphanumeric('en-US', { ignore: '.-_' }).withMessage('username can only contain Alphanumerics and \'.\' or \'-\' or \'_\''),
	checkEmail,
	checkPassword().withMessage('password must contain at least: 1 Lowercase, 1 uppercase, 1 number, 1 symbol. with minimum length of 8 characters'),
	body('confirmPassword').custom((value, { req }) => value === req.body.password).withMessage('password doesn\'t match'),
	handleErrors
];

export const signIn = [
	checkEmail,
	checkPassword().withMessage('wrong password format'),
	handleErrors
];

export function mongoId(id) { return [
	check(id).isMongoId().withMessage('invalid ID'),
	handleErrors
]; 	}