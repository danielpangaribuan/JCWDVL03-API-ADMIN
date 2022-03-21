const router = require('express').Router()


const { products } = require('../controllers')

router.get('/products', products.getAllProducts)
router.get('/category', products.getCategory)
router.get('/warehouse', products.getWarehouse)
router.post('/products', products.addNewProduct)
router.delete('/products/:id', products.deleteProduct)
router.patch('/products/:id', products.updateProducts)



module.exports = router;