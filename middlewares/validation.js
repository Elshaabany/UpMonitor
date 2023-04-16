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

export function mongoId(id) { 
	return [
		check(id).isMongoId().withMessage('invalid ID'),
		handleErrors
	]; 	
}

const optionalNum = (name) => body(name).optional().customSanitizer(Number).custom(value => value > 0).withMessage(`${name} must be a positive number`);
const authenticationHeaderString = (name) => body(name).optional().isString().trim().withMessage('authentication header must have username and password with string values');

export const validCheck = [
	body('name').isString().trim().notEmpty().escape().withMessage('invalid name!'),
	body('url').isURL({require_protocol: true}).trim().withMessage('URL is not valid'),
	body('protocol').isString().trim().notEmpty().escape().toLowerCase().isIn(['http', 'https', 'tcp']).withMessage('Protocol Must be HTTP, HTTPS or TCP'),
	body('path').optional().isURL({ require_host: false, require_port: false }).trim().withMessage('wrong path format'),
	body('port').optional().isPort().trim().escape().withMessage('port is not valid'),
	body('webhook').optional().isURL().trim().withMessage('webhook URL is not valid'),
	optionalNum('timeout'),
	optionalNum('interval'),
	optionalNum('threshold'),
	authenticationHeaderString('authentication.username'),
	authenticationHeaderString('authentication.password'),
	body('httpHeaders').optional().isObject().withMessage('httpHeaders must be key/value pairs object'),
	body('assert.statusCode').optional().customSanitizer(Number).custom(value => (value >= 100 && value < 600)).withMessage('status code is not valid'),
	body('tags').optional().isArray().withMessage('wrong tags format'),
	body('ignoreSSL').isBoolean().withMessage('ignoreSSL must be boolean'),
	handleErrors
];

export const verificationCode = body('code').customSanitizer(Number).custom(value => (value >= 100000  && value <= 999999 )).withMessage('verificatiiion code not valid');