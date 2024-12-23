
const users = require('../models/UserModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');



//updated


exports.registerController = async (req, res) => {
    console.log('Inside registerController');
    const { FullName, email, phoneNumber, password, role } = req.body;
    console.log(FullName, email, phoneNumber, password, role);

    try {
        // Check if the user already exists
        const existingUser = await users.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(409).json("User already exists. Please login!");
        } else {
            // Hash the password before saving it
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create a new user with the hashed password
            const newUser = new users({
                FullName,
                email: email.toLowerCase(),
                phoneNumber,
                password: hashedPassword,  // Storing hashed password
                role,
            });

            // Save the new user
            await newUser.save();

            // Exclude password from the response
            newUser.password = undefined;

            res.status(201).json(newUser); // Return the created user without password
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};



exports.loginController = async (req, res) => {
    console.log('Inside loginController');
    const { email, password, role } = req.body;

    try {
        // Find user by email (case-insensitive)
        const existingUser = await users.findOne({ email: email.toLowerCase() });
        if (!existingUser) {
            console.log("No user found with this email.");
            return res.status(404).json("Invalid email or password.");
        }

        console.log("Role from Request:", role);
        console.log("Role from Database:", existingUser.role);

        // Check if the role matches (case-insensitive)
        if (role.trim().toLowerCase() !== existingUser.role.trim().toLowerCase()) {
            console.log("Role mismatch: Request role doesn't match database role.");
            return res.status(400).json("Account doesn't exist with the current role.");
        }

        // Compare the entered password with the hashed password
        const isPasswordMatch = await bcrypt.compare(password, existingUser.password);
        if (!isPasswordMatch) {
            return res.status(400).json("Invalid email or password.");
        }

        // Generate JWT token without expiration
        const token = jwt.sign({ userId: existingUser._id }, process.env.JWTPSWD);

        // Exclude the password from the response
        existingUser.password = undefined;

        res.status(200).json({
            user: existingUser,
            token,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};


exports.profileController = async (req, res) => {
    console.log('Inside profileController');
    const userId = req.userId;  // Make sure userId is available via JWT middleware
    const { FullName, email, phoneNumber, password, role, skills, bio, linkedin } = req.body;

    // If skills are provided as a comma-separated string, convert them to an array
    const skillsArray = skills ? skills.split(',').map(skill => skill.trim()) : [];

    // Handle file upload if available
    const profilePhoto = req.file ? req.file.filename : undefined;

    try {
        // Find the user by their ID to ensure they exist before updating
        const existingUser = await users.findById(userId);
        if (!existingUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // Prepare the data to be updated
        const updatedData = {
            FullName,
            email,
            phoneNumber,
            role,
            profile: {
                bio,
                skills: skillsArray,
                linkedin,
                profilePhoto
            }
        };

        // Only update the password if it's provided
        if (password) {
            // Hash the password if provided
            const hashedPassword = await bcrypt.hash(password, 10);
            updatedData.password = hashedPassword;  // Store hashed password
        }

        // Perform the update
        const updatedUser = await users.findByIdAndUpdate(userId, updatedData, { new: true });

        // Exclude password from the response before sending it back
        updatedUser.password = undefined;

        // Respond with the updated user information
        res.status(200).json(updatedUser);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "An error occurred while updating the profile", error: err });
    }
};



