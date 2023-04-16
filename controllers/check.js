import Check from '../models/check.js';
import CustomError from '../helpers/CustomError.js';
import { Monitor } from 'availability-monitor';


export async function postCheck(req, res) {

	let check = await Check.create({
		...req.body,
		report: {
			status: 'DOWN',
			availabilityPercentage: 0,
			outagesTotalNum: 0,
			downtimeTotalSec: 0,
			uptimeTotalSec: 0,
			responseTimeAvgMs: 0,
			history: []
		},
		createdBy: req.user._id
	});

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

	res.json({
		message: 'check created successfully',
		check
	});
}

export async function getChecks(req, res) {

	let page = req.query.page;
	page = page > 0 ? page : 1;
	let size = req.query.size;
	size = size > 0 ? size : 0;

	const checks = await Check.find({createdBy: req.user._id, tags: { $in: req.query.tags }}).skip((page - 1) * size).limit(size);
	if (!checks) throw new CustomError('no checks found', 404);

	res.json({
		checks
	});
    
}

export async function getCheck(req, res) {
    
	const check = await Check.findById(req.params.checkId);
	if (!check) throw new CustomError('check not found', 404);

	res.json({
		check
	});

}

export async function putCheck(req, res) {

	const check = await Check.findById(req.params.checkId);
	if (!check) throw new CustomError('check not found', 404);

	await check.updateOne(req.body);

	res.json({
		message: 'check updated successfully',
	});

}

export async function deleteCheck(req, res) {

	const check = await Check.findById(req.params.checkId);
	if (!check) throw new CustomError('check not found', 404);

	await check.delete();
    
	res.json({
		message: 'check deleted successfully'
	});
}