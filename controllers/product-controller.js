const database = require('../database').promise()
const utils = require('../utils')

const getAllProducts = async (req, res) => {
    try {
        // query for get all products data
        const GET_PRODUCTS = `SELECT * FROM product;`
        const [ PRODUCTS ] = await database.execute(GET_PRODUCTS)
        // `SELECT p.id, p.name, p.price,  p.date_input, 
        //GROUP_CONCAT(CONCAT(c.id, ',',c.category) SEPARATOR ';') AS categories
        //FROM product AS p
        //JOIN product_category AS pc ON p.id = pc.product_id
        //JOIN category As c ON c.id = pc.category_id
        //GROUP BY p.id;`
        

        // revise data
        //const DATA = PRODUCTS.map(product => {
        //    return {
        //        ...product,
        //       categories : product.categories.split(';').map(value => {
        //            const temp_value = value.split(',')
        //            return {
        //                id : Number(temp_value[0]),
        //                category : temp_value[1]
        //            }
        //        })
        //    }
        //})


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
                                      
/*{const getProductById = async (req, res) => {
    const id = Number(req.params.id)
    try {
        // do query to get data
        const GET_PRODUCT_BY_ID = `SELECT p.id, p.name, p.price, p.date_input, 
        GROUP_CONCAT(CONCAT(c.id, ',',c.category) SEPARATOR ';') AS categories
        FROM products AS p
        JOIN product_category AS pc ON p.id = pc.product_id
        JOIN category As c ON c.id = pc.category_id
        WHERE p.id = ?
        GROUP BY p.id;`
        const [ PRODUCT ] = await database.execute(GET_PRODUCT_BY_ID, [id])

        if (!PRODUCT.length) throw ({ message : `product with id : ${id} doesn't found` })

        // revise data
        const DATA = PRODUCT[0]
        DATA.categories = DATA.categories.split(';').map(value => {
            const temp_value = value.split(',')
            return {
                id : Number(temp_value[0]),
                category : temp_value[1]
            }
        })

        // send respond to client-side
        res.status(200).send(new utils.CreateRespond(
            200,
            'single data',
            PRODUCT[0]
        ))
    } catch (error) {
        console.log(error)
        res.status(500).send({ error })
    }
}}*/

const addNewProduct = async (req, res) => {
    const { name, price, description } = req.body

    try {
        // do query insert to products table
        const ADD_PRODUCT = `INSERT INTO product (name, price, description) VALUES(?, ?);`
        const [ NEW_PRODUCT ] = await database.execute(ADD_PRODUCT, [name, price, description ])

        // check category parent_id
       {/*const CTE = `WITH RECURSIVE category_path (id, category, parent_id)
        AS (
            SELECT id, category, parent_id
            FROM category
            WHERE id = ?
            
            UNION ALL
            
            SELECT c.id, c.category, c.parent_id
            FROM category_path AS cp
            JOIN category AS c
            ON cp.parent_id = c.id
        )
        SELECT id FROM category_path;`*/}
        // const [ PARENT_ID ] = await database.execute(CTE, [category_id])

        // do query insert to product_category table
        // const BULK_VALUE = PARENT_ID.map(value => `(${NEW_PRODUCT.insertId}, ${value.id})`)
        // const ADD_CATEGORY = `INSERT INTO product_category (product_id, category_id) VALUES ${BULK_VALUE};`
        // const [ INFO ] = await database.execute(ADD_CATEGORY)

        // send respond to client-side
        res.status(200).send(new utils.CreateRespond(
            200,
            'insert product success',
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
        const GET_PRODUCT = `SELECT id FROM products WHERE id = ?;`
        const [ PRODUCT ] = await database.execute(GET_PRODUCT, [id])

        // check
        if (!PRODUCT.length) throw ({ message : 'data not found'})

        // do query delete to products table
        const DELETE_PRODUCT = `DELETE FROM products WHERE id = ?;`
        const [ INFO1 ] = await database.execute(DELETE_PRODUCT, [id])

        // do query delete to product_category table
        const DELETE_CATEGORY = `DELETE FROM product_category WHERE product_id = ?;`
        const [ INFO2 ] = await database.execute(DELETE_CATEGORY, [id])

        // send respond to client-side
        res.status(200).send(new utils.CreateRespond(
            200, 
            `products with id : ${id} has been deleted`,
            INFO2
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
        const GET_PRODUCT = `SELECT id FROM products WHERE id = ?;`
        const [ PRODUCTS ] = await database.execute(GET_PRODUCT, [id])

        if (!PRODUCTS.length) throw ({ message : 'data not found' })

        // update data
        let set = []
        for (let key in req.body) {
            set.push(`${key} = ?`)
        }
        console.log(set)
        const UPDATE_PRODUCTS = `UPDATE products SET ${set} WHERE id = ?;`
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


module.exports = {
    getAllProducts,
    addNewProduct,
    deleteProduct,
    updateProducts,
}