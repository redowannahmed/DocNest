const express = require('express');
const { uploadPrescription, uploadTestReport } = require('../middleware/uploadMiddleware');
const { 
  uploadPrescription: uploadPrescriptionCtrl,
  uploadTestReport: uploadTestReportCtrl,
  deleteImage
} = require('../controllers/uploadController');

const router = express.Router();

router.post('/prescription', uploadPrescription, uploadPrescriptionCtrl);
router.post('/test-report', uploadTestReport, uploadTestReportCtrl);
router.delete('/image/:publicId', deleteImage);

module.exports = router;