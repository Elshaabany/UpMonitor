import { model, Schema } from 'mongoose';
import { promisify } from 'util';
import { hash, compare } from 'bcrypt';
import jwt from 'jsonwebtoken';
const { sign, verify } = jwt;
import _ from 'lodash';

import CustomError from '../helpers/CustomError.js';

const singJWT = promisify(sign);
const verifyJWT = promisify(verify);

import { saltRounds, JWT_Secret } from '../util/config.js';

const userSchema = new Schema(
	{
		username: {
			type: String,
			required: true,
			unique: true,
		},

		email: {
			type: String,
			required: true,
			unique: true,
		},

		isVerified: {
			type: Boolean,
			default: false,
		},

		verificationCode: {
			type: Number,
			require: true,
		},

		password: {
			type: String,
			require: true,
		},
	},
	{
		toJSON: {
			transform: (doc, ret) => _.pick(ret, ['username', 'email', '_id']),
		},
	}
);

userSchema.pre('validate', async function (next) {
	if (this.isModified('username')) {
		if (await User.exists({ username: this.username }))
			throw new CustomError('username already exist', 400);
	}

	if (this.isModified('email')) {
		if (await User.exists({ email: this.email }))
			throw new CustomError('email already exist', 400);
	}
	next();
});

userSchema.pre('save', async function (next) {
	if (this.isModified('password')) {
		this.password = await hash(this.password, saltRounds);
	}
	next();
});

userSchema.methods.checkPassword = function (plainPassword) {
	return compare(plainPassword, this.password);
};

userSchema.methods.generateToken = function () {
	return singJWT({ id: this.id }, JWT_Secret, { expiresIn: '10h' });
};

userSchema.statics.getUserFromToken = async function (token) {
	const User = this;
	const { id } = await verifyJWT(token, JWT_Secret);
	const user = await User.findById(id);
	return user;
};

const User = model('User', userSchema);

export default User;
