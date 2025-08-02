const express = require("express")
const { verifyToken } = require("../middleware/authMiddleware")
const MedicalHistory = require("../models/MedicalHistory")
const PinnedCondition = require("../models/PinnedCondition")
const Medication = require("../models/Medication")

const router = express.Router()

// Helper to format image fields - improved to handle all cases
const formatImages = (input) => {
  if (!input) return []

  // If it's already a properly formatted array
  if (Array.isArray(input)) {
    return input.map((img) => {
      if (typeof img === "string") {
        return { url: img, publicId: "unknown" }
      }
      return {
        url: img.url || "",
        publicId: img.publicId || "unknown",
      }
    })
  }

  // If it's a single string
  if (typeof input === "string") {
    return [{ url: input, publicId: "unknown" }]
  }

  // If it's a single object
  if (typeof input === "object") {
    return [
      {
        url: input.url || "",
        publicId: input.publicId || "unknown",
      },
    ]
  }

  return []
}

// ===== MEDICAL HISTORY CRUD =====

// GET all medical history records for logged-in user
router.get("/medical-history", verifyToken, async (req, res) => {
  try {
    const items = await MedicalHistory.find({ user: req.user.id })
    res.json(items)
  } catch (error) {
    console.error("Error fetching medical history:", error.message)
    res.status(500).json({ message: "Failed to fetch medical history" })
  }
})

// POST new medical history entry
router.post("/medical-history", verifyToken, async (req, res) => {
  try {
    const {
      date,
      doctor,
      specialty,
      reason,
      status,
      notes,
      prescriptionImgs,
      testReports,
      // Also accept alternate field names from frontend
      prescriptions,
      testReportImgs,
    } = req.body

    console.log("Received data:", req.body) // Debug log

    // Ensure we have arrays for image fields
    const finalPrescriptionImgs = formatImages(prescriptionImgs || prescriptions)
    const finalTestReports = formatImages(testReports || testReportImgs)

    console.log("Formatted prescription images:", finalPrescriptionImgs)
    console.log("Formatted test reports:", finalTestReports)

    const item = new MedicalHistory({
      user: req.user.id,
      date,
      doctor,
      specialty,
      reason,
      status,
      notes,
      prescriptionImgs: finalPrescriptionImgs,
      testReports: finalTestReports,
    })

    await item.save()
    res.status(201).json(item)
  } catch (error) {
    console.error("Medical history save error:", error.message)
    console.error("Full error:", error) // More detailed error log
    res.status(500).json({ message: "Failed to save medical history: " + error.message })
  }
})

// PUT update medical history entry
router.put("/medical-history/:id", verifyToken, async (req, res) => {
  try {
    const {
      date,
      doctor,
      specialty,
      reason,
      status,
      notes,
      prescriptionImgs,
      testReports,
      // Also accept alternate field names from frontend
      prescriptions,
      testReportImgs,
    } = req.body

    console.log("Updating with data:", req.body) // Debug log

    // Ensure we have arrays for image fields
    const finalPrescriptionImgs = formatImages(prescriptionImgs || prescriptions)
    const finalTestReports = formatImages(testReports || testReportImgs)

    const updateData = {
      date,
      doctor,
      specialty,
      reason,
      status,
      notes,
      prescriptionImgs: finalPrescriptionImgs,
      testReports: finalTestReports,
    }

    const item = await MedicalHistory.findOneAndUpdate({ _id: req.params.id, user: req.user.id }, updateData, {
      new: true,
    })

    if (!item) {
      return res.status(404).json({ message: "Medical history record not found" })
    }

    res.json(item)
  } catch (error) {
    console.error("Medical history update error:", error.message)
    console.error("Full error:", error) // More detailed error log
    res.status(500).json({ message: "Failed to update medical history: " + error.message })
  }
})

// DELETE medical history entry
router.delete("/medical-history/:id", verifyToken, async (req, res) => {
  try {
    const item = await MedicalHistory.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    })

    if (!item) {
      return res.status(404).json({ message: "Medical history record not found" })
    }

    res.json({ message: "Medical history record deleted successfully" })
  } catch (error) {
    console.error("Medical history delete error:", error.message)
    res.status(500).json({ message: "Failed to delete medical history" })
  }
})

// ===== PINNED CONDITIONS CRUD =====

router.get("/pinned-conditions", verifyToken, async (req, res) => {
  try {
    const items = await PinnedCondition.find({ user: req.user.id })
    res.json(items)
  } catch (error) {
    console.error("Error fetching pinned conditions:", error.message)
    res.status(500).json({ message: "Failed to fetch pinned conditions" })
  }
})

router.post("/pinned-conditions", verifyToken, async (req, res) => {
  try {
    const item = new PinnedCondition({ ...req.body, user: req.user.id })
    await item.save()
    res.status(201).json(item)
  } catch (error) {
    console.error("Error saving pinned condition:", error.message)
    res.status(500).json({ message: "Failed to save pinned condition" })
  }
})

// ===== PINNED CONDITIONS CRUD =====

router.delete("/pinned-conditions/:id", verifyToken, async (req, res) => {
  try {
    const condition = await PinnedCondition.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!condition) {
      return res.status(404).json({ message: "Pinned condition not found" });
    }

    res.json({ message: "Pinned condition deleted successfully" });
  } catch (error) {
    console.error("Pinned condition delete error:", error.message);
    res.status(500).json({ message: "Failed to delete pinned condition" });
  }
});


// ===== MEDICATIONS CRUD =====

router.get("/medications", verifyToken, async (req, res) => {
  try {
    const items = await Medication.find({ user: req.user.id })
    res.json(items)
  } catch (error) {
    console.error("Error fetching medications:", error.message)
    res.status(500).json({ message: "Failed to fetch medications" })
  }
})

router.post("/medications", verifyToken, async (req, res) => {
  try {
    const item = new Medication({ ...req.body, user: req.user.id })
    await item.save()
    res.status(201).json(item)
  } catch (error) {
    console.error("Error saving medication:", error.message)
    res.status(500).json({ message: "Failed to save medication" })
  }
})

// ===== MEDICATIONS CRUD =====

router.delete("/medications/:id", verifyToken, async (req, res) => {
  try {
    const medication = await Medication.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!medication) {
      return res.status(404).json({ message: "Medication not found" });
    }
    
    res.json({ message: "Medication deleted successfully" });
  } catch (error) {
    console.error("Medication delete error:", error.message);
    res.status(500).json({ message: "Failed to delete medication" });
  }
});


module.exports = router
