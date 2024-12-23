const express=require('express')
const userController=require('../controllers/UserController')
const companyController=require('../controllers/CompanyController')
const JobController=require('../controllers/JobController')
const jwtMiddleware = require('../middleware/jwtMiddleware')
const multerMiddleWare=require('../middleware/multermiddleware')
const applicationcontroller=require('../controllers/ApplicationController')
const router=new express.Router()

router.post('/register',userController.registerController)
router.post('/login',userController.loginController)
router.put('/user/profileUpdate',jwtMiddleware,multerMiddleWare.single("profilePhoto"),userController.profileController)


//companycontroller
router.post('/registerCompany', jwtMiddleware, companyController.registerCompany);
// router.post('/registerCompany',jwtMiddleware, multerMiddleWare.single('logo'), companyController.registerCompany);
router.get('/getCompany',jwtMiddleware,companyController.getCompany)
router.get('/get/:id',jwtMiddleware,companyController.getCompanyById)
router.get("/getApplicantsByCompany/:id", jwtMiddleware,applicationcontroller.getApplicantsByCompany)
// router.put('/update/:id',jwtMiddleware,companyController.UpdateCompany)
router.put('/update/:id',jwtMiddleware, multerMiddleWare.single('logo'), companyController.UpdateCompany);
//jobcontroller
router.post('/postJob',jwtMiddleware,JobController.JobregisterController)
router.get('/getAlljob',jwtMiddleware,JobController.getAllJob)
router.get('/getAdminJob',jwtMiddleware,JobController.getAdminJobs)
router.get('/get/:id',jwtMiddleware,JobController.getJobById)

//applyJob
router.post('/applyForJob/:id',jwtMiddleware,multerMiddleWare.single('resume'),applicationcontroller.applyJob)
router.get('/getAppliedJob',jwtMiddleware,applicationcontroller.getAppliedJobs)
router.get('/getapplicants/:id',jwtMiddleware,applicationcontroller.getApplicants)
router.put('/updateStatus/:id/applicants',jwtMiddleware, applicationcontroller.updateStatus);

// router.put('/updateStatus/:applicantId/:jobId', jwtMiddleware, applicationcontroller.updateStatus);

//delete job
router.delete('/job/:id/remove',jwtMiddleware,JobController.deleteJobAPI)


module.exports=router
