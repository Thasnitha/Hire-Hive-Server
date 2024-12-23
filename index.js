require('dotenv').config()
const express=require('express')
const cors=require('cors')
const cookieParser = require('cookie-parser');
const router=require('./routes/router')
require('./config/connection')


const JPServer=express()
JPServer.use(cors())
JPServer.use(express.json())
JPServer.use(router)

JPServer.use('/uploads',express.static('./uploads'))



const PORT=3001
JPServer.listen(PORT,()=>{
    console.log(`Project server started at ${PORT} and waiting for client request`);
    
})
JPServer.get('/',(req,res)=>{
    res.status(200).send('<h1 style="color:black">project server started  and waiting for client request!!!</h1>')
})