const express = require('express');
const router = express.Router();
const User = require('../models/users');
const authmiddleware=require('../middleware/userauth');
const multer=require('multer');
const AWS=require('aws-sdk');
const upload=multer({limits:{fieldSize:5 * 1024 * 1024}, fileFilter: function(req,file,done){    
        if(file.mimetype !== "image/png" && file.mimetype !== "image/jpg" && file.mimetype !== "image/jpeg")
        done(new Error("Multer error- File should of png,jpg or jpeg type only"),false);
        done(null,true);
}});

const config={
    accessKeyId:process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region:"ap-south-1",
}

const S3=new AWS.S3(config);

//update user
router.patch('/update/:id',authmiddleware, async (req, res) => {
    try {
        if (req.params.id === req.body._id) {
           await User.findByIdAndUpdate(req.body._id,req.body);
            res.status(200).send("Update Successful");
        }
        else
        res.status(400).send("Invalid Input");
    }
    catch(err){
        console.log(err);
        res.status(500).send(err);
    }
})

//get user details
router.get('/:id',authmiddleware,async(req,res)=>{
    try{
            const result= await User.findById({_id:req.params.id}).select("-password");
            res.status(200).json(result);
    }
    catch(err){
        console.log(err);
        res.status(500).send(err);
    }
})

//follow a user
router.patch('/follow/:id',authmiddleware,async(req,res)=>{
    try{
        if(req.body.id===req.params.id)
        res.status(400).send("Cannot follow self");
        else{
            await User.updateOne({_id:req.params.id},{$addToSet:{followings:req.body.id}});
            await User.updateOne({_id:req.body.id},{$addToSet:{followers:req.params.id}});
            res.status(200).send("Follow Successful");
        }
    }catch(err){
        console.log(err);
        res.status(500).send(err);
    }

})

//unfollow a user

router.patch('/unfollow/:id',authmiddleware,async(req,res)=>{
    try{
        if(req.body.id===req.params.id)
        res.status(400).send("Cannot unfollow self");
        else{
            await User.updateOne({_id:req.params.id},{$pull:{followings :req.body.id}});
            await User.updateOne({_id:req.body.id},{$pull:{followers :req.params.id}});
            res.status(200).send("Unfollow Successful");
        }
    }catch(err){
        console.log(err);
        res.status(500).send(err);
    }

})

// get all followers
router.get('/followers/:id',authmiddleware,async (req,res)=>{
    try{
        const result= await User.findById({_id:req.params.id}, 'followers');
        const totalResult= await User.find({_id:{$in:result.followers}}).select("username profileImagescr");
        res.status(200).json(totalResult);
    }catch(err)
    {
        console.log(err);
        res.status(500).send(err);
    }
})

//get friends suggestion
router.get("/getFriendsSuggestion/:id",async(req,res)=>{
    try{
        const user=await User.findById({_id:req.params.id})
        const result= await User.find({_id:{$nin:user.followings.concat(user._id)}}).sort({createdAt:-1}).limit(6).select('-password');
        res.status(200).json(result);
    }catch(err)
    {
        console.log(err);
        res.status(500).send(err);
    }
})

// Save a Recipe

router.patch('/saveRecipe/:id',authmiddleware, async(req,res)=>{
    try{
           const result= await User.updateOne({_id:req.params.id, 'savedRecipes.recipeId':{$ne:req.body.recipeId}},{$addToSet:{savedRecipes:req.body}});
           if(result.modifiedCount===0)
           res.status(400).send("Invalid Input");
           else
           res.status(200).send("Recipe save Successful");
    }catch(err){
        console.log(err);
        res.status(500).send(err);
    }
})

// Unsave a Recipe 

router.patch('/unsaveRecipe/:id',authmiddleware,async(req,res)=>{
    try{
       const result= await User.updateOne({_id:req.params.id,'savedRecipes.recipeId':req.body.recipeId},{$pull:{savedRecipes:{recipeId:req.body.recipeId}}});
       if(result.modifiedCount===0)
           res.status(400).send("Recipe Not Present");
        else
        res.status(200).send('Recipe Unsaved Successfully');
    }catch(err){
        console.log(err);
        res.status(500).send(err);
    }
})

//Get Saved Recipes

router.get('/getSavedRecipes/:id',authmiddleware,async(req,res)=>{
    try{
        const result= await User.findById({_id:req.params.id});
        res.status(200).json(result.savedRecipes);
    }catch(err){
        console.log(err);
        res.status(500).send(err);
    }

})

//update profile picture

router.patch('/uploadProfilePic/:id',upload.single('profileImage'),authmiddleware,async(req,res)=>{
    try{
        const params={
            Bucket:process.env.PROFILE_BUCKET_NAME,
            Key:`${Date.now().toString()+req.file.originalname}`,
            Body:req.file.buffer
        }
        const result=await S3.upload(params,async(err,data)=>{      //uploading the image
            if(err)
            {
                console.log(err);
                res.status(500).send(err);
            }
            else{
                const result= await User.findById({_id:req.params.id});
                //deleting the previous profile photo from the S3 bucket
                await S3.deleteObject({Bucket:process.env.PROFILE_BUCKET_NAME,Key:result.profileImageKey},async (err,data)=>{
                if(err)
                console.log(err);
                })
                await User.findByIdAndUpdate({_id:req.params.id},{$set:{profileImagescr:data.Location,profileImageKey:data.Key}});
                    res.status(200).send("Profile Updated Successfully");
            }
        });
    }catch(err){
        console.log(err);
        res.status(500).send("Could Not Complete the request");
    }
})

// upload cover photo 

router.patch('/uploadCoverPic/:id',upload.single('coverImage'),async(req,res)=>{
    try{
        const params={
            Bucket:process.env.COVER_BUCKET_NAME,
            Key:`${Date.now().toString()+req.file.originalname}`,
            Body:req.file.buffer
        }
            await S3.upload(params,async(err,data)=>{      //uploading the image
            if(err)
            {
                console.log(err);
                res.status(500).send(err);
            }
            else{
                const result= await User.findById({_id:req.params.id});
                //deleting the previous cover photo from the S3 bucket
                if(result.coverImageKey)
                await S3.deleteObject({Bucket:process.env.COVER_BUCKET_NAME,Key:result.coverImageKey},async (err,data)=>{
                if(err)
                console.log(err);
                })
                await User.findByIdAndUpdate({_id:req.params.id},{$set:{coverImagescr:data.Location,coverImageKey:data.Key}});
                    res.status(200).send("Cover Image Updated Successfully");
            }
        });
    }catch(err){
        console.log(err);
        res.status(500).send("Could Not Complete the request");
    }

})

router.get('/findUsers/:id/:query',authmiddleware,async (req,res)=>{
    try{
        const result= await User.find({username:{$regex: new RegExp(req.params.query,"i")},_id:{$ne:req.params.id}}).limit(10).select("username profileImagescr");   //we can make it more efficient by storing the username in lowercase in the database and not using i in the js regular expression
        res.status(200).json(result);
    }catch(err){
        console.log(err);
        res.status(500).send(err);
    }
})

module.exports = router;