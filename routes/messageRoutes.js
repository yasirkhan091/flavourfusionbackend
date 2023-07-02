const Messages= require('../models/message');
const Conversations= require('../models/conversations');
const express = require('express');
const router= express.Router();
const authmiddleware= require('../middleware/userauth');

//Create a new message
router.post('/createNewMessage',authmiddleware,async (req,res)=>{
    try{
        const newMessage= new Messages(req.body);
        await newMessage.save();
        let lastmsg="";
        if(req.body.body==="" && req.body.imgsrc)
        lastmsg="Photo";
        else
        lastmsg=req.body.body;
        await Conversations.findByIdAndUpdate({_id:req.body.conversationId},{$set:{lastMessage:lastmsg}});
        res.status(200).json(newMessage);
    }catch(err){
        console.log(err);
        res.status(500).send(err);
    }
});

router.get('/getAllMessages/:cid',authmiddleware,async (req,res)=>{
    try{
        const result=await Messages.find({conversationId: req.params.cid}).sort({createdAt:1});
        res.status(200).json(result);
    }catch(err){
        console.log(err);
        res.status(500).send(err);
    }
})

module.exports=router;