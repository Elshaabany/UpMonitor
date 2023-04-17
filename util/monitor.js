import Check from '../models/check.js';
import { Monitor } from 'availability-monitor';


export default function createMonitor(check) {

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
					...check.authentication,							// check autthentication format
					...check.httpHeaders
				}
			},
			ignoreSSL: check.ignoreSSL,
			expect: {
				statusCode: check.assert.statusCode || 200
			}
		},
		interval: (check.intervalPerMin / 100) * 60000
	});

	URLMonitor.on('up', async function (monitor, response) {
        
		check = await Check.findById(check._id);
		if(!check) {
			monitor.stop();
			return;
		}
		check.report = {
			status: 'UP',
			history: [...check.report.history,{
				timestamp: new Date(),
				responseTime: response.duration,
				status: 'UP'
			}],
			outagesTotalNum: check.report.outagesTotalNum || 0,
			downtimeTotalSec: check.report.downtimeTotalSec || 0,
			uptimeTotalSec: check.report.uptimeTotalSec + check.intervalPerMin * 60 || 0,
			responseTimeAvgMs: check.report.history.reduce( (p, c) => (c.status === 'UP' ? p + c.responseTime : p), 0) / (check.report.history.length - check.report.outagesTotalNum) || response.duration,
			availabilityPercentage: check.report.history.reduce( (p, c) => (c.status === 'UP' ? p += 1 : p) , 0) / check.report.history.length * 100 || 0,
		};
		await check.save();
        
		console.log(`web site is up from up event handler. Response Time: ${response.duration}ms`);
	});

	URLMonitor.on('error', async function (monitor, response) {
        
		check = await Check.findById(check._id);
		if(!check) {
			monitor.stop();
			return;
		}
		check.report = {
			status: 'DOWN',
			history: [...check.report.history,{
				timestamp: new Date(),
				responseTime: response.duration,
				status: 'DOWN'
			}],
			outagesTotalNum: check.report.outagesTotalNum += 1 || 1,
			downtimeTotalSec: check.report.downtimeTotalSec + check.intervalPerMin * 60 || 0,
			uptimeTotalSec: check.report.uptimeTotalSec || 0,
			responseTimeAvgMs: check.report.responseTimeAvgMs,
			availabilityPercentage: check.report.history.reduce( (p, c) => (c.status === 'UP' ? p += 1 : p), 0) / check.report.history.length * 100 || 0,
		};
		await check.save();

		console.log(`web site is down from down event handler. Response Time: ${response.duration}ms`);
	});
}