const { body, check, validationResult } = require('express-validator');
const CustomError = require('../helpers/CustomError');

const handleErrors = (req, res, next) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
        throw new CustomError('validation error', 400, error.mapped());
    }
    next();
};

const checkEmail = body('email').trim().isEmail().normalizeEmail({ all_lowercase: true }).withMessage('invalid Email');
const checkPassword = body('password').isStrongPassword;

exports.signUp = [
    body('username').isAlphanumeric('en-US', { ignore: '.-_' }).withMessage('username can only contain Alphanumerics and \'.\' or \'-\' or \'_\''),
    checkEmail,
    checkPassword().withMessage('password must contain at least: 1 Lowercase, 1 uppercase, 1 number, 1 symbol. with minimum length of 8 characters'),
    body('confirmPassword').custom((value, { req }) => value === req.body.password).withMessage('password doesn\'t match'),
    handleErrors
];

exports.signIn = [
    checkEmail,
    checkPassword().withMessage('wrong password format'),
    handleErrors
];

exports.mongoId = (id) => [
    check(id).isMongoId().withMessage('invalid ID'),
    handleErrors
];