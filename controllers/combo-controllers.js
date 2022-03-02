const utils = require('../utils');
const db = require('../database').promise();

const getComboStatusTransaction = async (req, res) => {
    try {
        const GET_STATUS = `SELECT * FROM transaction_status;`;
        const [ status ] = await db.execute(GET_STATUS);
        const data = status;

        res.status(200).send(new utils.CreateRespond(
            200,
            'Success',
            data
        ))
    } catch (error) {
        const err = error.code ? error : new utils.CreateError();
        res.status(err.code).send(err);
    }
}

module.exports = {
    getComboStatusTransaction
}