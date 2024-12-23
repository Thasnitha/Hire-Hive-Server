// const companies = require('../models/CompanyModel');
// const jwt = require('jsonwebtoken');
// const bcrypt = require('bcryptjs');
// const User = require('../models/UserModel'); 

// // Register a new company
// // Register a new company









const companies = require('../models/CompanyModel');
const User = require('../models/UserModel');
 const jwt = require('jsonwebtoken');
 const Application=require('../models/ApplicationModel');
 const jobs=require('../models/JobModel')

// Register a new company

// Update an existing company
exports.UpdateCompany = async (req, res) => {
    try {
        const userId = req.userId;  // Get userId from the authenticated request (from JWT middleware)

        if (!userId) {
            return res.status(400).json("User ID is missing in the request.");
        }

        const companyId = req.params.id;  // Get companyId from the route params
        const { name, description, location, website } = req.body;

        // Validate the required fields
        if (!name || !description || !location) {
            return res.status(400).json("All required fields (name, description, location) must be provided.");
        }

        // Handle the logo update if a new logo is uploaded
        let logo = req.body.logo; // If no new logo is uploaded, keep the old one
        if (req.file) {
            logo = req.file.path; // Update logo path if a new file is uploaded
        }

        const updatedData = {
            name,
            description,
            location,
            website,
            logo
        };

        // Find the company by its ID and ensure it belongs to the authenticated user
        const company = await companies.findOneAndUpdate(
            { _id: companyId, userId: userId }, // Ensure it belongs to the authenticated user
            updatedData,
            { new: true } // Return the updated document
        );

        if (!company) {
            return res.status(404).json('Company not found or does not belong to the user.');
        }

        return res.status(200).json({
            message: 'Company information updated successfully',
            company: {
                id: company._id,
                name: company.name,
                description: company.description,
                location: company.location,
                website: company.website,
                logo: company.logo,
                userId: company.userId
            }
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json('Server Error while updating company');
    }
};
// Get all companies by user
exports.getCompany = async (req, res) => {
    try {
        const userId = req.userId;  // Get userId from the authenticated request (after JWT middleware)

        if (!userId) {
            return res.status(400).json("User ID is missing in the request.");
        }

        const companyList = await companies.find({ userId });  // Fetch companies by userId

        if (!companyList || companyList.length === 0) {
            return res.status(404).json('No companies found for the user.');
        }

        return res.status(200).json(companyList);
    } catch (err) {
        console.log(err);
        return res.status(500).json('Server Error while fetching companies.');
    }
};

// Get company by ID
exports.getCompanyById = async (req, res) => {
    try {
        const userId = req.userId;  // Get userId from the authenticated request (from JWT middleware)

        if (!userId) {
            return res.status(400).json("User ID is missing in the request.");
        }

        const companyId = req.params.id;  // Get companyId from the route params

        // Find the company by its ID and ensure it belongs to the authenticated user
        const company = await companies.findOne({ _id: companyId, userId: userId });

        if (!company) {
            return res.status(404).json('Company not found or does not belong to the user.');
        }

        return res.status(200).json(company);
    } catch (err) {
        console.log(err);
        return res.status(500).json('Server Error while fetching the company.');
    }
};

exports.registerCompany = async (req, res) => {
    console.log('Inside registerCompany');
    try {
        // Log the userId to ensure it's being passed correctly
        console.log("req.userId:", req.userId);

        if (!req.userId) {
            return res.status(400).json("User ID is missing in the request.");
        }

        // Destructure other fields from the request body
        const { name, description, location, website, logo } = req.body;

        // Validate required fields
        if (!name || !description || !location) {
            return res.status(400).json("All required fields (name, description, location) must be provided.");
        }

        // Check if the company already exists
        let company = await companies.findOne({ name });
        if (company) {
            return res.status(400).json("Company already exists.");
        }

        // Optional: Check if the user exists (for extra validation)
        const userExists = await User.findById(req.userId);
        if (!userExists) {
            return res.status(400).json("User not found.");
        }

        // Create the new company with the userId
        company = await companies.create({
            name,
            description,
            location,
            website,
            logo,
            userId: req.userId // Ensure userId is passed correctly
        });

        return res.status(201).json({
            message: "Company registered successfully",
            company: {
                id: company._id,
                name: company.name,
                description: company.description,
                location: company.location,
                website: company.website,
                logo: company.logo,
                userId: company.userId
            }
        });
    } catch (error) {
        console.error("Error inside registerCompany:", error);
        return res.status(500).json("Server error while registering company.");
    }
};
  