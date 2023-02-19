const express = require('express');
const router = express.Router();

const checkController = require('../controllers/check');
const { isAuth } = require('../middlewares/auth');

router.use(isAuth);

router.post('/', checkController.postCheck);

router.get('/', checkController.getChecks);

router.get('/:checkId', checkController.getCheck);

router.put('/:checkId', checkController.putCheck);

router.delete('/:checkId', checkController.deleteCheck);

module.exports = router;