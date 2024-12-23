// //import jsonwebtoken
// const jwt =require('jsonwebtoken')
// //middleware
// const jwtMiddleware=(req,res,next)=>{
//     console.log("Inside jwtMiddleWare");
//     //LOGIC AUTHORIZE USER
//     const token=req.headers["authorization"].split(" ")[1]//BRACKET NOTATION 
//     console.log(token);
//     if(token){
//     //verify TOKEN use verify method 
//     //token verify - object-data stored in its token payload
//     try{
//         const jwtResponse=jwt.verify(token,process.env.JWTPSWD)
//         console.log(jwtResponse);
//         req.userId=jwtResponse.userId
//         next()//to go to controller 
        
//     }catch{
//         res.status(401).json("Authorization failed....Please Login")
//     }
//     }else{
//         res.status(404).json("Authorization failed ...Token is Missing!!!")
//     }

//     //logic to authorize user
// }
// module.exports=jwtMiddleware

const jwt = require('jsonwebtoken');

const jwtMiddleware = (req, res, next) => {
    const token = req.headers["authorization"]?.split(" ")[1]; // Extract token from Authorization header

    if (!token) {
        return res.status(401).json({ message: "Authorization token missing." });
    }

    try {
        // Verify the token with the secret from environment
        const decoded = jwt.verify(token, process.env.JWTPSWD);

        // Attach user information to the request object
        req.userId = decoded.userId; // or decoded._id depending on the token payload
        req.role = decoded.role; // Attach role if needed

        next(); // Proceed to the next middleware or controller
    } catch (error) {
        console.error("Error verifying token:", error);
        res.status(401).json({ message: "Invalid or expired token." });
    }
};

module.exports = jwtMiddleware;

