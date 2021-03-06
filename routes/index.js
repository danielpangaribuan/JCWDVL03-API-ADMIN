const router = require('express').Router();
const user_routes = require('./user-routes');
const transaction_routes = require('./transaction-routes');
const combo_routes = require('./combo-routes');
const report_routes = require('./report-routes');
const product_routes = require('./product-routes');
router.get('/', (req, res) => {
    res.status(200).send(`<h1>Welcome to My APIs</h1>`);
});

module.exports = {
    home_route : router,
    user_routes,
    transaction_routes,
    combo_routes,
    report_routes,
    product_routes,

} 