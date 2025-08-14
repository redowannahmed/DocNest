const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const validator = require("validator");

// Validation function (does not change schema)
function validateRegistration({ name, email, password, age, gender, location, role }) {
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
    // Role: must be patient or doctor
    if (role && !["patient", "doctor"].includes(role)) return "Role must be patient or doctor.";
    return null; // Valid!
}

exports.register = async (req, res) => {
    try {
        let { name, email, password, age, gender, location, role } = req.body;

        // Sanitize inputs
        name = name ? name.trim() : "";
        email = email ? email.trim().toLowerCase() : "";
        location = location ? location.trim() : "";
        gender = gender ? gender.trim().toLowerCase() : "";
        role = role && role.toLowerCase() === "doctor" ? "doctor" : "patient"; // Normalize role

        // Validate input
        const error = validateRegistration({ name, email, password, age, gender, location, role });
        if (error) return res.status(400).json({ message: error });

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
        role = role && role.toLowerCase() === "doctor" ? "doctor" : "patient"; // Normalize role

        if (!validator.isEmail(email)) return res.status(400).json({ message: "Invalid email or password" });
        if (!password || password.length < 8) return res.status(400).json({ message: "Invalid email or password" });
        if (!role) return res.status(400).json({ message: "Please select a role" });

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
