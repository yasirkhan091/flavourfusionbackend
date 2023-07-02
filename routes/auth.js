const express = require('express');
const bcrypt= require('bcrypt');
const router = express.Router();
const User = require('../models/users');
const jwt= require('jsonwebtoken');

//register a new user

router.post('/register', async (req, res) => {
    try {
        const salt= await bcrypt.genSalt(10);
        req.body.password= await bcrypt.hash(req.body.password,salt);
        const newUser = new User(req.body);
        const result = await newUser.save();
        const user={
            userID:result._id
        }
        const token = await jwt.sign(user,process.env.SECRET_KEY,{expiresIn:"1 day"});
        res.cookie("token",token,{httpOnly:true, maxAge:86400*1000});
        res.status(200).send("Sign Up Successful");
    }catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
})

//User Login

router.post('/login',async (req,res)=>{
        try{
            const user1=await User.findOne({email:req.body.email});
            if(!user1)
            res.status(400).json({msg:"Invalid Credentials"});
            else{
                const checkPassword= await bcrypt.compare(req.body.password,user1.password);
                if(checkPassword)
                {
                    const user={
                        userID:user1._id
                    }
                    const token = await jwt.sign(user,process.env.SECRET_KEY,{expiresIn:"1 day"});
                    res.cookie("token",token,{ maxAge:86400*1000});
                    res.status(200).json({msg:"Login Successful"});
                }
                else
                res.status(400).json({msg:"Invalid Credentials"});
            }  
        }catch(err)
        {
            console.log(err);
            res.status(500).send(err);
        }
})

router.delete("/logout",(req,res)=>{
    try{
        if(req.cookies.token)
        {
            res.clearCookie("token");
            res.status(200).send("LogOut Successful");
        }
        else
        {
            res.status(400).send("You are not logged in");
        }
    }catch(err)
    {
        console.log(err);
        res.status(500).send(err);
    }
})

router.get("/whoami",async (req,res)=>{
    try{
        if(req.cookies.token){
            const result=await jwt.verify(req.cookies.token,process.env.SECRET_KEY);
            res.status(200).json(result);
        }else{
            res.status(200).send("Not Logged In");
        }
    }catch(err)
    {
        console.log(err);
        res.status(500).send(err);
    }
})

module.exports=router;