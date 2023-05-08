// Code for setting up express.
const express = require('express');

// Code for mongoose.
const mongoose = require('mongoose');

// For database connection
const dotenv = require('dotenv');

// For user schema
const User = rquire('./models/User');

// For jSON web token.
const jwt = require('jsonwebtoken');



dotenv.config();
mongoose.connect(process.env.MONGO_URL);
const jwtSecret = process.env.JWT_SECRET;

const app = express();

// const mongoUrl = 'mongodb+srv://ronneylok:iyFBdes0F8jh5KHC@cluster0.38q0xj4.mongodb.net/?retryWrites=true&w=majority';

// Route for test
app.get('/test', (req,res)=> {
    res.json('test ok')

});

app.post('/register', async (req,res) => {
    const {username,password} = req.body;
    const createdUser = await User.create({username,password});
    jwt.sign({userId:createdUser,_id},jwtSecret, (err,token)=>{
        if(err) throw err;
        res.cookie('token', token).status(201).json('ok');
    });
});


// For listening to port
app.listen(4040);

//iyFBdes0F8jh5KHC