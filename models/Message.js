// external imports
const mongoose = require('mongoose');

// schema
const messageSchema = mongoose.Schema(
    {
        conversation_id: {
            type: mongoose.Types.ObjectId,
            required: true
        },
        sender: {
            id: mongoose.Types.ObjectId,
            username: String,
            name: String,
            avatar: String
        },
        reciver: {
            id: mongoose.Types.ObjectId,
            username: String,
            name: String,
            avatar: String
        },
        date_time: {
            type: Date,
            default: Date.now
        },
        text: {type: String},
        attachment: [
            {type: String}
        ]
    },
    {
        timestamps: true,
    }
);

// creating a model
const Message = mongoose.model('Message', messageSchema);
module.exports = Message;
