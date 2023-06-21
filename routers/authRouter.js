// external imports
const express = require('express');

// internal imports
const { getLogin } = require('../controllers/authController');
const { authValidators, authValidatorsHandler } = require('../middlewares/auth/authValidators');

// router configure
const router = express.Router();

router.post('/', authValidators, authValidatorsHandler, getLogin);

module.exports = router;
