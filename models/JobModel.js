//post job
const mongoose=require('mongoose')
const jobSchema=new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true,
    },
   
    requirements:{
        type: [String],
        required:true,

    },
    salary:{
        type:Number,
        required:true,
        min: 0 


    },experienceLevel:{
        type:String,
        required:true,
        min: 0, //

    },
    location:{
        type:String,
        required:true


    },
    jobType:{
        type:String,
        enum: ['Full-Time', 'Part-Time', 'Internship', 'Freelance', 'Internship'],
        required:true
    },
    position:{
        type:Number,
        required:true,
    },
    company:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'companies',
        required:true
    },
    created_by:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true


    },
    applications:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'Application',
        }
    ]
    

},{timestamps:true});
 const jobs=mongoose.model("jobs",jobSchema)
module.exports=jobs