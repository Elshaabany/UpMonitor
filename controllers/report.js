const Check = require('../models/check');
const CustomError = require('../helpers/CustomError');

exports.getReports = async (req, res, next) => {


};

exports.getReport = async (req, res, next) => {

    const check = await Check.findById(req.params.checkId);
    if (!check) throw new CustomError('check not found', 404);

    res.json({
        report: check.report
    })

};
