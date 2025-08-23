const User = require("../models/User");
const DoctorRequest = require("../models/DoctorRequest");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const validator = require("validator");

// Validation function (does not change schema)
function validateRegistration({ name, email, password, age, gender, location, role, bmdcId }) {
    // Name: not empty, min 2 chars, no only numbers, no special chars (except space/dot/dash)
    if (!name || typeof name !== "string" || name.trim().length < 2 || !/^[A-Za-z .'-]+$/.test(name.trim())) {
        return "Name must be at least 2 letters and use only valid characters.";
    }
    // No name like "-1", "  ", "12345", etc.
    if (!/[A-Za-z]/.test(name)) return "Name must contain at least one letter.";
    // Email: required, valid, trim, lowercase
    if (!validator.isEmail(email || "")) return "Invalid email address.";
    // Password: min 8 chars, upper, lower, number, special char
    if (
        !password ||
        password.length < 8 ||
        !/[A-Z]/.test(password) ||
        !/[a-z]/.test(password) ||
        !/[0-9]/.test(password) ||
        !/[^A-Za-z0-9]/.test(password)
    ) {
        return "Password must be at least 8 characters, include uppercase, lowercase, number, and special character.";
    }
    // Age: if given, must be 0-120, integer
    if (age !== undefined && String(age).trim() !== "") {
        if (!validator.isInt(String(age), { min: 0, max: 120 })) return "Age must be a number between 0 and 120.";
    }
    // Gender: allow empty, or (male, female, other)
    if (gender && !["male", "female", "other", "Male", "Female", "Other", ""].includes(gender.trim())) {
        return "Gender must be 'male', 'female', or 'other'.";
    }
    // Location: optional, just must be string
    if (location && typeof location !== "string") return "Invalid location.";
    // Role: must be patient, doctor, or admin
    if (role && !["patient", "doctor", "admin"].includes(role)) return "Role must be patient, doctor, or admin.";
    // BMDC ID: required for doctors
    if (role === "doctor") {
        if (!bmdcId || typeof bmdcId !== "string" || bmdcId.trim().length === 0) {
            return "BMDC ID is required for doctor registration.";
        }
        // Basic BMDC ID format validation (adjust as needed)
        if (!/^[A-Z0-9-]+$/i.test(bmdcId.trim())) {
            return "BMDC ID must contain only letters, numbers, and hyphens.";
        }
    }
    return null; // Valid!
}

exports.register = async (req, res) => {
    try {
        let { name, email, password, age, gender, location, role, bmdcId } = req.body;

        // Sanitize inputs
        name = name ? name.trim() : "";
        email = email ? email.trim().toLowerCase() : "";
        location = location ? location.trim() : "";
        gender = gender ? gender.trim().toLowerCase() : "";
        bmdcId = bmdcId ? bmdcId.trim().toUpperCase() : "";
        role = role && ["doctor", "admin"].includes(role.toLowerCase()) ? role.toLowerCase() : "patient"; // Normalize role

        // Validate input
        const error = validateRegistration({ name, email, password, age, gender, location, role, bmdcId });
        if (error) return res.status(400).json({ message: error });

        // Handle doctor registration differently - create request instead of user
        if (role === "doctor") {
            // Check if there's already a pending request for this email or BMDC ID
            const existingRequest = await DoctorRequest.findOne({ 
                $or: [{ email }, { bmdcId }] 
            });
            if (existingRequest) {
                if (existingRequest.status === "pending") {
                    const field = existingRequest.email === email ? "email" : "BMDC ID";
                    return res.status(400).json({ 
                        message: `A doctor registration request with this ${field} is already pending approval` 
                    });
                } else if (existingRequest.status === "approved") {
                    const field = existingRequest.email === email ? "email" : "BMDC ID";
                    return res.status(400).json({ 
                        message: `A doctor account with this ${field} already exists` 
                    });
                } else if (existingRequest.status === "rejected") {
                    const field = existingRequest.email === email ? "email" : "BMDC ID";
                    return res.status(400).json({ 
                        message: `A doctor registration request with this ${field} was previously rejected` 
                    });
                }
            }

            // Check if doctor already exists as user
            const existingDoctor = await User.findOne({ email, role: "doctor" });
            if (existingDoctor) {
                return res.status(400).json({ 
                    message: "A doctor account with this email already exists" 
                });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const doctorRequest = new DoctorRequest({
                name,
                email,
                password: hashedPassword,
                age: age !== undefined && String(age).trim() !== "" ? Number(age) : undefined,
                gender,
                location,
                bmdcId
            });

            await doctorRequest.save();

            return res.status(201).json({
                message: "Doctor registration request submitted successfully. Please wait for admin approval.",
                requestId: doctorRequest._id
            });
        }

        // For patients and admins, proceed with normal registration
        // Check duplicate email + role combination
        const existingUser = await User.findOne({ email, role });
        if (existingUser) {
            return res.status(400).json({ 
                message: `A ${role} account with this email already exists` 
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            age: age !== undefined && String(age).trim() !== "" ? Number(age) : undefined,
            gender,
            location,
            role
        });

        await newUser.save();

        const token = jwt.sign({ id: newUser._id, role: newUser.role }, process.env.JWT_SECRET, { expiresIn: "7d" });

        res.status(201).json({
            token,
            user: { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role }
        });
    } catch (err) {
        // Handle duplicate key error specifically
        if (err.code === 11000) {
            const role = err.keyValue?.role || "unknown";
            return res.status(400).json({ 
                message: `A ${role} account with this email already exists` 
            });
        }
        res.status(500).json({ message: err.message });
    }
};

exports.login = async (req, res) => {
    try {
        let { email, password, role } = req.body;
        email = email ? email.trim().toLowerCase() : "";
        role = role && ["doctor", "admin"].includes(role.toLowerCase()) ? role.toLowerCase() : "patient"; // Normalize role

        if (!role) return res.status(400).json({ message: "Please select a role" });

        // Handle admin login with default credentials FIRST
        if (role === "admin") {
            console.log("Admin login attempt - Email:", email, "Password:", password); // Debug log
            if (email !== "admin@gmail.com" || password !== "admin123") {
                console.log("Admin credentials mismatch - Expected: admin@gmail.com/admin123"); // Debug log
                return res.status(400).json({ message: "Invalid admin credentials" });
            }

            // Check if admin user exists, if not create it
            let adminUser = await User.findOne({ email: "admin@gmail.com", role: "admin" });
            if (!adminUser) {
                const hashedPassword = await bcrypt.hash("admin123", 10);
                adminUser = new User({
                    name: "Administrator",
                    email: "admin@gmail.com",
                    password: hashedPassword,
                    role: "admin"
                });
                await adminUser.save();
            }

            const token = jwt.sign({ id: adminUser._id, role: adminUser.role }, process.env.JWT_SECRET, { expiresIn: "7d" });

            return res.json({
                token,
                user: { id: adminUser._id, name: adminUser.name, email: adminUser.email, role: adminUser.role }
            });
        }

        // Regular email validation for non-admin users
        if (!validator.isEmail(email)) return res.status(400).json({ message: "Invalid email or password" });
        if (!password || password.length < 8) return res.status(400).json({ message: "Invalid email or password" });

        // Find user with specific email AND role combination
        const user = await User.findOne({ email, role });
        if (!user) {
            return res.status(400).json({ 
                message: `No ${role} account found with this email address` 
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

        // Verify that the user's role matches the requested login role
        if (user.role !== role) {
            return res.status(400).json({ 
                message: `Account role mismatch. This email is registered as a ${user.role}, not a ${role}` 
            });
        }

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });

        res.json({
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
