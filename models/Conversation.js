// external imports
const mongoose = require('mongoose');

// schema
const conversationSchema = mongoose.Schema(
    {
        creator: {
            id: mongoose.Types.ObjectId,
            name: String,
            username: String,
            email: String,
        },
        participant: {
            id: mongoose.Types.ObjectId,
            name: String,
            username: String,
            email: String,
        },
        last_updated: {
            type: Date,
            default: Date.now
        },
        message: {
            type: String,
            default: ''
        }
    },
    {
        timestamps: true,
    }
);

// creating a model
const Conversation = mongoose.model('Conversation', conversationSchema);
module.exports = Conversation;
