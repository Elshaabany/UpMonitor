import supertest from 'supertest';
import app from '../app.js';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import User from '../models/user.js';

const request = supertest(app);

beforeAll(async () => {
	const mongoServer = await MongoMemoryServer.create();
	await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
	await mongoose.disconnect();
	await mongoose.connection.close();
});

describe('Test user endpoint', () => {
	const newUser = {
		username: 'newUser',
		email: 'newUser@new.com',
		password: 'NewUser_1234',
		confirmPassword: 'NewUser_1234',
	};

	const invalidUser = {
		username: 'newUser',
		email: 'invalid-email',
		password: 'short',
		confirmPassword: 'mismatch',
	};

	let user, token;

	describe('POST /user/signup Register New User', () => {
		describe('given correct new username email and correct password format', () => {
			it('should signup new user and return the user data with status 200', async () => {
				const res = await request
					.post('/user/signup')
					.set('Content-Type', 'application/json')
					.set('Accept', 'application/json')
					.send(newUser);
				expect(res.status).toBe(200);
				expect(res.headers['content-type']).toMatch(/json/);
				expect(res.body).toHaveProperty('message', 'user created successfully');
				expect(res.body.user).toHaveProperty('username', newUser.username);
				expect(res.body.user).toHaveProperty('email', newUser.email.toLowerCase());
				expect(res.body).toHaveProperty('token');
				user = await User.findById(res.body.user._id);
				token = res.body.token;
			});
		});

		describe('given repeated username or email', () => {
			it('should respond with status 400 and error message', async () => {
				const res = await request
					.post('/user/signup')
					.set('Content-Type', 'application/json')
					.set('Accept', 'application/json')
					.send(newUser);

				expect(res.status).toBe(400);
				expect(res.headers['content-type']).toMatch(/json/);
				expect(res.body.message).toMatch(/already exist/);
			});
		});

		describe('given invalid data format', () => {
			it('should respond with status 400 and error message with list of errors', async () => {
				const res = await request
					.post('/user/signup')
					.set('Content-Type', 'application/json')
					.set('Accept', 'application/json')
					.send(invalidUser);
				expect(res.status).toBe(400);
				expect(res.headers['content-type']).toMatch(/json/);
				expect(res.body).toHaveProperty('errors');
			});
		});
	});

	describe('POST /user/signin Login User', () => {
		describe('given correct user name and password', () => {
			it('should respond with 200 and return user data and token', async () => {
				const res = await request
					.post('/user/signin')
					.set('Content-Type', 'application/json')
					.set('Accept', 'application/json')
					.send({ email: newUser.email, password: newUser.password });
				expect(res.status).toBe(200);
				expect(res.headers['content-type']).toMatch(/json/);
				expect(res.body).toHaveProperty('user');
				expect(res.body.user).toHaveProperty('username', newUser.username);
				expect(res.body.user).toHaveProperty('email', newUser.email.toLowerCase());
				expect(res.body).toHaveProperty('token');
				token = res.body.token;
			});
		});

		describe('given invalid email or password format', () => {
			it('should respond with 401 and return error message', async () => {
				const res = await request
					.post('/user/signin')
					.set('Content-Type', 'application/json')
					.set('Accept', 'application/json')
					.send({ email: invalidUser.email, password: invalidUser.password });
				expect(res.status).toBe(400);
				expect(res.headers['content-type']).toMatch(/json/);
				expect(res.body).toHaveProperty('errors');
			});
		});

		describe('given wrong login credentials', () => {
			it('should respond with 401 and return error message', async () => {
				const res = await request
					.post('/user/signin')
					.set('Content-Type', 'application/json')
					.set('Accept', 'application/json')
					.send({ email: 'wrong@wrong.mail', password: 'Wrong_pass123' });
				expect(res.status).toBe(401);
				expect(res.headers['content-type']).toMatch(/json/);
				expect(res.body).toHaveProperty('message', 'email or password is not correct');
			});
		});
	});

	describe('POST /user/verify Verify the account', () => {
		describe('given wrong activation code', () => {
			it('should respond with 400 and error message', async () => {
				const res = await request
					.post('/user/verify')
					.set('Content-Type', 'application/json')
					.set('Accept', 'application/json')
					.set('Authorization', token)
					.send({ code: 'wrong_Code' });
				expect(res.status).toBe(400);
				expect(res.headers['content-type']).toMatch(/json/);
				expect(res.body).toHaveProperty('message');
				expect(res.body.message).toMatch(/wrong verification code/);
			});
		});

		describe('given the right activation code', () => {
			it('should respond with 200 and verified successfully message', async () => {
				const res = await request
					.post('/user/verify')
					.set('Content-Type', 'application/json')
					.set('Accept', 'application/json')
					.set('Authorization', token)
					.send({ code: user.verificationCode });
				expect(res.status).toBe(200);
				expect(res.headers['content-type']).toMatch(/json/);
				expect(res.body).toHaveProperty('message', 'email verified successfully');
			});
		});
	});
});
