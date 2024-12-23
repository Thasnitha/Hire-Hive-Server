const jobs = require('../models/JobModel');
const Application=require('../models/ApplicationModel')
const companies = require('../models/CompanyModel');
const users = require('../models/UserModel');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const applications = require('../models/ApplicationModel');




exports.applyJob = async (req, res) => {
    console.log('Inside applyJobController');
    try {
        const userId = req.userId; // Extracted from the token middleware
        const { id } = req.params; // Job ID from the URL parameter
        const resumeFile = req.file; // Resume file handled by Multer

        // Validate required fields
        if (!userId) {
            return res.status(400).json({
                message: 'User ID is missing from the request.',
                success: false,
            });
        }
        if (!id) {
            return res.status(400).json({
                message: 'Job ID is required.',
                success: false,
            });
        }
        if (!resumeFile) {
            return res.status(400).json({
                message: 'Resume is required.',
                success: false,
            });
        }

        // Check if the user has already applied for this job
        const existingApplication = await Application.findOne({ job: id, applicant: userId });
        if (existingApplication) {
            return res.status(400).json({
                message: 'You have already applied for this job.',
                success: false,
            });
        }

        // Validate if the job exists
        const job = await jobs.findById(id);
        if (!job) {
            return res.status(404).json({
                message: 'Job not found.',
                success: false,
            });
        }

        // Save application with the resume
        const newApplication = await Application.create({
            job: id,
            applicant: userId,
            resume: `/uploads/resumes/${resumeFile.filename}`, // Save resume path
        });

        job.applications.push(newApplication._id);
        await job.save();

        return res.status(201).json({
            message: 'Job applied successfully.',
            application: {
                id: newApplication._id,
                job: newApplication.job,
                applicant: newApplication.applicant,
                resume: newApplication.resume,
                createdAt: newApplication.createdAt,
                updatedAt: newApplication.updatedAt,
            },
            success: true,
        });
    } catch (error) {
        console.error('Error inside applyJobController:', error);
        return res.status(500).json({
            message: 'Server error while applying for the job.',
            error: error.message,
            success: false,
        });
    }
};




exports.getAppliedJobs = async (req, res) => {
    console.log('inside getAppliedJobs');
    
    try {
        const userId = req.userId; // Ensure you're using 'req.userId' for correct user ID
        const applications = await Application.find({ applicant: userId })
            .sort({ createdAt: -1 })
            .populate({
                path: 'job',  // Populate the 'job' field in Application
                model: 'jobs',  // Reference the model as 'jobs' (plural)
                select: 'title description location salary createdAt resume',  // Select only necessary job fields
                populate: {
                    path: 'company',  // Populate the 'company' field in Job
                    model: 'companies',  // Reference the model as 'companies'
                    select: 'name description location website logo createdAt'  // Select relevant company details
                }
            });

        if (!applications || applications.length === 0) {
            return res.status(404).json({
                message: "No applications found",
                success: false
            });
        }

        return res.status(200).json({
            applications,
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Server error while fetching applications.",
            error: error.message,
            success: false
        });
    }
};



// get applicants for admin
exports.getApplicants = async (req, res) => {
    console.log('inside getApplicants controller');
    
    try {
        const jobId = req.params.id;

        // Find job by ID and populate its applications (including the applicant)
        const job = await jobs.findById(jobId)
            .populate({
                path: 'applications',  // Populate the 'applications' field in Job
                options: { sort: { createdAt: -1 } },
                populate: {
                    path: 'applicant',  // Populate the 'applicant' field in Application
                    model: 'users',  // Ensure the applicant is a User model
                    select: 'FullName email createdAt'  // Select only necessary user fields
                }
            });

        // If the job doesn't exist, return a 404 error
        if (!job) {
            return res.status(404).json({
                message: 'Job not found.',
                success: false
            });
        }

        // Return the job with the applicants in the response
        return res.status(200).json({
            job,  // Include the job details
            success: true
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Server error while fetching applicants.',
            error: error.message,
            success: false
        });
    }
};


exports.getApplicantsByCompany = async (req, res) => {
    try {
        const companyId = req.params.id;

        // Log the received company ID
        console.log("Fetching jobs for company ID:", companyId);

        // Fetch jobs for the company
        const companyJobs = await jobs.find({ company: companyId }).populate({
            path: 'applications',
            populate: {
                path: 'applicant',
                model: 'users',
                select: 'FullName email resume',
            },
        });

        if (!companyJobs || companyJobs.length === 0) {
            return res.status(404).json({
                message: 'No jobs found for this company.',
                success: false,
            });
        }

        const applicants = companyJobs.reduce((acc, job) => {
            const jobApplicants = job.applications.map(application => ({
                jobTitle: job.title,
                applicant: application.applicant,
                status: application.status,
                appliedAt: application.createdAt,
                resume: application.resume || "No resume uploaded", // Fallback for missing resume
            }));
            return [...acc, ...jobApplicants];
        }, []);

        return res.status(200).json({
            message: 'Applicants fetched successfully.',
            applicants,
            success: true,
        });
    } catch (error) {
        console.error("Error fetching applicants by company:", error);
        return res.status(500).json({
            message: 'Server error while fetching applicants.',
            error: error.message,
            success: false,
        });
    }
};



exports.updateStatus = async (req, res) => {
    const { id } = req.params;
    console.log("Application ID from Request:", id);

    // Validate status input
    const validStatuses = ["Pending", "Interview Scheduled", "selected", "rejected"];
    const { status } = req.body;

    if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid status value" });
    }

    try {
        const updatedApplication = await Application.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!updatedApplication) {
            console.log("Application not found in the database.");
            return res.status(404).json({ message: "Application not found" });
        }

        console.log("Updated Application:", updatedApplication);
        return res.status(200).json({ 
            message: "Status updated successfully", 
            updatedApplication 
        });
    } catch (error) {
        console.error("Error during status update:", error.message);
        return res.status(500).json({ 
            message: "Server error while updating status.",
            error: error.message 
        });
    }
};

