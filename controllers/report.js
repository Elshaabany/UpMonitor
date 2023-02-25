import Check from '../models/check.js';
import CustomError from '../helpers/CustomError.js';

export async function getReports(req, res) {

	const tag = req.params.tag;
    
	const checks = await Check.find({ tags: tag, createdBy: req.user._id });
	if (!checks) throw new CustomError('no checks found', 404);

	res.json({
		checks
	});

}

export async function getReport(req, res) {

	const check = await Check.findById(req.params.checkId);
	if (!check) throw new CustomError('check not found', 404);

	res.json({
		report: check.report
	});

}
