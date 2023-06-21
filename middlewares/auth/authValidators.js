// external imports
const { check, validationResult } = require('express-validator');

// checking validation
const authValidators = [
    check('user')
        .notEmpty()
        .withMessage('Username/E-mail is required'),
    check('password')
        .notEmpty()
        .withMessage('Password is required')
        .isStrongPassword()
        .withMessage(
            'Password too weak...'
        ),
];

// validation error handler
const authValidatorsHandler = (req, res, next) => {
    const errors = validationResult(req);
    const mappedErrors = errors.mapped();
    if (Object.keys(mappedErrors).length === 0) {
        next();
    } else {
        res.json({
            errors: mappedErrors,
        });
    }
};

module.exports = { authValidators, authValidatorsHandler };
