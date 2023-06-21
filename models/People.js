// external imports
const mongoose = require('mongoose');

// schema
const peopleSchema = mongoose.Schema(
    {
        name: {
            type: String,
            require: true,
            trim: true,
        },
        email: {
            type: String,
            require: true,
            trim: true,
            lowercase: true,
        },
        password: {
            type: String,
            require: true,
        },
        username: {
            type: String,
            require: true
        }
    },
    {
        timestamps: true,
    }
);

// creating a model
const People = mongoose.model('People', peopleSchema);
module.exports = People;
