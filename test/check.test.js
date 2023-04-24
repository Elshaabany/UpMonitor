import supertest from 'supertest';
import app from '../app.js';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import User from '../models/user.js';

const request = supertest(app);

let userOne, userOneToken, userTwo, userTwoToken, createdCheck;

beforeAll(async () => {
	const mongoServer = await MongoMemoryServer.create();
	await mongoose.connect(mongoServer.getUri());

	userOne = await User.create({
		username: 'newUser',
		email: 'newUser@new.com',
		password: 'NewUser_1234',
		confirmPassword: 'NewUser_1234',
	});
	userOneToken = await userOne.generateToken();

	userTwo = await User.create({
		username: 'userTwo',
		email: 'userTwo@user.com',
		password: 'userTwo_1234',
		confirmPassword: 'userTwo_1234',
	});
	userTwoToken = await userTwo.generateToken();
});

afterAll(async () => {
	await mongoose.disconnect();
	await mongoose.connection.close();
});

describe('Test check endpoint', () => {
	const fullCheck = {
		name: 'localhost Check',
		url: 'http://127.0.0.1',
		protocol: 'HTTP',
		path: '/',
		port: 5000,
		webhook: 'https://webhook.site/91a61644-9b5c-433e-bc7c-298296fd467e',
		timeout: 6,
		interval: 2,
		threshold: 4,
		authentication: {
			username: 'name',
			password: 'pass',
		},
		httpHeaders: {
			Accept: 'application/json',
		},
		assert: {
			statusCode: 200,
		},
		random: 'value',
		tags: ['local'],
		ignoreSSL: true,
		createdBy: 'user_id',
	};

	const minimumCheck = {
		name: 'localhost Check with minimun data',
		url: 'http://127.0.0.1',
		protocol: 'HTTP',
		ignoreSSL: true,
	};

	const wrongCheck = {
		name: 'localhost Check',
		url: '127.0.0.1',
		protocol: 'HTTP',
		path: '/',
		port: 5000,
	};

	describe('POST /check/ Create check', () => {
		describe('given correct check data', () => {
			it('should respond with 200 and created successfully message and check data', async () => {
				const res = await request
					.post('/check/')
					.set('Content-Type', 'application/json')
					.set('Accept', 'application/json')
					.set('Authorization', userOneToken)
					.send(fullCheck);
				expect(res.status).toBe(200);
				expect(res.headers['content-type']).toMatch(/json/);
				expect(res.body).toHaveProperty('message', 'check created successfully');
				expect(res.body).toHaveProperty('check', {
					name: fullCheck.name,
					url: fullCheck.url,
					protocol: fullCheck.protocol.toLowerCase(),
					path: fullCheck.path,
					port: fullCheck.port,
					webhook: fullCheck.webhook,
					timeoutPerSec: fullCheck.timeout,
					intervalPerMin: fullCheck.interval,
					threshold: fullCheck.threshold,
					authentication: fullCheck.authentication,
					httpHeaders: fullCheck.httpHeaders,
					assert: fullCheck.assert,
					tags: fullCheck.tags,
					ignoreSSL: fullCheck.ignoreSSL,
					createdBy: userOne._id.toString(),
					_id: expect.any(String),
				});
				expect(res.body.check).not.toHaveProperty('random');
				expect(res.body.check.createdBy).not.toBe(fullCheck.createdBy);
				createdCheck = res.body.check;
			});
		});

		describe('given minimum check data', () => {
			it('should respond with 200 and created successfully message and check data', async () => {
				const res = await request
					.post('/check/')
					.set('Content-Type', 'application/json')
					.set('Accept', 'application/json')
					.set('Authorization', userOneToken)
					.send(minimumCheck);
				expect(res.status).toBe(200);
				expect(res.headers['content-type']).toMatch(/json/);
				expect(res.body).toHaveProperty('message', 'check created successfully');
				expect(res.body).toHaveProperty('check', {
					name: minimumCheck.name,
					url: minimumCheck.url,
					protocol: minimumCheck.protocol.toLowerCase(),
					timeoutPerSec: 5,
					intervalPerMin: 10,
					threshold: 1,
					tags: [],
					ignoreSSL: minimumCheck.ignoreSSL,
					createdBy: userOne._id.toString(),
					_id: expect.any(String),
				});
			});
		});

		describe('given wrong check data', () => {
			it('should respond with 400 and error message', async () => {
				const res = await request
					.post('/check/')
					.set('Content-Type', 'application/json')
					.set('Accept', 'application/json')
					.set('Authorization', userOneToken)
					.send(wrongCheck);

				expect(res.status).toBe(400);
				expect(res.headers['content-type']).toMatch(/json/);
				expect(res.body.message).toMatch(/error/);
				expect(res.body).toHaveProperty('errors');
			});
		});

		describe('given no JWT Token', () => {
			it('should respond with 401 and error message', async () => {
				const res = await request
					.post('/check/')
					.set('Content-Type', 'application/json')
					.set('Accept', 'application/json')
					.send(fullCheck);

				expect(res.status).toBe(401);
				expect(res.headers['content-type']).toMatch(/json/);
				expect(res.body.message).toMatch(/login Required/);
			});
		});
	});

	describe('GET /check/?tag get checks by tag name', () => {
		describe('given tag names passed on the query parameter', () => {
			it('should respond with 200 and get checks with specified tags', async () => {
				const res = await request
					.get('/check/?tags=local')
					.set('Content-Type', 'application/json')
					.set('Accept', 'application/json')
					.set('Authorization', userOneToken)
					.send();

				expect(res.status).toBe(200);
				expect(res.headers['content-type']).toMatch(/json/);
				expect(res.body).toHaveProperty('checks');
			});
		});

		describe('given no tags specified', () => {
			it('should respond with 200 and return all checks created by the user', async () => {
				const res = await request
					.get('/check/')
					.set('Content-Type', 'application/json')
					.set('Accept', 'application/json')
					.set('Authorization', userOneToken)
					.send();

				expect(res.status).toBe(200);
				expect(res.headers['content-type']).toMatch(/json/);
				expect(res.body).toHaveProperty('checks');
			});
		});

		describe('given the users has no checks', () => {
			it('should respond with 404 and no checks message', async () => {
				const res = await request
					.get('/check/')
					.set('Content-Type', 'application/json')
					.set('Accept', 'application/json')
					.set('Authorization', userTwoToken)
					.send();

				expect(res.status).toBe(404);
				expect(res.headers['content-type']).toMatch(/json/);
				expect(res.body).toHaveProperty('message', 'no checks found');
			});
		});

		describe('given no JWT token', () => {
			it('should respond with 401 and error message', async () => {
				const res = await request
					.get('/check/')
					.set('Content-Type', 'application/json')
					.set('Accept', 'application/json')
					.send();

				expect(res.status).toBe(401);
				expect(res.headers['content-type']).toMatch(/json/);
				expect(res.body.message).toMatch(/login Required/);
			});
		});
	});

	describe('GET /check/:checkId get check by check ID', () => {
		describe('given correct check ID passed as path variable', () => {
			it('should respond with 200 and get the check', async () => {
				const res = await request
					.get(`/check/${createdCheck._id}`)
					.set('Content-Type', 'application/json')
					.set('Accept', 'application/json')
					.set('Authorization', userOneToken)
					.send();

				expect(res.status).toBe(200);
				expect(res.headers['content-type']).toMatch(/json/);
				expect(res.body).toHaveProperty('check', createdCheck);
			});
		});

		describe('given invalid check ID', () => {
			it('should respond with 400 and invalid ID message', async () => {
				const res = await request
					.get('/check/nonValidId')
					.set('Content-Type', 'application/json')
					.set('Accept', 'application/json')
					.set('Authorization', userOneToken)
					.send();

				expect(res.status).toBe(400);
				expect(res.headers['content-type']).toMatch(/json/);
				expect(res.body.message).toMatch(/error/);
				expect(res.body).toHaveProperty('errors');
			});
		});

		describe('given check ID that deleted or does not exist', () => {
			it('should respond with 404 and not found message', async () => {
				const res = await request
					.get(`/check/${userOne._id}`)
					.set('Content-Type', 'application/json')
					.set('Accept', 'application/json')
					.set('Authorization', userOneToken)
					.send();

				expect(res.status).toBe(404);
				expect(res.headers['content-type']).toMatch(/json/);
				expect(res.body.message).toMatch(/not found/);
			});
		});

		describe('given no JWT token', () => {
			it('should respond with 401 and error message', async () => {
				const res = await request
					.get(`/check/${createdCheck._id}`)
					.set('Content-Type', 'application/json')
					.set('Accept', 'application/json')
					.send();

				expect(res.status).toBe(401);
				expect(res.headers['content-type']).toMatch(/json/);
				expect(res.body.message).toMatch(/login Required/);
			});
		});
	});

	describe('PUT /check/:checkId update check', () => {
		describe('given valid check data and correct check ID', () => {
			it('should respond with 200 and updated successfully message', async () => {
				const res = await request
					.put(`/check/${createdCheck._id}`)
					.set('Content-Type', 'application/json')
					.set('Accept', 'application/json')
					.set('Authorization', userOneToken)
					.send(minimumCheck);

				expect(res.status).toBe(200);
				expect(res.headers['content-type']).toMatch(/json/);
				expect(res.body.message).toMatch(/updated successfully/);
			});
		});

		describe('given invalid check ID', () => {
			it('should respond with 400 and invalid ID message', async () => {
				const res = await request
					.put('/check/nonValidId')
					.set('Content-Type', 'application/json')
					.set('Accept', 'application/json')
					.set('Authorization', userOneToken)
					.send(minimumCheck);

				expect(res.status).toBe(400);
				expect(res.headers['content-type']).toMatch(/json/);
				expect(res.body.message).toMatch(/error/);
				expect(res.body).toHaveProperty('errors');
			});
		});

		describe('given check ID that deleted or does not exist', () => {
			it('should respond with 404 and not found message', async () => {
				const res = await request
					.put(`/check/${userOne._id}`)
					.set('Content-Type', 'application/json')
					.set('Accept', 'application/json')
					.set('Authorization', userOneToken)
					.send(minimumCheck);

				expect(res.status).toBe(404);
				expect(res.headers['content-type']).toMatch(/json/);
				expect(res.body.message).toMatch(/not found/);
			});
		});

		describe('given no JWT token', () => {
			it('should respond with 401 and error message', async () => {
				const res = await request
					.put(`/check/${createdCheck._id}`)
					.set('Content-Type', 'application/json')
					.set('Accept', 'application/json')
					.send(minimumCheck);

				expect(res.status).toBe(401);
				expect(res.headers['content-type']).toMatch(/json/);
				expect(res.body.message).toMatch(/login Required/);
			});
		});
	});

	// test reports first before deleting the check

	describe('GET /report/?tag get reports by tag name', () => {
		describe('given tag names passed on the query parameter', () => {
			it('should respond with 200 and get reports with specified tags', async () => {
				const res = await request
					.get('/report/?tags=local')
					.set('Content-Type', 'application/json')
					.set('Accept', 'application/json')
					.set('Authorization', userOneToken)
					.send();

				expect(res.status).toBe(200);
				expect(res.headers['content-type']).toMatch(/json/);
				expect(res.body).toHaveProperty('reports');
			});
		});

		describe('given no JWT token', () => {
			it('should respond with 401 and error message', async () => {
				const res = await request
					.get('/report/')
					.set('Content-Type', 'application/json')
					.set('Accept', 'application/json')
					.send();

				expect(res.status).toBe(401);
				expect(res.headers['content-type']).toMatch(/json/);
				expect(res.body.message).toMatch(/login Required/);
			});
		});
	});

	describe('GET /report/:checkId get report by report ID', () => {
		describe('given correct report ID passed as path variable', () => {
			it('should respond with 200 and get the report', async () => {
				const res = await request
					.get(`/report/${createdCheck._id}`)
					.set('Content-Type', 'application/json')
					.set('Accept', 'application/json')
					.set('Authorization', userOneToken)
					.send();

				expect(res.status).toBe(200);
				expect(res.headers['content-type']).toMatch(/json/);
				expect(res.body).toHaveProperty('report');
			});
		});

		describe('given invalid report ID', () => {
			it('should respond with 400 and invalid ID message', async () => {
				const res = await request
					.get('/report/nonValidId')
					.set('Content-Type', 'application/json')
					.set('Accept', 'application/json')
					.set('Authorization', userOneToken)
					.send();

				expect(res.status).toBe(400);
				expect(res.headers['content-type']).toMatch(/json/);
				expect(res.body.message).toMatch(/error/);
				expect(res.body).toHaveProperty('errors');
			});
		});

		describe('given report ID that deleted or does not exist', () => {
			it('should respond with 404 and not found message', async () => {
				const res = await request
					.get(`/report/${userOne._id}`)
					.set('Content-Type', 'application/json')
					.set('Accept', 'application/json')
					.set('Authorization', userOneToken)
					.send();

				expect(res.status).toBe(404);
				expect(res.headers['content-type']).toMatch(/json/);
				expect(res.body.message).toMatch(/not found/);
			});
		});

		describe('given no JWT token', () => {
			it('should respond with 401 and error message', async () => {
				const res = await request
					.get(`/report/${createdCheck._id}`)
					.set('Content-Type', 'application/json')
					.set('Accept', 'application/json')
					.send();

				expect(res.status).toBe(401);
				expect(res.headers['content-type']).toMatch(/json/);
				expect(res.body.message).toMatch(/login Required/);
			});
		});
	});

	// you can delete the check now

	describe('DELETE /check/:checkId delete check by check ID', () => {
		describe('given correct check ID passed as path variable', () => {
			it('should respond with 200 and delete the check', async () => {
				const res = await request
					.delete(`/check/${createdCheck._id}`)
					.set('Content-Type', 'application/json')
					.set('Accept', 'application/json')
					.set('Authorization', userOneToken)
					.send();

				expect(res.status).toBe(200);
				expect(res.headers['content-type']).toMatch(/json/);
				expect(res.body.message).toMatch(/deleted successfully/);
			});
		});

		describe('given invalid check ID', () => {
			it('should respond with 400 and invalid ID message', async () => {
				const res = await request
					.delete('/check/nonValidId')
					.set('Content-Type', 'application/json')
					.set('Accept', 'application/json')
					.set('Authorization', userOneToken)
					.send();

				expect(res.status).toBe(400);
				expect(res.headers['content-type']).toMatch(/json/);
				expect(res.body.message).toMatch(/error/);
				expect(res.body).toHaveProperty('errors');
			});
		});

		describe('given check ID that deleted or does not exist', () => {
			it('should respond with 404 and not found message', async () => {
				const res = await request
					.delete(`/check/${userOne._id}`)
					.set('Content-Type', 'application/json')
					.set('Accept', 'application/json')
					.set('Authorization', userOneToken)
					.send();

				expect(res.status).toBe(404);
				expect(res.headers['content-type']).toMatch(/json/);
				expect(res.body.message).toMatch(/not found/);
			});
		});

		describe('given no JWT token', () => {
			it('should respond with 401 and error message', async () => {
				const res = await request
					.delete(`/check/${createdCheck._id}`)
					.set('Content-Type', 'application/json')
					.set('Accept', 'application/json')
					.send();

				expect(res.status).toBe(401);
				expect(res.headers['content-type']).toMatch(/json/);
				expect(res.body.message).toMatch(/login Required/);
			});
		});
	});
});
