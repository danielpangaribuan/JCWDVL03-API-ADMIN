const router = require('express').Router();

const { transaction } = require('../controllers');

router.get('/transactions', transaction.getTransactionData);
router.get('/transactions/:id', transaction.getDetailTransaction);
router.patch('/transactions/:id', transaction.updateStatusTransaction);

module.exports = router;