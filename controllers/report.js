import Check from '../models/check.js';
import CustomError from '../helpers/CustomError.js';

export async function getReports(req, res) {
	let page = req.query.page;
	page = page > 0 ? page : 1;
	let size = req.query.size;
	size = size > 0 ? size : 0;

	const checks = await Check.find({
		createdBy: req.user._id,
		tags: { $in: req.query.tag },
	})
		.skip((page - 1) * size)
		.limit(size);
	// if (checks.length === 0) throw new CustomError('no checks found', 404);

	res.json({
		reports: checks.map((c) => c.report),
	});
}

export async function getReport(req, res) {
	const check = await Check.findById(req.params.checkId);
	if (!check) throw new CustomError('check not found', 404);

	res.json({
		report: check.report,
	});
}
