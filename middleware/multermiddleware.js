//uploaded files using multer
const multer=require('multer')
//call the method diskstorage it return storage engine .arg is obj
const storage=multer.diskStorage({
    destination:(req,file,callback)=>{ //3 arg 
        callback(null,'./uploads')

    },filename:(req,file,callback)=>{
        callback(null,`image-${Date.now()}-${file.originalname}`)
    }

})
const multerMiddleWare=multer({
    storage
})
module.exports=multerMiddleWare



