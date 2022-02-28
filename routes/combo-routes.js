const router = require('express').Router();

const { combo } = require('../controllers');

router.get('/combo_status_transaction', combo.getComboStatusTransaction);

module.exports = router;