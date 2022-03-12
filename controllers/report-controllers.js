const utils = require('../utils');
const db = require('../database').promise();
// const moment = require('moment-timezone');

const getReportData = async (req, res) => {
    
}

const getTotalSales = async (req, res) => {
    try {
        const { start_date, end_date } = req.query;
        const GET_TOTAL_QUERY = `SELECT 
                                    ts.*, tp.*, tm.*, tr.*
                                FROM
                                    (SELECT 
                                        COUNT(*) AS total_sales
                                    FROM
                                        transaction AS t
                                    WHERE
                                        t.status_id = 7 AND
                                        t.created_at BETWEEN IFNULL(${start_date ? `'${start_date}'` : null}, t.created_at) AND IFNULL(${end_date ? `'${end_date}'` : null}, t.created_at)) AS ts,
                                    (SELECT 
                                        SUM(cd.quantity * (p.price - p.capital_price)) AS total_profit
                                    FROM
                                        transaction AS t, cart_detail AS cd, product AS p
                                    WHERE
                                        cd.product_id = p.id
                                            AND t.cart_id = cd.cart_id
                                            AND t.status_id = 7
                                            AND t.created_at BETWEEN IFNULL(${start_date ? `'${start_date}'` : null}, t.created_at) AND IFNULL(${end_date ? `'${end_date}'` : null}, t.created_at)) AS tp,
                                    (SELECT 
                                        SUM(cd.quantity * p.price) AS total_revenue
                                    FROM
                                        transaction AS t, cart_detail AS cd, product AS p
                                    WHERE
                                        cd.product_id = p.id
                                            AND t.cart_id = cd.cart_id
                                            AND t.status_id = 7
                                            AND t.created_at BETWEEN IFNULL(${start_date ? `'${start_date}'` : null}, t.created_at) AND IFNULL(${end_date ? `'${end_date}'` : null}, t.created_at)) AS tr,
                                    (SELECT 
                                        COUNT(*) AS total_member
                                    FROM
                                        user AS u
                                    WHERE
                                        u.role_id = 1
                                        AND u.created_at BETWEEN IFNULL(${start_date ? `'${start_date}'` : null}, u.created_at) AND IFNULL(${end_date ? `'${end_date}'` : null}, u.created_at)) AS tm;`;
    
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
        const { start_date, end_date } = req.query;
        const GET_PRODUCT_SALES = `SELECT 
                                        p.product_name AS product_name,
                                        CAST(SUM(cd.quantity) AS UNSIGNED) AS quantity,
                                        SUM(p.price * cd.quantity) AS revenue,
                                        SUM((p.price - p.capital_price) * cd.quantity) AS net_income
                                    FROM
                                        transaction AS t,
                                        cart_detail AS cd,
                                        product AS p
                                    WHERE
                                        t.status_id = 7
                                            AND t.cart_id = cd.cart_id
                                            AND cd.product_id = p.id
                                            AND t.created_at BETWEEN IFNULL(${start_date ? `'${start_date}'` : null}, t.created_at) AND IFNULL(${end_date ? `'${end_date}'` : null}, t.created_at)
                                    GROUP BY product_name
                                    ORDER BY quantity DESC
                                    LIMIT 3;`
        
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
        const { start_date, end_date } = req.query;
        const GET_INCOME_STATEMENT = `SELECT 
                                        SUM(cd.quantity * p.price) AS revenue,
                                        SUM(cd.quantity * (p.price - p.capital_price)) AS net_income,
                                        ROUND(((SUM(cd.quantity * p.price) - SUM(cd.quantity * p.capital_price)) / SUM(cd.quantity * p.price) * 100), 2) AS profit_margin,
                                        CONCAT(YEAR(t.created_at), '/', MONTH(t.created_at), '/', '01') AS time
                                    FROM
                                        transaction AS t, cart_detail AS cd, product AS p
                                    WHERE 
                                        cd.product_id = p.id
                                            AND t.cart_id = cd.cart_id
                                            AND t.status_id = 7
                                            AND t.created_at BETWEEN IFNULL(${start_date ? `'${start_date}'` : null}, t.created_at) AND IFNULL(${end_date ? `'${end_date}'` : null}, t.created_at)
                                    GROUP BY time
                                    ORDER BY time ASC;`;
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

const numberOfSales = async (req, res) => {
    try {
        const { start_date, end_date } = req.query;
        const GET_NUMBER_SALES = `SELECT 
                                        p.product_name AS product_name,
                                        CAST(SUM(cd.quantity) AS UNSIGNED) AS quantity
                                    FROM
                                        transaction AS t,
                                        cart_detail AS cd,
                                        product AS p
                                    WHERE
                                        t.status_id = 7
                                            AND t.cart_id = cd.cart_id
                                            AND cd.product_id = p.id
                                            AND t.created_at BETWEEN IFNULL(${start_date ? `'${start_date}'` : null}, t.created_at) AND IFNULL(${end_date ? `'${end_date}'` : null}, t.created_at)
                                    GROUP BY product_name
                                    ORDER BY quantity DESC;`;
        
        const [ get_number_sales ] = await db.execute(GET_NUMBER_SALES);
        const data = get_number_sales;
        res.status(200).send(new utils.CreateRespond(
            200,
            'Success',
            data
        ));
    } catch (error) {
        console.log(error);
    }
}

const getCostReport = async (req, res) => {
    try {
        const { start_date, end_date } = req.query;
        const GET_COST = `SELECT 
                            p.product_name AS product_name,
                            CAST(SUM(cd.quantity) AS UNSIGNED) AS quantity
                        FROM
                            transaction AS t,
                            cart_detail AS cd,
                            product AS p
                        WHERE
                            t.status_id = 7
                                AND t.cart_id = cd.cart_id
                                AND cd.product_id = p.id
                                AND t.created_at BETWEEN IFNULL(${start_date ? `'${start_date}'` : null}, t.created_at) AND IFNULL(${end_date ? `'${end_date}'` : null}, t.created_at)
                        GROUP BY product_name
                        ORDER BY quantity DESC;`;
        
        const [ get_cost ] = await db.execute(GET_COST);
        const data = get_cost;
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
    getIncomeStatement,
    numberOfSales,
    getCostReport
}