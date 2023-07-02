const Conversations= require('../models/conversations');
const authmiddleware=require('../middleware/userauth');
const mongoose= require('mongoose');
const express= require('express');
const router= express.Router();


router.post("/newConversation/:id",authmiddleware,async (req,res)=>{
    try{
        if(req.params.id===req.body.id){
            res.status(400).send("Cannot Create a conversation with self");
        }else{
            const id1=new mongoose.Types.ObjectId(req.params.id);
            const id2=new mongoose.Types.ObjectId(req.body.id);
            const result = await Conversations.findOne({participants:{$all:[id1,id2]}}).populate({path:'participants',select:"username profileImagescr"}).exec();
            if(result)
            res.status(200).json(result);
            else{
                const newConversation= new Conversations({participants:[id1,id2]});
                await newConversation.save();
                const result = await Conversations.populate(newConversation,{path:'participants',select:"username profileImagescr"});
                res.status(200).json(result);
            }
        }
    }catch(err){
            console.log(err);
            res.status(500).send(err);
    }
})

router.get("/getAllConversations/:id",authmiddleware,async (req,res)=>{
    try{
        const result = await Conversations.find({participants:req.params.id}).sort({updatedAt:-1}).populate({path:'participants',select:"username profileImagescr"}).exec();
        res.status(200).json(result);
    }catch(err){
        console.log(err);
        res.status(500).send(err);
    }
})
module.exports=router;