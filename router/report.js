const express = require('express');
const router = express.Router();

const reportController = require('../controllers/report');
const { isAuth } = require('../middlewares/auth');

router.use(isAuth);

router.get('/', reportController.getReports);

router.get('/:checkId', reportController.getReport);

module.exports = router;