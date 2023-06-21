const { check, validationResult } = require('express-validator');
const createError = require('http-errors');
const User = require('../../models/People');

// checking form data
const addUserValidators = [
    check('name')
        .isLength({ min: 1 })
        .withMessage('Name is required')
        .isAlpha('en-US', { ignore: ' -' })
        .withMessage('Name must not contain anything other than alphabet')
        .trim(),
    check('email')
        .isLength({ min: 1 })
        .withMessage('Name is required')
        .isEmail()
        .withMessage('Invalid E-mail address')
        .trim()
        .custom(async (value) => {
            try {
                const user = await User.findOne({ email: value });
                if (user) {
                    throw createError('E-mail already exists');
                }
            } catch (error) {
                throw createError(error.message);
            }
        }),
    check('username')
        .isLength({ min: 1 })
        .withMessage('Username is required')
        .trim()
        .custom(async (value) => {
            try {
                const user = await User.findOne({ username: value });
                if (user) {
                    throw createError('Username already exists');
                }
            } catch (error) {
                throw createError(error.message);
            }
        }),
    check('password')
        .isStrongPassword()
        .withMessage(
            'Password must be at least 8 characters long & should contain at least 1 lowercase, 1 uppercase, 1 number & 1 symbol'
        ),
];

// validation error handler
const addUserHandler = (req, res, next) => {
    const errors = validationResult(req);
    const mapedErrors = errors.mapped();
    if (Object.keys(mapedErrors).length === 0) {
        next();
    } else {
        res.json({
            errors: mapedErrors,
        });
    }
};
module.exports = {
    addUserValidators,
    addUserHandler,
};
