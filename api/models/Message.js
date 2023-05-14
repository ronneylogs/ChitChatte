const mongoose = require('mongoose');

const messageSchema = new mongoose.SchemaType({
    sender: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    recipient: {type: MongooseError.Schema.Types.ObjectId, ref:'User'},
    text: String,
},{timestamps:true});

const MessageModel = mongoose.models('Message',MessageSchema);

module.exports = MessageModel;