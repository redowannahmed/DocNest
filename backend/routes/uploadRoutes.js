const express = require('express');
const { uploadPrescription, uploadTestReport } = require('../middleware/uploadMiddleware');
const { 
  uploadPrescription: uploadPrescriptionCtrl,
  uploadTestReport: uploadTestReportCtrl,
  uploadConditionPrescription: uploadConditionPrescriptionCtrl,
  deleteImage
} = require('../controllers/uploadController');

const router = express.Router();

router.post('/prescription', uploadPrescription, uploadPrescriptionCtrl);
router.post('/test-report', uploadTestReport, uploadTestReportCtrl);
router.post('/condition-prescription', uploadPrescription, uploadConditionPrescriptionCtrl);
router.delete('/image/:publicId', deleteImage);

module.exports = router;