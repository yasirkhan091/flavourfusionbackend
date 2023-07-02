const Posts=require('../models/posts');
const express=require('express');
const router=express.Router();
const Users=require('../models/users');
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

//create a post
router.post('/newpost',upload.single("postImage"),authmiddleware,async (req,res)=>{
    try{
        const params={
            Bucket:process.env.POST_BUCKET_NAME,
            Key:`${Date.now().toString()+req.file.originalname}`,
            Body:req.file.buffer
        }
        const result=await S3.upload(params,async(err,data)=>{
            if(err)
            {
                console.log(err);
                res.status(500).send(err);
            }
            else{
                req.body.imgsrc=data.Location;
                req.body.imgKey=data.Key;
                const newPost=new Posts(req.body);
                await newPost.save();
                res.status(200).send("Post Uploaded Successfully");
            }
        });
    }catch(err)
    {
        console.log(err);
        res.status(500).send(err);
    }
})

//delete an existing post

router.delete('/deletepost',authmiddleware,async (req,res)=>{
    try{
        const postData=await Posts.findById({_id:req.body.id});
        await S3.deleteObject({ Bucket:process.env.POST_BUCKET_NAME,Key:postData.imgKey},async (err,data)=>{
            if(err)
            console.log(err,err.stack);
            else
            {
                const post=await Posts.deleteOne({_id:req.body.id});
                if(post.deletedCount===1)
                res.status(200).send("Delete Successful");
                else
                res.status(400).send("Post Not Found");
            }
        });
    }catch(err){
        console.log(err);
        res.status(500).send(err);
    }
})


//like a post

router.patch('/like/:id',authmiddleware,async (req,res)=>{
    try{
        await Posts.updateOne({_id:req.body.id},{$addToSet:{likedByUsers:req.params.id}});
        res.status(200).send("Post Liked Successfully");
    }catch(err){
        console.log(err);
        res.status(500).send(err);
    }
})

//unlike a post

router.patch('/unlike/:id',authmiddleware, async (req,res)=>{
    try{
        await Posts.updateOne({_id:req.body.id},{$pull:{likedByUsers:req.params.id}});
        res.status(200).send("Post Unliked Successfully");
    }catch(err)
    {
        console.log(err);
        res.status(500).send(err);
    }
})

//update description of the post
router.patch('/update',authmiddleware, async (req,res)=>{
    try{
        await Posts.updateOne({_id:req.body.id},{$set:{description:req.body.description}});
        res.status(200).send("Description updated successfully");
    }catch(err){
        console.log(err);
        res.status(500).send(err);
    }
})

//get all posts by user

router.get('/userposts/:id',authmiddleware,async (req,res)=>{
    try{
        const postsByUser=await Posts.find({userID:req.params.id}).sort({createdAt:-1}).limit(10);
        res.status(200).json(postsByUser);
    }catch(err){
        console.log(err);
        res.status(500).send(err);   
    }
})

//get user timeline
router.get('/timeline/:id',authmiddleware,async (req,res)=>{
    try{
        const user=await Users.findById({_id:req.params.id});
        const accountList=[...user.followings,req.params.id];
        const posts= await Posts.find({userID:{$in:accountList}}).sort({createdAt:-1}).limit(10);
        res.status(200).json(posts);
    }catch(err){
        console.log(err);
        res.status(500).send(err);
    }
})

// get random posts
router.get('/randomPosts',authmiddleware,async (req,res)=>{
    try{
        const posts= await Posts.find().sort({createdAt:-1}).limit(10);
        res.status(200).json(posts);
    }catch(err){
        console.log(err);
        res.status(500).send(err);
    }
})

module.exports=router;