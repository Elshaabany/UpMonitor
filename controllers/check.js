const Check = require('../models/check');
const CustomError = require('../helpers/CustomError');

exports.postCheck = async (req, res, next) => {

    const check = await Check.create({
       ...req.body,
       createdBy: req.user._id
    });

    res.json({
        message: "check created successfully",
        check
    })
};

exports.getChecks = async (req, res, next) => {
    const tag = req.params.tag;
    const checks = await Check.find({tags: tag, createdBy: req.user._id});
    if(!check) throw new CustomError('no checks found', 404);
    res.json({
	checks
    });
};

exports.getCheck = async (req, res, next) => {
    
    const check = await Check.findById(req.params.checkId);
    if (!check) throw new CustomError('check not found', 404);

    res.json({
        check
    })

};

exports.putCheck = async (req, res, next) => {

    const check = await Check.findById(req.params.checkId);
    if (!check) throw new CustomError('check not found', 404);

    await check.updateOne(req.body);

    res.json({
        message: "check updated successfully",
    });

};

exports.deleteCheck = async (req, res, next) => {

    const check = await Check.findById(req.params.checkId);
    if (!check) throw new CustomError('check not found', 404);

    await check.delete();
    
    res.json({
        message: "check deleted successfully"
    })
};
