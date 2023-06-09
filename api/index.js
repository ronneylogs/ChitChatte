// Code for setting up express.
const express = require('express');

// Code for mongoose.
const mongoose = require('mongoose');

// For database connection
const dotenv = require('dotenv');

// For user schema
const User = require('./models/User');

// For message schema
const Message = require('./models/Message');

// For jSON web token.
const jwt = require('jsonwebtoken');

// For cors
const cors = require('cors');

// For hashing password
const bcrypt = require('bcryptjs');

// For cookie-parser
const cookieParser = require('cookie-parser');

// For websocket
const ws = require('ws');

// For saving uploaded files
const fs = require('fs');


dotenv.config();
mongoose.connect(process.env.MONGO_URL, (err) => {
    if(err) throw err;
});

mongoose.set("strictQuery", false);

const jwtSecret = process.env.JWT_SECRET;

const bcryptSalt = bcrypt.genSaltSync(10);

const app = express();
app.use('/uploads',express.static(__dirname + '/uploads'));
app.use(express.json());

app.use(cookieParser());

// For cross-origin resource sharing
// For connecting frontend server to backend server
app.use(cors({
    credentials: true,

    // This line allows frontend react server to access this backend express server.
    origin: process.env.CLIENT_URL,

}));


async function getUserDataFromRequest(req) {
    return new Promise((resolve,reject)=>{
         const token = req.cookies?.token;
        if(token){
            jwt.verify(token, jwtSecret, {}, (err,userData) =>{
                if(err) throw err;
                resolve(userData);
            });
        }
        else{
            reject('no token');
        }
    });

}

// Route for test
app.get('/test', (req,res)=> {
    res.json('test ok')

});


app.get('/messages/:userId',async (req,res) => {

    const {userId} = req.params;
    const userData = await getUserDataFromRequest(req);
    const ourUserId = userData.userId;
    console.log({userId,ourUserId});
    const messages = await Message.find({
        sender:{$in:[userId,ourUserId]},
        recipient:{$in:[userId,ourUserId]},
    }).sort({createdAt:1});
    res.json(messages);
});

app.get('/people', async (req,res)=>{
    const users = await User.find({}, {'_id':1,username:1});
    res.json(users);

});


app.get('/profile', (req,res) =>{

    const token = req.cookies?.token;
    if(token){
        jwt.verify(token, jwtSecret, {}, (err,userData) =>{
            if(err) throw err;
            const {id,username} = userData;
            res.json(userData);
        });}
    else{
        res.status(422).json('no token');
    }

});

app.post('/login', async (req,res) =>{
    const {username,password} = req.body;
    const foundUser = await User.findOne({username});
    if(foundUser){
        const passOk = bcrypt.compareSync(password, foundUser.password);
        if(passOk){
            jwt.sign({userId:foundUser._id,username}, jwtSecret, {},(err,token)=>{
                // Cookies the user object id
                res.cookie('token', token, {sameSite:'none',secure:true}).json({
                    id: foundUser._id,
                });
            });
        }
    }
});

app.post('/logout', async (req,res) => {
    res.cookie('token','',{sameSite:'none', secure:true}).json('ok');
});


// Registers a new user.
app.post('/register', async (req,res) => {

    // an object that stores a username and password
    const {username,password} = req.body;
    try{

        const hashedPassword = bcrypt.hashSync(password,bcryptSalt);
        // creates a user with username and password object
        const createdUser = await User.create({
            username:username,
            password: hashedPassword,
        });

        // Creates a json web token
        jwt.sign({userId:createdUser._id,username},jwtSecret,{}, (err,token)=>{
            if(err) throw err;

            // Cookies the user object id
            res.cookie('token', token, {sameSite:'none',secure:true}).status(201).json({
                id: createdUser._id,
                username,
            }
            );
    });

    }
    catch(err){
        if(err) throw err;
        res.status(500).json('error');

    }

});


// For listening to port
const server = app.listen(4040);



// Create websocket server (wss)
const wss = new ws.WebSocketServer({server});

// Connection opened event
wss.on('connection', (connection,req) => {

    function notifyAboutOnlinePeople(){
        // Notify everyone about online people (when someone connects)
        // After user information is collected.
        [...wss.clients].forEach(client => {
            // For each client send the client information

            client.send(JSON.stringify({
                // online has a userid and username
                // rhs of the line below turns wss.clients into a map with userId, and username
                online: [...wss.clients].map(c=>({userId:c.userId,username:c.username})),
                

            }));
        });

    }

    connection.isAlive = true;
    connection.timer = setInterval(() => {
        connection.ping();
        connection.deathTimer = setTimeout(() => {
            connection.isAlive = false;
            clearInterval(connection.timer);
            connection.terminate();
            notifyAboutOnlinePeople();
            

        },1000);
    }, 5000);

    connection.on('pong', () => {
        clearTimeout(connection.deathTimer);
    });




    // Read username and id from the cookie for this connection
    const cookies = req.headers.cookie;
    // If cookies exist
    if(cookies){
        // Take the token by parsing the cookie string
        const tokenCookieString = cookies.split(';').find(str =>str.startsWith('token='));

        // If token cookie string exists 
        if(tokenCookieString){
            // Get the token from the string
            const token = tokenCookieString.split('=')[1];
            if(token){
                // Json web token to verify user
                jwt.verify(token,jwtSecret,{},(err,userData)=>{
                    if(err) throw err;
                    // If no error then grab the the userdata
                    const {userId, username} = userData;

                    // Add the userid and username to connection instance
                    connection.userId = userId;
                    connection.username = username;
                });
            }
        }
    }

    connection.on('message', async (message) => {
        messageData = JSON.parse(message.toString());
        const {recipient, text, file} = messageData;
        let filename = null;

        if(file){
            const parts = file.name.split('.');
            const ext = parts[parts.length-1];
            filename = Date.now() + '.' + ext;
            const path = __dirname + '/uploads/' + filename;

            // decode 64 data
            const bufferData = new Buffer(file.data.split(',')[1], 'base64');
            fs.writeFile(path, bufferData, () => {

                console.log('file saved' +path);


            });
        }

        if(recipient && (text||file) ){

            const messageDoc = await Message.create({
                sender:connection.userId,
                recipient,
                text,
                file:file? filename : null,
            });



            [...wss.clients]
            .filter(c=>c.userId === recipient)
            .forEach(c=>c.send(JSON.stringify({
                text,
                sender:connection.userId,
                recipient,
                file: file ? filename : null,
                _id:messageDoc._id,
            })));
        }

    });

    notifyAboutOnlinePeople();

});

