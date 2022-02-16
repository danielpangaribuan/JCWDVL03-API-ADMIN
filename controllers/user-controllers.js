const utils = require('../utils');
const db = require('../database').promise();

const getAllUserData = async (req, res) => {
    try {
        const GET_USERS = `SELECT * FROM user LIMIT 5 OFFSET 0;`;
        const [ users ] = await db.execute(GET_USERS);
        
        res.status(200).send(new utils.CreateRespond(
            200,
            'success',
            users
        ));
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal service error');
    }
}

const deleteUserDataById = async (req, res) => {
    const id = Number(req.params.id);
    try {
        const GET_USER_BY_ID = `SELECT * FROM user WHERE id = ${id};`;
        const [ user ] = await db.execute(GET_USER_BY_ID);
        console.log(user)

        if (!user.length) throw new utils.CreateError(
            'Bad Request',
            401,
            `${req.method} : ${req.url}`,
            `user with id : ${id} doesn't found`
        )

        const DELETE_USER_BY_ID = `DELETE FROM user WHERE id = ${id};`;
        const DELETED_USER = await db.execute(DELETE_USER_BY_ID);
        console.log(DELETED_USER)

        res.status(200).send(new utils.CreateRespond(
            200,
            `User with id : ${id} has been deleted`,
            {}
        ))

    } catch (error) {
        const err = error.code ? error : new utils.CreateError();
        res.status(err.code).send(err);
    }
}

module.exports = {
    getAllUserData,
    deleteUserDataById
}