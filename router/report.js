const express = require('express');
const router = express.Router();

const reportController = require('../controllers/report');

router.get('/', reportController.getReports);

router.get('/:reportId', reportController.getReport);

module.exports = router;