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

exports.product = [
    body('name').isString().trim().notEmpty().escape().withMessage('enter valid name'),
    body('price').customSanitizer(Number).custom(value => value > 0).withMessage('enter valid price'),
    body('URL').trim().isURL().withMessage('enter valid URL'),
    body('description').isString().trim().escape().withMessage('description not valid'),
    handleErrors
];

exports.quantity = [
    check('q').customSanitizer(Number).custom(value => value > 0).withMessage('invalid quantity'),
    handleErrors
];

exports.orderStatus = [
    body('status').isString().trim().notEmpty().escape().isIn(['pending', 'accepted', 'out-for-deleviry', 'delivered', 'canceled']).withMessage('enter valid status'),
    handleErrors
];