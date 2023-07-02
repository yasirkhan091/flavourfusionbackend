const express=require('express');
const cookieParser =require('cookie-parser');
const userRouter=require('../routes/userRoutes');
const postRouter=require('../routes/postRoutes');
const conversationRouter=require('../routes/conversationsRoutes');
const messageRouter=require('../routes/messageRoutes');
const authRouter=require('../routes/auth');
const dotenv=require('dotenv');
require("./connection.js");
const PORT=process.env.PORT || 8000;
const app=express();
dotenv.config();

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/post",postRouter);
app.use("/api/user",userRouter);
app.use('/api/auth',authRouter);
app.use("/api/conversation/",conversationRouter);
app.use("/api/message",messageRouter);

const server = app.listen(PORT,()=>{
    console.log(`Working at PORT No. ${PORT}`);
})

const io= require("socket.io")(server,{
    pingTimeout:60000,
    cors:{
        origin:[`http://localhost:${PORT}`]
    }
})

io.on('connection', socket => {
    console.log(`Socket User-${socket.id} connected`);
    socket.on('join',(data)=>{
        socket.join(`${data}`);
        console.log("Joined a room");
    });
    socket.on('message',(data)=>{
        socket.in(data.to).emit('messageResponse',data);
        console.log("recieved a message!!!");
    })
    socket.on("disconnect",()=>console.log(`Socket-User ${socket.id} disconnected`));
});
