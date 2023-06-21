// external imports
const express = require('express');
const { addUser, searchUser } = require('../controllers/usersController');
const { addUserValidators, addUserHandler } = require('../middlewares/users/userValidators');

// router scaffolding
const router = express.Router();

router.post('/register', addUserValidators, addUserHandler, addUser);
router.get('/search_user', searchUser)

module.exports = router;
