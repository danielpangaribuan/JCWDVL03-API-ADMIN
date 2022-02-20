const utils = require('../utils');
const db = require('../database').promise();

const getPagination = (page, size) => {
    const limit = size ? +size : 2;
    const offset = page ? (page - 1) * limit : 0;
    return { limit, offset }
}

const getPagingData = (data, page, limit) => {
    const { count: totalItems, rows: tutorials } = data;
    const currentPage = page ? +page : 0;
    const totalPages = Math.ceil(totalItems / limit);
    return { totalItems, tutorials, totalPages, currentPage };
}

const getAllUserData = async (req, res) => {
    try {
        const { page, size } = req.query;
        const { limit, offset } = getPagination(page, size);

        const GET_USERS = `SELECT * FROM user LIMIT ${limit} OFFSET ${offset};`;
        const TOTAL_DATA = `SELECT * From user`;

        const [ total_data ] = await db.execute(TOTAL_DATA);
        const [ users ] = await db.execute(GET_USERS);
        const totalItems = total_data.length;

        const data = { 'rows': users, 'currentPage': parseInt(page), 'totalPage': Math.ceil(totalItems / limit), 'length' : totalItems,  };
        
        res.status(200).send(new utils.CreateRespond(
            200,
            'success',
            data
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