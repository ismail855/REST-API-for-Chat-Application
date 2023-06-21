// external imports
const express = require('express');

// internal imports
const { 
    getConversation, 
    getConversations,
    searchConversation,
    addConversation, 
    deleteConversation, 
    getMessages,
    deleteMessage, 
    sendMessage, 
    updateConversation
} = require('../controllers/inboxController');


// router configure 
const router = express.Router()

///// conversation router
router.get("/conversations", getConversations);
router.get("/conversation/:c_id", getConversation);
router.get("/conversation_search", searchConversation)
router.post("/conversation", addConversation);
router.patch("/conversation/:c_id", updateConversation);
router.delete("/conversation/:c_id", deleteConversation)

////// message router
router.get("/messages/:conversation_id", getMessages)
router.post("/message", sendMessage)
router.delete("/message/:message_id", deleteMessage)


module.exports = router;
