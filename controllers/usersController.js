// external imports
const bcrypt = require('bcrypt');
const createHttpError = require('http-errors');

// internal imports
const escape = require('../utils/escape')
const User = require('../models/People');

const addUser = async (req, res) => {
    const hashPassword = await bcrypt.hash(req.body.password, 10);
    const newUser = new User({
        ...req.body,
        password: hashPassword,
    });
    try {
        await newUser.save();
        res.json({
            message: 'User was added successfully',
        });
    } catch (error) {
        res.json({
            errors: {
                common: {
                    message: 'Unknown error occured!',
                },
            },
        });
    }
    res.json({
        ...req.body,
        password: hashPassword,
    });
};
const searchUser = async (req, res, next)=>{
    const user_search_key = req.body.user;
    const user_search_key_remove_spce = user_search_key.replace(/\s/g, '');


    try {
        if(user_search_key !== ''){

            const name_search_regex = new RegExp(escape(user_search_key), "i");
            const username_search_regex = new RegExp(escape(user_search_key_remove_spce), "i");
            const email_search_regex = new RegExp("^" + escape(user_search_key_remove_spce) + "$", "i");
            const users = await User.find(
                {
                    $or: [
                        {name: name_search_regex},
                        {email: email_search_regex},
                        {username: username_search_regex}
                    ]
                },
                "-password -__v"
            )
            if(users.length > 0){
                res.status(200).json(users);
            }else{
                throw new Error("User not found!");

            }
        }else{
            throw new Error("You must provide some text to search!");
        }
    } catch (error) {
        res.status(500).json({
            errors: {
                common: {
                    message: error.message
                }
            }
        })
    }
}
// const getUsers = (req, res, next) => {};
module.exports = {
    // getUsers,
    addUser,
    searchUser
};
