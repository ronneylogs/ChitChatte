// For adding mongoose.
const mongoose = require ('mongoose');


// Adds the user schema to our code.
const UserSchema = new mongoose.Schema({

    // Takes in a name that is unique, and a password.
    username: {type:String,unique:true},
    password: String,

},{timestamps:true});

// UserModel is now equal to the new mongoose User Schema.
const UserModel = mongoose.model('User', UserSchema);

// Export this model to other files.
module.exports = UserModel;