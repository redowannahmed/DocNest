const express = require("express");
const router = express.Router();
const { verifyToken, requireAdminRole } = require("../middleware/authMiddleware");
const {
    getPendingDoctorRequests,
    getAllDoctorRequests,
    approveDoctorRequest,
    rejectDoctorRequest,
    getAdminStats
} = require("../controllers/adminController");

// All admin routes require admin role
router.use(verifyToken, requireAdminRole);

// Get dashboard statistics
router.get("/stats", getAdminStats);

// Get all doctor requests (with optional status filter)
router.get("/doctor-requests", getAllDoctorRequests);

// Get only pending doctor requests
router.get("/doctor-requests/pending", getPendingDoctorRequests);

// Approve doctor request
router.post("/doctor-requests/:requestId/approve", approveDoctorRequest);

// Reject doctor request
router.post("/doctor-requests/:requestId/reject", rejectDoctorRequest);

module.exports = router;
