const jobs = require('../models/JobModel');
const company = require('../models/CompanyModel');
exports.JobregisterController = async (req, res) => {
    console.log('Inside JobregisterController');

    try {
        const userId = req.userId;

        // Ensure userId is passed correctly
        if (!userId) {
            return res.status(400).json({ message: "User ID is missing in the request." });
        }

        // Destructure job details from the request body
        const {
            title,
            description,
            requirements,
            salary,
            location,
            experienceLevel,
            jobType,
            position,
            company: companyId
        } = req.body;

        // Validate required fields
        if (
            !title ||
            !description ||
            !requirements ||
            !salary ||
            !location ||
            !experienceLevel ||
            !jobType ||
            !position ||
            !companyId
        ) {
            return res.status(400).json({
                message: "All required fields (title, description, requirements, salary, location, experienceLevel, jobType, position, company) must be provided."
            });
        }

        // Validate company existence
        const companyExists = await company.findById(companyId);
        if (!companyExists) {
            return res.status(404).json({ message: "Company not found." });
        }

        // Create a new job posting
        const job = await jobs.create({
            title,
            description,
            // requirements: Array.isArray(requirements) ? requirements : requirements.split(","), // Handle both array and string inputs
             requirements,

            salary,
            location,
            // experienceLevel: Number(experienceLevel),
            experienceLevel,

            jobType,
            position: Number(position),
            company: companyId,
            created_by: userId // Associate job with the logged-in user
        });

        // Return the created job in the response
        return res.status(201).json({
            message: "Job created successfully",
            job: {
                id: job._id,
                title: job.title,
                description: job.description,
                requirements: job.requirements,
                salary: job.salary,
                location: job.location,
                experienceLevel: job.experienceLevel,
                jobType: job.jobType,
                position: job.position,
                company: job.company,
                created_by: job.created_by,
                createdAt: job.createdAt,
                updatedAt: job.updatedAt
            }
        });
    } catch (error) {
        console.error('Error inside JobregisterController:', error);
        return res.status(500).json({ message: "Server error while creating job.", error: error.message });
    }
};




exports.getAllJob = async (req, res) => {
    try {
      const keyword = req.query.keyword || '';
      const location = req.query.location || '';
  
      const query = {
        $and: [
          {
            $or: [
              { title: { $regex: keyword, $options: 'i' } },
              { description: { $regex: keyword, $options: 'i' } },
            ],
          },
          { location: { $regex: location, $options: 'i' } }, // Filter by location
        ],
      };
  
      const allJobs = await jobs
        .find(query)
        .populate('company', 'name logo');
  
      if (allJobs.length === 0) {
        return res.status(404).json({ message: 'No jobs found' });
      }
  
      return res.status(200).json({ message: 'Jobs fetched successfully', jobs: allJobs });
    } catch (err) {
      console.error('Error inside getAllJobController:', err);
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
  };
  


exports.getJobById = async (req, res) => {
    console.log('inside getJobById controller');
    
    try {
        const jobId = req.params.id; // Get job ID from URL parameter

        // Find the job by ID and populate 'applications' field
        const job = await jobs.findById(jobId).populate({
            path: "applications",
        });

        if (!job) {
            return res.status(404).json({
                message: "Job not found.",
                success: false
            });
        }

        return res.status(200).json({ job, success: true });
    } catch (error) {
        console.error('Error fetching job by ID:', error);
        return res.status(500).json({
            message: "Server error while fetching job by ID.",
            success: false,
            error: error.message
        });
    }
};



exports.getAdminJobs = async (req, res) => {
    console.log('inside getAdminJob controller');
    
    try {
        const adminId = req.userId;  // Ensure you're passing the userId from the JWT middleware
        const jobsList = await jobs.find({ created_by: adminId }).populate({
            path: 'company',
            createdAt: -1
        });

        if (!jobsList || jobsList.length === 0) {
            return res.status(404).json({
                message: "Jobs not found.",
                success: false
            });
        }

        return res.status(200).json({
            jobs: jobsList,
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Error fetching admin jobs.",
            error: error.message
        });
    }
};

//remove project
exports.deleteJobAPI=async(req,res)=>{
    console.log('inside deleteJobController');
    const {id} = req.params; // Get job ID from URL parameter
    //delete job with given id from model
  try{
    const removeJob=await jobs.findByIdAndDelete({_id:id})
    res.status(200).json(removeJob)
    


  }catch{
    res.status(401).json(err)
    console.log(err);

    

  }

    
}

