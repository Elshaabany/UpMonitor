import mongoose, { Schema as _Schema, model } from 'mongoose';
import { Monitor } from 'availability-monitor';
const { Schema } = mongoose;


import reportSchema from './schema/report.js';

const checkSchema = new Schema({
	name: {
		type: String,
		required: true
	},
	url: {
		type: String,
		required: true
	},
	protocol: {
		type: String,
		enum: ['HTTP', 'HTTPS', 'TCP'],
		required: true
	},
	path: String,
	port: Number,
	webhook: String,
	timeoutPerSec: {
		type: Number,
		default: 5
	},
	intervalPerMin: {
		type: Number,
		default: 10
	},
	threshold: {
		type: Number,
		default: 1
	},
	authentication: {
		username: String,
		password: String
	},
	httpHeaders: [{
		key: String,
		value: String
	}],
	assert: {
		statusCode: Number
	},
	tags: [String],
	ignoreSSL: Boolean,
	report: reportSchema,
	createdBy: {
		type: _Schema.Types.ObjectId,
		ref: 'User',
		required: true
	}
});

checkSchema.post('save', async function () {

	const URLMonitor = new Monitor({

		protocol: this.protocol == 'TCP' ? 'tcp' : 'web',
		protocolOptions: {
			url: this.url,
			engine: 'got',
			httpOptions: {
				protocol: this.protocol.toLowerCase().concat(':'),
				port: this.port,
				path: this.path,
				timeout: this.timeoutPerSec * 1000,
				headers: {
					authentication: this.authentication,
					// add http Headers
				}
			},
			ignoreSSL: this.ignoreSSL,
			expect: {
				statusCode: this.assert.statusCode || 200
			}
		},
		interval: this.intervalPerMin * 60000
	});

	URLMonitor.on('start', function (monitor, response) {
		// Do something with the response
		// console.log(monitor,response);
		console.log(`BBC News is up. Response Time: ${response.duration}ms`);
	});

	URLMonitor.on('up', function (monitor, response) {
		// Do something with the response
		// console.log(monitor,response);
		console.log(`BBC News is up. Response Time: ${response.duration}ms`);
	});

	URLMonitor.on('error', function (monitor, response) {
		// Do something on error
		// console.log(monitor,response);
		console.log(`Could not connect to BBC News. Error: ${response}`);
	});
	
});

export default model('Check', checkSchema);