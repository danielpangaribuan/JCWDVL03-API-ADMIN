const utils = require('../utils');
const db = require('../database').promise();
const moment = require('moment-timezone');

const getTransactionData = async (req, res) => {
    try {
        const GET_TRANSACTION = `SELECT t.id, t.invoice_number, t.total_price, ts.status AS status_type, ts.id AS status_code, t.date_transfer, u.fullname, tq.total_quantity
                                FROM transaction AS t, transaction_status AS ts, cart AS c, user AS u, 
                                    (
                                        SELECT cart_id, SUM(quantity) AS total_quantity 
                                        FROM cart_detail 
                                        GROUP BY cart_id
                                    ) AS tq
                                WHERE t.cart_id = c.id AND c.user_id = u.id AND t.status_id = ts.id AND t.cart_id = tq.cart_id ;`;

        const [ transaction ] = await db.execute(GET_TRANSACTION);
        const data = transaction;

        res.status(200).send(new utils.CreateRespond(
            200,
            'success',
            data
        ))
    } catch (error) {
        const err = err.code ? error : new utils.CreateError();
        res.status(err.code).send(err);
    }
}

const getDetailTransaction = async (req, res) => {
    try {
        const ID_TRANSACTION = req.params.id;
        const DETAIL_TRANSACTION = `SELECT 
                                        t.invoice_number, t.total_price, ts.status AS status_type, ts.id AS status_code, 
                                        t.date_transfer, u.fullname, tq.total_quantity, t.created_at, t.updated_at
                                    FROM 
                                        transaction AS t, transaction_status AS ts, 
                                        cart AS c, user AS u, 
                                        (
                                            SELECT cart_id, SUM(quantity) AS total_quantity 
                                            FROM cart_detail 
                                            GROUP BY cart_id
                                        ) AS tq
                                    WHERE 
                                        t.cart_id = c.id AND c.user_id = u.id AND 
                                        t.status_id = ts.id AND t.cart_id = tq.cart_id AND 
                                        t.id = ${ID_TRANSACTION} ;`;
                                        
        const PRODUCT_TRANSACTION = `SELECT 
                                        p.product_name AS product_name,
                                        p.price AS price,
                                        cat.name AS category,
                                        cd.quantity AS quantity,
                                        cd.quantity * p.price AS total_price
                                    FROM
                                        cart_detail AS cd,
                                        product AS p,
                                        transaction AS t, 
                                        category AS cat
                                    WHERE
                                        p.id = cd.product_id 
                                        AND p.category_id = cat.id
                                        AND t.cart_id = cd.cart_id
                                        AND t.id = ${ID_TRANSACTION};`;

        const [ detail_transaction ] = await db.execute(DETAIL_TRANSACTION);
        const [ product_transaction ] = await db.execute(PRODUCT_TRANSACTION);

        const data = detail_transaction;
        data[0]['products'] = product_transaction

        res.status(200).send(new utils.CreateRespond(
            200,
            'success',
            data
        ));
    } catch (error) {
        const err = err.code ? error : new utils.CreateError();
        res.status(err.code).send(err);
    }
}

const updateStatusTransaction = async (req, res) => {
    const id = Number(req.params.id);
    const { status_id } = req.body;
    const updated_at = moment().tz("Asia/Jakarta").format('YYYY-MM-DD HH:mm:ss')
    try {
        const UPDATE_STATUS_TRANSACTION = `UPDATE transaction SET status_id = ${status_id}, updated_at = '${updated_at}' WHERE id = ${id};`;
        const UPDATED_STATUS_TRANSACTION = await db.execute(UPDATE_STATUS_TRANSACTION, [status_id]);

        res.status(200).send(new utils.CreateRespond(
            200,
            `${req.method} : ${req.url}`,
            `Transaction with id : ${id} has been updated`,
            {}
        ));
    } catch (error) {
        const err = error.code ? error : new utils.CreateError();
        res.status(err.code).send(err);
    }
}

module.exports = {
    getTransactionData,
    getDetailTransaction,
    updateStatusTransaction
}