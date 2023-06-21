// external imports
const createError = require('http-errors'); 

// internal imports
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

///// conversation
const getConversations = async (req, res, next)=>{
    try {
        
        const readConversations = await Conversation.find({
            $or: [
                {"creator.id": req.userInfo.userId},
                {"participant.id": req.userInfo.userId}
            ]
        }).sort({createdAt: "desc"})
        res.json(readConversations)
        
    } catch (err) {
        res.json({
            error: {
                common: {
                    message: err.message
                }
            }
        })
    }
    // res.json({userInfo: req.userInfo});
};
const getConversation = async (req, res, next)=>{
    try {
        const conversationData = await Conversation.findOne({_id: req.params.c_id}) 

        res.status(200).json(conversationData);
    } catch (error) {
        res.json({
            error: {
                common: {
                    message: error.message
                }
            }
        })
    }
}
const searchConversation = async (req, res, next)=>{

    try {
        if(req.query.username || req.query.email){
            let queryOption = Object.keys(req.query)
            const creator = `creator.${queryOption[0]}`;
            const participant = `participant.${queryOption[0]}`;
            // console.log([
            //     [
            //         {[creator]: req.userInfo[queryOption[0]]},
            //         {[participant]: req.query[queryOption[0]]}
            //     ],
            //     [
            //         {[participant]: req.userInfo[queryOption[0]]},
            //         {[creator]: req.query[queryOption[0]]},
            //     ]
            // ])
            const conversationData = await Conversation.find({
                $or: [
                    {$and: [
                        {[creator]: req.userInfo[queryOption[0]]},
                        {[participant]: req.query[queryOption[0]]},
                    ]},
                    {$and: [
                        {[participant]: req.userInfo[queryOption[0]]},
                        {[creator]: req.query[queryOption[0]]},
                    ]}
                ]
            });
            if(conversationData.length > 0){
                res.json(conversationData);
            }else{
                throw createError("No conversation found....") 
            }
        }else{
            throw createError("Please request with valid query....")
        }
    } catch (err) {
        res.json({
            error: {
                common: {
                    message: err.message
                }
            }
        })
    }

}
const addConversation = async (req, res, next)=>{
    try {
        const {id, name, username, email} = req.userInfo;
        const {p_id, p_name, p_username, p_email} = req.body.participant;
        let newConversation = new Conversation({
            creator: {
                id, 
                name, 
                username, 
                email
            },
            participant: {
                id, 
                name: p_name, 
                username: p_username, 
                email: p_email
            },
            message: req.body.message

        })
        const result = await newConversation.save();

        // emit socket event
        global.io.emit('new_conversation', {
            conversation: {
                creator: {
                    id, 
                    name, 
                    username, 
                    email
                },
                participant: {
                    id, 
                    name: p_name, 
                    username: p_username, 
                    email: p_email
                },
                last_updated: result.last_updated,
                message: req.body.message
            }
        })
        res.status(200).json({
            message: 'Conversation added successfully...',
            conversation: result
        })
    } catch (error) {
        res.status(500).json({
            errors: {
              common: {
                msg: error.message,
              },
            },
        });
    }
}

const deleteConversation = async (req, res, next)=>{
    try {
        await Conversation.deleteOne({_id: req.params.c_id}) 
        res.status(200).json({
            message: 'Conversation deleted successfully...'
        })
    } catch (error) {
        res.json({
            error: {
                common: {
                    message: error.message
                }
            }
        })
    }
}
const updateConversation = async (req, res, next)=>{
    const id = req.params.c_id;
    const message = req.body.message || null
    try {
        const update = await Conversation.findOneAndUpdate(
            {_id: id},
            {message},
            {new : true}
        )
        global.io.emit('editconversation', {
            conversation: update
        })
        res.status(200).json({
            // message: 'Conversation updated successfully...',
            conversation: update
        })
    } catch (err) {
        res.status(500).json({
            errors: {
              common: {
                message: err.message,
              },
            },
        });
    }
}
///// message
const getMessages = async (req, res, next)=>{
    try {
        const messages = await Message.find({
            conversation_id: req.params.conversation_id
        }).sort("-createdAt");
        const {participant} = await Conversation.findById(req.params.conversation_id);
        res.status(200).json({
            data: {
                messages: messages,
                participant,
            },
            user: req.userInfo.userId,
            conversation_id: req.params.conversation_id,
        });
    } catch (err) {
        res.status(500).json({
            errors: {
              common: {
                message: err.message,
              },
            },
        });
    }
}
// send new message
async function sendMessage(req, res, next) {
    if (req.body.message || (req.files && req.files.length > 0)) {
      try {
        // save message text/attachment in database
        let attachments = null;
  
        if (req.files && req.files.length > 0) {
          attachments = [];
  
          req.files.forEach((file) => {
            attachments.push(file.filename);
          });
        }
  
        const newMessage = new Message({
          text: req.body.message,
          attachment: attachments,
          sender: {
            id: req.userInfo.userId,
            name: req.userInfo.name,
            avatar: req.userInfo.avatar || null,
          },
          receiver: {
            id: req.body.receiverId,
            name: req.body.receiverName,
            avatar: req.body.avatar || null,
          },
          conversation_id: req.body.conversationId,
        });
  
        const result = await newMessage.save();
  
        // emit socket event
        global.io.emit("new_message", {
          message: {
            conversation_id: req.body.conversationId,
            sender: {
                id: req.userInfo.userId,
                username: req.userInfo.username,
                name: req.userInfo.name,
                avatar: req.userInfo.avatar || null,
            },
            reciver: {
                id: req.body.userId,
                username: req.body.username,
                name: req.body.name,
                avatar: req.body.avatar || null,
            },
            message: req.body.message,
            attachment: attachments,
            date_time: result.date_time,
          },
        });
  
        res.status(200).json({
          message: "Successful!",
          data: result,
        });
      } catch (err) {
        res.status(500).json({
          errors: {
            common: {
              message: err.message,
            },
          },
        });
      }
    } else {
      res.status(500).json({
        errors: {
          common: "message text or attachment is required!",
        },
      });
    }
  }
const deleteMessage = async (req, res, next)=>{
    try {
        const deleteMessage = await Message.deleteOne({
            _id: req.params.message_id
        });
        res.status(200).json({
            message: "Message deleted successfully..."
        });
    } catch (err) {
        res.status(500).json({
            errors: {
              common: {
                message: err.message,
              },
            },
        });
    }
}


module.exports = {
    addConversation,
    getConversations,
    getConversation,
    searchConversation,
    deleteConversation,
    getMessages,
    sendMessage,
    deleteMessage,
    updateConversation
}