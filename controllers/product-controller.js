const database = require('../database').promise()
const utils = require('../utils')

const getAllProducts = async (req, res) => {
    try {
        const {product_name, category_id} = req.query
        const sorting = 'ORDER BY i.product_id ASC';
        // query for get all products data
        const GET_PRODUCTS = `SELECT 
                                    p.id, 
                                    p.product_name AS product_name,
                                    p.description,
                                    c.name AS category,
                                    p.price AS price, 
                                    pm.image AS image,
                                    wh.warehouse_name AS warehouse, 
                                    p.weight, 
                                    i.quantity AS quantity
                                FROM
                                    product AS p,
                                    product_image AS pm,
                                    inventory AS i,
                                    warehouse AS wh,
                                    category AS c
                                WHERE
                                    p.id = pm.product_id
                                    AND pm.status = 1
                                    AND wh.id = i.warehouse_id
                                    AND c.id = p.category_id
                                    AND i.product_id = p.id
                                    AND p.product_name LIKE '%${ product_name ? product_name : '' }%'
                                    AND p.category_id = IFNULL(${ category_id ? category_id : null }, p.category_id)
                                GROUP BY p.id, pm.image
                                ${sorting}`
        const [ PRODUCTS ] = await database.execute(GET_PRODUCTS)

        // sent respond to client-side
        res.status(200).send(new utils.CreateRespond(
            200,
            'list products',
            PRODUCTS
        ))
    } catch (error) {
        console.log(error)
        res.status(500).send({ error })
    }
}

const getCategory = async (req, res) => {
    try {
        const GET_CATEGORY = `SELECT * FROM db_warehouse.category;`
        const [ get_category ] = await database.execute(GET_CATEGORY);

        res.status(200).send(new utils.CreateRespond(
            200,
            'success',
            get_category
        ))
    } catch (error) {
        console.log(error)
    } 
}
                                      
const addNewProduct = async (req, res) => {
    const { product_name, category, weight, description, price, warehouse, quantity } = req.body

    try {
        const ADD_PRODUCT = `INSERT INTO product (product_name, category, weight, description, price, warehouse, quantity) VALUES(?, ?, ?, ?, ?, ?, ?)`
        const [ NEW_PRODUCT ] = await database.execute(ADD_PRODUCT, [product_name, category, weight, description, price, warehouse, quantity])

        res.status(200).send(new utils.CreateRespond(
            200,
            `insert product succes`,
            NEW_PRODUCT
        ))
    } catch (error) {
            console.log(error)
            res.status(500).send({ error })
    }
}


const deleteProduct = async (req, res) => {
    const id = Number(req.params.id)
    try {
        // search product with id
        const GET_PRODUCT = `SELECT id FROM product WHERE id = ?;`
        const [ PRODUCT ] = await database.execute(GET_PRODUCT, [id])

        // check
        if (!PRODUCT.length) throw ({ message : 'data not found'})

        // do query delete to products table
        const DELETE_PRODUCT = `DELETE FROM product WHERE id = ?;`
        const [ INFO ] = await database.execute(DELETE_PRODUCT, [id])

        // do query delete to product_category table
        //const DELETE_CATEGORY = `DELETE FROM product_category WHERE product_id = ?;`
        //const [ INFO2 ] = await database.execute(DELETE_CATEGORY, [id])

        // send respond to client-side
        res.status(200).send(new utils.CreateRespond(
            200, 
            `products with id : ${id} has been deleted`,
            INFO
        ))
    } catch (error) {
        console.log(error)
        res.status(500).send({ error })
    }
}

const updateProducts = async (req, res) => {
    const id = Number(req.params.id)
    try {
        // check if data is exist
        const GET_PRODUCT = `SELECT id FROM product WHERE id = ?;`
        const [ PRODUCTS ] = await database.execute(GET_PRODUCT, [id])

        if (!PRODUCTS.length) throw ({ message : 'data not found' })

        // update data
        let set = []
        for (let key in req.body) {
            set.push(`${key} = ?`)
        }
        console.log(set)
        const UPDATE_PRODUCTS = `UPDATE product SET ${set} WHERE id = ?;`
        console.log(UPDATE_PRODUCTS)
        const [ INFO ] = await database.execute(UPDATE_PRODUCTS, [...Object.values(req.body), id ])

        // send respond to client-side
        res.status(200).send(new utils.CreateRespond(
            200, 
            `products with id : ${id} has been updated`,
            INFO
        ))

    } catch (error) {
        console.log(error)
        res.status(500).send({ error })
    }
}

const getWarehouse = async ( req, res) => {
    try {
        const GET_WAREHOUSE = `SELECT * FROM warehouse;`
        const [ get_warehouse ] = await database.execute(GET_WAREHOUSE);

        res.status(200).send(new utils.CreateRespond(
            200,
            'success',
            get_warehouse
        ))
    } catch (error) {
        console.log(error)
    }
} 


module.exports = {
    getAllProducts,
    addNewProduct,
    deleteProduct,
    updateProducts,
    getCategory,
    getWarehouse,
}