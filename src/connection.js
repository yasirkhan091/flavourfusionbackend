const dotenv=require('dotenv');
dotenv.config();
const mongoose=require('mongoose');
mongoose.connect(process.env.MONGO_URL,{
  useNewUrlParser:true,
  useUnifiedTopology:true,
}).then(()=>{
    console.log('database has been connected');
}).catch((err)=>{
    console.log(err);
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", function () {
  console.log("Connected successfully");
});