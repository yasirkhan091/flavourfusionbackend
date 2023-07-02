const mongoose=require('mongoose');

const PostSchema=new mongoose.Schema({
    userID:{
        type:String,
        required:true
    },
    imgsrc:{
        type:String,
        required:true
    },
    imgKey:{
        type:String,
        required:true
    },
    description:{
        type:String,
        default:'',
        max:50
    },
    likedByUsers:{
        type:[String],
        default:[]
    }
},{
    timestamps:true
})

module.exports = new mongoose.model("Posts",PostSchema);