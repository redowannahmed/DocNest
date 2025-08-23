const DoctorRequest = require("../models/DoctorRequest");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Get all pending doctor requests
exports.getPendingDoctorRequests = async (req, res) => {
    try {
        const pendingRequests = await DoctorRequest.find({ status: "pending" })
            .select("-password") // Don't send password hash
            .sort({ submittedAt: -1 });

        res.json(pendingRequests);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get all doctor requests (pending, approved, rejected)
exports.getAllDoctorRequests = async (req, res) => {
    try {
        const { status } = req.query;
        const filter = status ? { status } : {};
        
        const requests = await DoctorRequest.find(filter)
            .select("-password") // Don't send password hash
            .populate("reviewedBy", "name email")
            .sort({ submittedAt: -1 });

        res.json(requests);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Approve doctor request
exports.approveDoctorRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        
        const doctorRequest = await DoctorRequest.findById(requestId);
        if (!doctorRequest) {
            return res.status(404).json({ message: "Doctor request not found" });
        }

        if (doctorRequest.status !== "pending") {
            return res.status(400).json({ 
                message: `Request has already been ${doctorRequest.status}` 
            });
        }

        // Check if doctor with this email already exists
        const existingDoctor = await User.findOne({ 
            email: doctorRequest.email, 
            role: "doctor" 
        });
        
        if (existingDoctor) {
            return res.status(400).json({ 
                message: "A doctor with this email already exists" 
            });
        }

        // Create the doctor user account
        const newDoctor = new User({
            name: doctorRequest.name,
            email: doctorRequest.email,
            password: doctorRequest.password, // Already hashed
            age: doctorRequest.age,
            gender: doctorRequest.gender,
            location: doctorRequest.location,
            role: "doctor",
            bmdcId: doctorRequest.bmdcId
        });

        await newDoctor.save();

        // Update the request status
        doctorRequest.status = "approved";
        doctorRequest.reviewedAt = new Date();
        doctorRequest.reviewedBy = req.user.id;
        await doctorRequest.save();

        res.json({
            message: "Doctor request approved successfully",
            doctor: {
                id: newDoctor._id,
                name: newDoctor.name,
                email: newDoctor.email,
                role: newDoctor.role
            }
        });
    } catch (err) {
        console.error("Error approving doctor request:", err);
        res.status(500).json({ message: err.message });
    }
};

// Reject doctor request
exports.rejectDoctorRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const { rejectionReason } = req.body;
        
        const doctorRequest = await DoctorRequest.findById(requestId);
        if (!doctorRequest) {
            return res.status(404).json({ message: "Doctor request not found" });
        }

        if (doctorRequest.status !== "pending") {
            return res.status(400).json({ 
                message: `Request has already been ${doctorRequest.status}` 
            });
        }

        // Update the request status
        doctorRequest.status = "rejected";
        doctorRequest.reviewedAt = new Date();
        doctorRequest.reviewedBy = req.user.id;
        doctorRequest.rejectionReason = rejectionReason || "No reason provided";
        await doctorRequest.save();

        res.json({
            message: "Doctor request rejected successfully"
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get dashboard statistics
exports.getAdminStats = async (req, res) => {
    try {
        const [
            totalUsers,
            totalDoctors, 
            totalPatients,
            pendingRequests,
            approvedRequests,
            rejectedRequests
        ] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ role: "doctor" }),
            User.countDocuments({ role: "patient" }),
            DoctorRequest.countDocuments({ status: "pending" }),
            DoctorRequest.countDocuments({ status: "approved" }),
            DoctorRequest.countDocuments({ status: "rejected" })
        ]);

        res.json({
            totalUsers,
            totalDoctors,
            totalPatients,
            pendingRequests,
            approvedRequests,
            rejectedRequests
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
