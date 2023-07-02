const jwt= require("jsonwebtoken");


const authmiddleware=async (req,res,next)=>{
    try{
        const token=req.cookies.token;
        const result=await jwt.verify(token,process.env.SECRET_KEY);
            if(result.userID)
            next();
            else
            res.status(400).send("Authorization denied");
    }catch(err)
    {
        console.log(err);
        res.status(500).send(err);
    }
}

module.exports= authmiddleware;