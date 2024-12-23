
const mongoose=require('mongoose')
const userSchema=new mongoose.Schema({
    FullName:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
         match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/
    },
   
    phoneNumber:{
        type:Number,
        required:true,
        match: /^[0-9]{10,15}$/

    },
    password:{
        type:String,
        required:true


    },
    role:{
        type:String,
        enum:['student','recruiter'],
        required:true


    },
    profile:{
        bio:{type:String},
        skills:[{type:String}],
        linkedin:{type:String },

        company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
        profilePhoto:{
            type:'String',
            default:""

        }
    }
    

},{timestamps:true});

const users=mongoose.model("users",userSchema)
module.exports=users
