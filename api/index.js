// Code for setting up express.
const express = require('express');

// Code for mongoose.
const mongoose = require('mongoose');

// For database connection
const dotenv = require('dotenv');

// For user schema
const User = require('./models/User');

// For jSON web token.
const jwt = require('jsonwebtoken');

// For cors
const cors = require('cors');

// For hashing password
const bcrypt = require('bcryptjs');

// For cookie-parser
const cookieParser = require('cookie-parser');


dotenv.config();
mongoose.connect(process.env.MONGO_URL, (err) => {
    if(err) throw err;
});

mongoose.set("strictQuery", false);

const jwtSecret = process.env.JWT_SECRET;

const bcryptSalt = bcrypt.genSaltSync(10);

const app = express();
app.use(express.json());

app.use(cookieParser());

// For cross-origin resource sharing
// For connecting frontend server to backend server
app.use(cors({
    credentials: true,

    // This line allows frontend react server to access this backend express server.
    origin: process.env.CLIENT_URL,

}));


// const mongoUrl = 'mongodb+srv://ronneylok:iyFBdes0F8jh5KHC@cluster0.38q0xj4.mongodb.net/?retryWrites=true&w=majority';

// Route for test
app.get('/test', (req,res)=> {
    res.json('test ok')

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
app.listen(4040);

//iyFBdes0F8jh5KHC