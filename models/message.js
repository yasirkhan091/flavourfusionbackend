const mongoose= require('mongoose');
const MessageSchema= new mongoose.Schema({
    conversationId:{
        type: String,
        required: true
    },
    senderId: {
        type : String,
        required: true
    },
    body:{
        type: String,
        default:""
    },
    imgsrc: {
        type: String,
        default: ""
    }
},{
    timestamps:true
});

module.exports = new mongoose.model("Messages",MessageSchema);