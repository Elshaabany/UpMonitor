import app from './app.js';
import process from 'node:process';
import { host, port } from './util/config.js';
import db from './util/db.js';

db()
	.then(() => {
		app.listen(port, () => {
			console.log(`server running at http://${host}:${port}`);
		});
	})
	.catch((err) => {
		console.log(err);
		process.exit(1);
	});
