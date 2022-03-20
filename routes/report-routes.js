const router = require('express').Router();

const { report } = require('../controllers');

router.get('/report', report.getReportData);
router.get('/reportTotalData', report.getTotalSales);
router.get('/reportProductSales', report.getProductSales);
router.get('/reportIncomeStatement', report.getIncomeStatement);
router.get('/numberOfSales', report.numberOfSales);
router.get('/getCostReport', report.getCostReport);
router.get('/reportChurn', report.getChurnReport);

module.exports = router;