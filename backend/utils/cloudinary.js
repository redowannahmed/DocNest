const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Create storage engines
const prescriptionStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'medtrack/prescriptions',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation: [{ width: 800, crop: 'limit' }]
  },
});

const testReportStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'medtrack/test-reports',
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
    transformation: [{ width: 800, crop: 'limit' }]
  },
});

module.exports = {
  cloudinary,
  prescriptionStorage,
  testReportStorage
};