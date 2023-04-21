import Check from '../models/check.js';
import User from '../models/user.js';
import { Monitor } from 'availability-monitor';
import { transport } from '../util/mail.js';
import { senderMail } from '../util/config.js';
import axios from 'axios';

const notify = (user, msg, check) => {
	transport
		.sendMail({
			to: user.email,
			from: senderMail,
			subject: 'URL status update',
			html: `<h2> ${msg} </h2>`,
		})
		.then(console.log)
		.catch(console.log);

	if (check.webhook) {
		const payload = {
			message: msg,
		};

		axios
			.post(check.webhook, payload)
			.then((response) => {
				console.log(`statusCode: ${response.status}`);
			})
			.catch((error) => {
				console.error(error);
			});
	}
};

export default async function createMonitor(check) {
	const user = await User.findById(check.createdBy);

	const URLMonitor = new Monitor({
		protocol: check.protocol == 'TCP' ? 'tcp' : 'web',
		protocolOptions: {
			url: check.url,
			engine: 'got',
			httpOptions: {
				protocol: check.protocol.toLowerCase().concat(':'),
				port: check.port,
				path: check.path,
				timeout: check.timeoutPerSec * 1000,
				headers: {
					// eslint-disable-next-line no-undef
					Authorization: Buffer.from(
						'Basic '.concat(
							check.authentication.username
								.concat(':')
								.concat(check.authentication.password)
						)
					).toString('base64'),
					...check.httpHeaders,
				},
			},
			ignoreSSL: check.ignoreSSL,
			expect: {
				statusCode: check.assert.statusCode || 200,
			},
		},
		interval: (check.intervalPerMin / 100) * 60000,
	});

	URLMonitor.on('up', async function (monitor, response) {
		check = await Check.findById(check._id);
		if (!check) {
			monitor.stop();
			return;
		}

		if (
			check.report.history.length == 0 ||
			check.report.history.at(-1).status === 'DOWN'
		) {
			notify(user, `your URL ${check.name} is now Up!`, check);
		}

		check.report = {
			status: 'UP',
			history: [
				...check.report.history,
				{
					timestamp: new Date(),
					responseTime: response.duration,
					status: 'UP',
				},
			],
			outagesTotalNum: check.report.outagesTotalNum || 0,
			downtimeTotalSec: check.report.downtimeTotalSec || 0,
			uptimeTotalSec:
				check.report.uptimeTotalSec + check.intervalPerMin * 60 || 0,
			responseTimeAvgMs:
				check.report.history.reduce(
					(p, c) => (c.status === 'UP' ? p + c.responseTime : p),
					0
				) /
					(check.report.history.length - check.report.outagesTotalNum) ||
				response.duration,
			availabilityPercentage:
				(check.report.history.reduce(
					(p, c) => (c.status === 'UP' ? (p += 1) : p),
					0
				) /
					check.report.history.length) *
					100 || 0,
		};
		await check.save();

		console.log(
			`URL is up from up event handler. Response Time: ${response.duration}ms`
		);
	});

	URLMonitor.on('error', async function (monitor, response) {
		check = await Check.findById(check._id);
		if (!check) {
			monitor.stop();
			return;
		}

		if (
			check.report.history.length == 0 ||
			check.report.history.at(-1).status === 'UP'
		) {
			notify(user, `your URL ${check.name} is Down now!`, check);
		}

		check.report = {
			status: 'DOWN',
			history: [
				...check.report.history,
				{
					timestamp: new Date(),
					responseTime: response.duration,
					status: 'DOWN',
				},
			],
			outagesTotalNum: (check.report.outagesTotalNum += 1 || 1),
			downtimeTotalSec:
				check.report.downtimeTotalSec + check.intervalPerMin * 60 || 0,
			uptimeTotalSec: check.report.uptimeTotalSec || 0,
			responseTimeAvgMs: check.report.responseTimeAvgMs,
			availabilityPercentage:
				(check.report.history.reduce(
					(p, c) => (c.status === 'UP' ? (p += 1) : p),
					0
				) /
					check.report.history.length) *
					100 || 0,
		};
		await check.save();

		console.log(
			`URL is down from down event handler. Response Time: ${response.duration}ms`
		);
	});
}
