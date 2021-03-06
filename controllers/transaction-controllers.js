const utils = require('../utils');
const db = require('../database').promise();
const moment = require('moment-timezone');

const getTransactionData = async (req, res) => {
    try {
        const { id_transacion, created_from, created_end, fullname, status } = req.query;
        const GET_TRANSACTION = `SELECT 
                                    t.id, t.invoice_number, t.total_price, ts.status AS status_type, 
                                    ts.id AS status_code, t.date_transfer, u.fullname, tq.total_quantity
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
                                    t.invoice_number = IFNULL(${id_transacion ? `'${id_transacion}'` : null}, t.invoice_number) AND
                                    t.created_at BETWEEN IFNULL(${created_from ? `'${created_from}'` : null}, t.created_at) AND IFNULL(${created_end ? `'${created_end}'` : null}, t.created_at) AND
                                    u.fullname LIKE IFNULL(${fullname ? `'%${fullname}%'` : null}, u.fullname) AND
                                    ts.id = IFNULL(${status ? status : null}, ts.id)
                                ORDER BY t.created_at DESC;`;
        const [ transaction ] = await db.execute(GET_TRANSACTION);
        const data = transaction;
        
        res.status(200).send(new utils.CreateRespond(
            200,
            'success',
            data
        ))
    } catch (error) {
        console.log(error)
    }
}

const getDetailTransaction = async (req, res) => {
    try {
        const ID_TRANSACTION = req.params.id;
        const DETAIL_TRANSACTION = `SELECT 
                                        t.invoice_number, t.total_price, ts.status AS status_type, ts.id AS status_code,
                                        t.receipt_transfer, t.date_transfer, u.fullname, tq.total_quantity, 
                                        t.created_at, t.updated_at
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
        const err = error.code ? error : new utils.CreateError();
        res.status(err.code).send(err);
    }
}

const updateStatusTransaction = async (req, res) => {
    const id = Number(req.params.id);
    const { status_id } = req.body;
    const updated_at = moment().tz("Asia/Jakarta").format('YYYY-MM-DD HH:mm:ss')
    try {
        const UPDATE_STATUS_TRANSACTION = `UPDATE transaction SET status_id = ${status_id}, updated_at = '${updated_at}' WHERE id = ${id};`;
        const [UPDATED_STATUS_TRANSACTION] = await db.execute(UPDATE_STATUS_TRANSACTION, [status_id]);

        // console.log(status_id)
        if (status_id == 10) {
            const TRANSACTION_DETAIL = `SELECT * FROM transaction_detail WHERE transaction_id = ${id};`;
            const [ transaction_detail ] = await db.execute(TRANSACTION_DETAIL);
            // console.log(transaction_detail)

            await Promise.all(transaction_detail.map(async obj => {
                console.log(obj)
                const UPDATE_QUANTITY = `UPDATE inventory SET quantity = quantity + ${parseInt(obj.quantity)} WHERE (warehouse_id = ${obj.warehouse_id} AND product_id = ${obj.product_id});`
                const [updated_quantity] = await db.execute(UPDATE_QUANTITY);
                // console.log(obj)
            }));
        }

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