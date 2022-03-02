const router = require('express').Router();

const { report } = require('../controllers');

router.get('/report', report.getReportData);

module.exports = router;