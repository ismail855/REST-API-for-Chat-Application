// external imports
const createError = require('http-errors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// internal imports
const User = require('../models/People');

const getLogin = async (req, res) => {
    const { user, password } = req.body;
    try {
        const userInfo = await User.findOne({ $or: [{username: user}, {email: user}] });
        if (userInfo._id) {
            const isValidPassword = await bcrypt.compare(password, userInfo.password);
            const userObject = {
                userId: userInfo._id,
                name: userInfo.name,
                email: userInfo.email,
                username: userInfo.username,
            };
            if (isValidPassword) {
                const acessToken = jwt.sign(userObject, process.env.JWT_SECRET, {
                    expiresIn: process.env.JWT_EXPIRE,
                });
                // set cookie
                res.cookie(process.env.COOKIE_NAME, acessToken, {
                    maxAge: process.env.JWT_EXPIRY,
                    httpOnly: true,
                    signed: true,
                });
                
                // response 
                res.json({
                    acessToken, userObject
                });
            } else {
                throw createError('Login failed 1');
            }
        } else {
            throw createError('Login failed 2');
        }
    } catch (error) {
        res.json({
            errors: {
                common: {
                    message: error.message,
                },
            },
        });
    }
};
module.exports = {
    getLogin,
};
