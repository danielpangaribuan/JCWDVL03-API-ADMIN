const router = require('express').Router();

const { user } = require('../controllers');

router.get('/users', user.getAllUserData);
router.delete('/users/:id', user.deleteUserDataById);
router.patch('/users/:id', user.updateStatusUser);

module.exports = router;