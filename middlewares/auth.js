const User = require('../models/user');
const Product = require('../models/product');
const Order = require('../models/order');
const CustomError = require('../helpers/CustomError');

exports.isAuth = async (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) throw new CustomError('login Required', 401, token);

    req.user = await User.getUserFromToken(token);
    if (!req.user) throw new CustomError('user not found', 401, req.user);

    next();
};

exports.isAdmin = [ this.isAuth, async (req, res, next) => {

    if (!req.user.isAdmin) throw new CustomError('only Admins can manipulate products', 403);

    next();
}];

exports.isAuthorizedProduct = async (req, res, next) => {

    const product = await Product.findById(req.params.productId);
    if (!product) throw new CustomError('product doesn\'t exist', 404);
    if (!product.isAuthorized(req.user)) throw new CustomError('not Authorized', 403);
    req.product = product;

    next();
};

exports.isAuthorizedOrder = async (req, res, next) => {

    const order = await Order.find(req.params.orderId);
    if (!order) throw new CustomError('order doesn\'t exist', 404);
    if(req.user._id !== order.createdBy) throw new CustomError('not Authorized', 403);

    next();
};