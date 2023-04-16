import process from 'node:process';
import { host, port } from './util/config.js';
import db from './util/db.js';
import express, { json } from 'express';
import 'express-async-errors';

import userRouter from './router/user.js';
import checkRouter from './router/check.js';
import reportRouter from './router/report.js';

const app = express();

app.use(json());
app.use((req, res, next) => {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
	next();
});

app.use('/user', userRouter);
app.use('/check', checkRouter);
app.use('/report', reportRouter);

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
	res.status(err.statusCode || 500).json({ message: err.message, errors: err.errors });
});

db()
	.then(() => {
		app.listen(port, () => {
			console.log(`server running at http://${host}:${port}`);
		});
	})
	.catch(err => {
		console.log(err);
		process.exit(1);
	});