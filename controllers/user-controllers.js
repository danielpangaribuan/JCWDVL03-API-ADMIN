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
        const { page, size, role } = req.query;
        const { limit, offset } = getPagination(page, size);

        const GET_USERS = `SELECT * FROM user WHERE user.role_id = ${role} LIMIT ${limit} OFFSET ${offset};`;
        const TOTAL_DATA = `SELECT * FROM user WHERE user.role_id = ${role}`;

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

const getDetailUser = async (req, res) => {
    try {
        const GET_DETAIL = `SELECT u.nama_lengkap, u.email, u.username,
                                    u.jenis_kelamin, u.tanggal_lahir, u.status_verified,
                                    ua.alamat_penerima, ua.nama_penerima, ua.nama_provinsi, 
                                    ua.nama_kota, ua.kodepos, ua.nomor_hp
                                FROM user_alamat AS ua, user AS u
                                WHERE u.id = ua.id_user;`
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

const updateStatusUser = async (req, res) => {
    const id = Number(req.params.id);
    try {
        const GET_USER_BY_ID = `SELECT * FROM user WHERE id = ${id};`;
        const [ user ] = await db.execute(GET_USER_BY_ID);

        if (!user.length) throw new utils.CreateError(
            'Bad Request',
            401,
            `${req.method} : ${req.url}`,
            `User with id : ${id} doesn't found.`
        )

        const EDIT_STATUS_USER = `UPDATE user SET verified_status = 1 WHERE id = ${id};`;
        const EDIT_USER = await db.execute(EDIT_STATUS_USER);

        res.status(200).send(new utils.CreateRespond(
            200,
            `User with id: ${id} has been updated`,
            {}
        ));
    } catch (error) {
        console.log(error)
    }
}

module.exports = {
    getAllUserData,
    deleteUserDataById,
    updateStatusUser
}