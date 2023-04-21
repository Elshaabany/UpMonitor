import Check from '../models/check.js';
import CustomError from '../helpers/CustomError.js';
import createMonitor from '../util/monitor.js';

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
			history: [],
		},
		createdBy: req.user._id,
	});

	createMonitor(check);

	res.json({
		message: 'check created successfully',
		check,
	});
}

export async function getChecks(req, res) {
	let page = req.query.page;
	page = page > 0 ? page : 1;
	let size = req.query.size;
	size = size > 0 ? size : 0;

	const checks = await Check.find({
		createdBy: req.user._id,
		tags: { $in: req.query.tags },
	})
		.skip((page - 1) * size)
		.limit(size);
	if (checks.length === 0) throw new CustomError('no checks found', 404);

	res.json({
		checks,
	});
}

export async function getCheck(req, res) {
	const check = await Check.findById(req.params.checkId);
	if (!check) throw new CustomError('check not found', 404);

	res.json({
		check,
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
		message: 'check deleted successfully',
	});
}
