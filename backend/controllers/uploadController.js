const { cloudinary } = require('../utils/cloudinary');

exports.uploadPrescription = async (req, res) => {
  try {
    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const uploadedFiles = files.map(file => ({
      url: file.path,
      publicId: file.filename
    }));

    res.status(200).json({ files: uploadedFiles });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Server error during upload' });
  }
};

exports.uploadTestReport = async (req, res) => {
  try {
    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const uploadedFiles = files.map(file => ({
      url: file.path,
      publicId: file.filename
    }));

    res.status(200).json({ files: uploadedFiles });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Server error during upload' });
  }
};

// Endpoint specifically for condition/medication prescriptions  
exports.uploadConditionPrescription = async (req, res) => {
  try {
    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    // Only allow one file for condition/medication prescriptions
    const uploadedFile = {
      url: files[0].path,
      publicId: files[0].filename
    };

    res.status(200).json({ files: [uploadedFile] });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Server error during upload' });
  }
};

exports.deleteImage = async (req, res) => {
  try {
    const { publicId } = req.params;
    await cloudinary.uploader.destroy(publicId);
    res.status(200).json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: 'Error deleting image' });
  }
};