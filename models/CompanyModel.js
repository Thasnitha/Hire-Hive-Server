//company setup
const mongoose=require('mongoose')
const companySchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
        unique:true
    },
    description:{
        type:String,
        required:true,
    },
   
    location:{
        type:String,
        required:true,

    },
    website:{
        type:String,


    },
    logo:{
        type:String, ///url to company logo


    },
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
     required :true
    }
   
    

},{timestamps:true});
const companies=mongoose.model("companies",companySchema)
module.exports=companies