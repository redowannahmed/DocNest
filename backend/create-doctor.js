const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

async function createDoctor() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/DocNest');
    console.log('Connected to MongoDB');
    
    // Check if doctor already exists
    const existingDoctor = await User.findOne({ email: 'doctor@test.com' });
    if (existingDoctor) {
      console.log('Doctor already exists with email: doctor@test.com');
      console.log('Doctor details:', {
        name: existingDoctor.name,
        email: existingDoctor.email,
        role: existingDoctor.role
      });
      process.exit();
    }
    
    // Create a test doctor
    const hashedPassword = await bcrypt.hash('doctor123', 10);
    const doctor = new User({
      name: 'Dr. Test Doctor',
      email: 'doctor@test.com',
      password: hashedPassword,
      role: 'doctor',
      age: 35,
      gender: 'male',
      location: 'Test City'
    });
    
    await doctor.save();
    console.log('✅ Test doctor created successfully!');
    console.log('📧 Email: doctor@test.com');
    console.log('🔑 Password: doctor123');
    console.log('👨‍⚕️ Role: doctor');
    console.log('\nYou can now log in with these credentials as a doctor.');
    
  } catch (error) {
    console.error('❌ Error creating doctor:', error);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
}

createDoctor();
