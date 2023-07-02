const mongoose = require('mongoose');

const ConversationSchema= new mongoose.Schema({
    participants:[{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Users",
    }],
    lastMessage:{
        type:String,
        default:""
    }
},{
    timestamps:true
})

module.exports = new mongoose.model("Conversations", ConversationSchema);