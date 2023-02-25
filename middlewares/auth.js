import User from '../models/user.js';
import CustomError from '../helpers/CustomError.js';

export async function isAuth(req, res, next) {
	const token = req.headers.authorization;
	if (!token) throw new CustomError('login Required', 401, token);

	req.user = await User.getUserFromToken(token);
	if (!req.user) throw new CustomError('user not found', 401, req.user);

	next();
}
