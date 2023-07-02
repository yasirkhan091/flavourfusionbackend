const mongoose=require('mongoose');
const validator=require('validator');
const userSchema= new mongoose.Schema({
    username: {
        type:String,
        required:[true,"Username is required"]
    },
    password: {
        type:String,
        require:[true,"Password is required"],
        min:8,
        max:30
    },
    profileImagescr:{
        type:String,
        default:""
    },
    profileImageKey:{
        type:String,
        default:""
    },
    coverImagescr:{
        type:String,
        default:""
    },
    coverImageKey:{
        type:String,
        default:""
    },
    email:{
        type:String,
        require:[true,"Email is required"],
        unique:true,
        validate:[validator.isEmail,"Invalid Email"]
    },
    status:{
        type:String,
        enum:['Single','In a Relationship','Married']
    },
    city:{
        type:String,
        default:""
    },
    worksAt:{
        type:String,
        default: ""
    },
    description:{
        type:String,
        default:""
    },
    savedRecipes:{
        type:[{
        recipeId:String,
        name:String,
        imgsrc:String
    }],
    default: []},
    followers:{
        type:Array,
        default:[]
    },
    followings:{
        type:Array,
        default:[]
    },
    LikedPosts :{
        type:Array,
        default:[]
    },
},{timestamps:true});

module.exports=new mongoose.model("Users",userSchema);