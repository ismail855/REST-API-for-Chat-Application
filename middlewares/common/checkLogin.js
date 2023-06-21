// external imports
const jwt = require('jsonwebtoken');
const createError = require('http-errors');

const checkLogin = async(req, res, next)=>{
    let cookie = Object.keys(req.signedCookies).length > 0 ? req.signedCookies: null;
    if(cookie){
        try {
            const token = cookie[process.env.COOKIE_NAME];
            const decodeToken = await jwt.verify(token, process.env.JWT_SECRET);
            req.userInfo = decodeToken;
            next();
        } catch (error) {
            res.status(500).json({
                errors: {
                    common: {
                        message: "Authentication failed!",
                    },
                },
            });
        }
    }else{
        res.status(500).json({
            errors: {
                common: {
                    message: "Authentication failed!",
                },
            },
        });
    }
}
module.exports = {checkLogin}