// external dependencies
const express = require('express');
const httpErrors = require('http-errors');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const expressValidator = require('express-validator');
const jsonWebToken = require('jsonwebtoken');
const mongoose = require('mongoose');
const socket = require('socket.io');
const path = require('path');
const http = require('http');

// internal dependencies
const { notFoundHandler, commonErrorHandler } = require('./middlewares/common/errorHandler');
const usersRouter = require('./routers/usersRouter');
const authRouter = require('./routers/authRouter');
const inboxRouter = require('./routers/inboxRouter');
const { checkLogin } = require('./middlewares/common/checkLogin');
// module scafulding
const app = express();
const server = http.createServer(app)
dotenv.config();

// socket creation
const io = require("socket.io")(server);
global.io = io;

// database connection
mongoose
    .connect(process.env.MONGO_CONNECTION_STRING)
    .then(() => console.log('database connection successfully!'))
    .catch((err) => console.log(err));

// request parsers middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// set static folder middleware
app.use(express.static(path.join(__dirname, 'public')));

// parse cookies middleware
app.use(cookieParser(process.env.COOKIE_SECRET));

// routing set up
app.use('/api/login', authRouter);
app.use('/api/user', usersRouter);
app.use('/api/inbox',checkLogin, inboxRouter);
/* 
    user API
        POST    -   /register
        POST    -   /login
        GET     -   /users?email=${email}

    conversation API
        GET     -   /conversations?participants_like=${email}&_sort=timestamp&_order=desc&_page=1&_limit=${process.env.REACT_APP_CONVERSATIONS_PER_PAGE}
        
        GET     -   /conversations?participants_like=${email}&_sort=timestamp&_order=desc&_page=${page}&_limit=${process.env.REACT_APP_CONVERSATIONS_PER_PAGE}  -   GET

        GET     -   /conversations?participants_like=${logedInUserEmail}-${participantEmail}&participants_like=${participantEmail}-${logedInUserEmail}  -   GET
        
        POST    -   /conversations
        
        PATCH   -   /conversations

    message API
        GET     -   messages?conversationId=${conversationId}&_sort=timestamp&_order=desc&_page=1&_limit=${process.env.REACT_APP_MESSAGES_PER_PAGE}

        GET     -   /messages?conversationId=${conversationId}&_sort=timestamp&_order=desc&_page=${page}&_limit=${process.env.REACT_APP_MESSAGES_PER_PAGE}

        POST    -   /messages
*/

// notFoundRouter set up
app.use(notFoundHandler);

// common errors handler set up
app.use(commonErrorHandler);
app.listen(process.env.PORT, () => {
    console.log(`app listening to port ${process.env.PORT}`);
});
