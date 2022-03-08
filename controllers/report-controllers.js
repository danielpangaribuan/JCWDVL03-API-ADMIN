const utils = require('../utils');
const db = require('../database').promise();
// const moment = require('moment-timezone');

const getReportData = async (req, res) => {
    
}

const getTotalSales = async (req, res) => {
    try {
        const GET_TOTAL_QUERY = `SELECT 
                                    ts.*, tp.*, tm.*, tr.*
                                FROM
                                    (SELECT 
                                        COUNT(*) AS total_sales
                                    FROM
                                        transaction AS t
                                    WHERE
                                        t.status_id = 7) AS ts,
                                    (SELECT 
                                        SUM(cd.quantity * (p.price - p.capital_price)) AS total_profit
                                    FROM
                                        transaction AS t, cart_detail AS cd, product AS p
                                    WHERE
                                        cd.product_id = p.id
                                            AND t.cart_id = cd.cart_id
                                            AND t.status_id = 7) AS tp,
                                    (SELECT 
                                        SUM(cd.quantity * p.price) AS total_revenue
                                    FROM
                                        transaction AS t, cart_detail AS cd, product AS p
                                    WHERE
                                        cd.product_id = p.id
                                            AND t.cart_id = cd.cart_id
                                            AND t.status_id = 7) AS tr,
                                    (SELECT 
                                        COUNT(*) AS total_member
                                    FROM
                                        user AS u
                                    WHERE
                                        u.role_id = 1) AS tm;`;
    
        const [ data_total ] = await db.execute(GET_TOTAL_QUERY);

        const data = data_total;
    
        res.status(200).send(new utils.CreateRespond(
            200,
            'Success',
            data
        ));
    } catch (error) {
        console.log(error);
    }

}

const getProductSales = async (req, res) => {
    try {
        const GET_PRODUCT_SALES = `SELECT 
                                        p.product_name AS x, CAST(SUM(cd.quantity) AS UNSIGNED) AS y
                                    FROM
                                        transaction AS t,
                                        cart_detail AS cd,
                                        product AS p
                                    WHERE
                                        t.status_id = 7
                                            AND t.cart_id = cd.cart_id
                                            AND cd.product_id = p.id
                                    GROUP BY p.product_name;`
        
        const [ data_product_sales ] = await db.execute(GET_PRODUCT_SALES);

        const data = data_product_sales;

        res.status(200).send(new utils.CreateRespond(
            200,
            'Success',
            data
        ))
    } catch (error) {
        console.log(error)
    }
}

const getIncomeStatement = async (req, res) => {
    try {
        const GET_INCOME_STATEMENT = `SELECT 
                                        SUM(cd.quantity * p.price) AS revenue,
                                        SUM(cd.quantity * (p.price - p.capital_price)) AS net_income,
                                        ROUND(((SUM(cd.quantity * p.price) - SUM(cd.quantity * p.capital_price)) / SUM(cd.quantity * p.price) * 100), 2) AS profit_margin,
                                        CONCAT(MONTH(t.created_at), '/', YEAR(t.created_at)) AS month
                                    FROM
                                        transaction AS t, cart_detail AS cd, product AS p
                                    WHERE 
                                        cd.product_id = p.id
                                            AND t.cart_id = cd.cart_id
                                            AND t.status_id = 7
                                    GROUP BY month;`;
        const [ get_income_statement ] = await db.execute(GET_INCOME_STATEMENT);

        const data = get_income_statement;
        res.status(200).send(new utils.CreateRespond(
            200,
            'Success',
            data
        ));
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    getReportData,
    getTotalSales,
    getProductSales,
    getIncomeStatement
}