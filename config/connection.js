const mongoose=require('mongoose')
const connection_string=process.env.CONNECTIONSTRING
mongoose.connect(connection_string).then((res)=>{
    console.log('MONGODB ATLAS CONNECTED SUCCESSFULLY');
    
}).catch(err=>{
    console.log("connection failed!!!");
    console.log(err);
    
    
})