const user_controllers = require('./user-controllers');
const transaction_controllers = require('./transaction-controllers');
const combo_controllers = require('./combo-controllers');
const report_controllers = require('./report-controllers');
const product_controller = require('./product-controller');

module.exports = {
    user: user_controllers,
    transaction: transaction_controllers,
    combo: combo_controllers,
    report: report_controllers,
    products: product_controller,
}