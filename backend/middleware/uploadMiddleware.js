const multer = require('multer');
const { prescriptionStorage, testReportStorage } = require('../utils/cloudinary');

const uploadPrescription = multer({ 
  storage: prescriptionStorage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
}).array('prescriptions', 5);

const uploadTestReport = multer({ 
  storage: testReportStorage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
}).array('testReports', 5);

module.exports = {
  uploadPrescription,
  uploadTestReport
};