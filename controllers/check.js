import Check from '../models/check.js';
import CustomError from '../helpers/CustomError.js';


export async function postCheck(req, res) {

	const check = await Check.create({
		...req.body,
		createdBy: req.user._id
	});

	res.json({
		message: 'check created successfully',
		check
	});
}

// export async function getChecks(req, res) {
    
// }

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
