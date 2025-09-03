const mongoose = require('mongoose');
require('./config/db');
const MedicalHistory = require('./models/MedicalHistory');

mongoose.connection.once('open', async () => {
  try {
    // Find visits with digital prescriptions
    const visits = await MedicalHistory.find({ 
      digitalPrescription: { $exists: true },
      createdByRole: 'doctor'
    }).sort({ createdAt: -1 }).limit(5);
    
    console.log(`Found ${visits.length} visits with digital prescriptions:`);
    
    visits.forEach((visit, i) => {
      console.log(`\n=== Visit ${i+1} ===`);
      console.log('ID:', visit._id);
      console.log('Doctor:', visit.doctor);
      console.log('Date:', visit.date);
      console.log('Created At:', visit.createdAt);
      console.log('Created By Role:', visit.createdByRole);
      
      if (visit.digitalPrescription) {
        console.log('\n--- Digital Prescription Details ---');
        console.log('Medications count:', visit.digitalPrescription.medications?.length || 0);
        console.log('Tests count:', visit.digitalPrescription.tests?.length || 0);
        console.log('Follow-up date:', visit.digitalPrescription.followUpDate);
        console.log('Advice:', visit.digitalPrescription.advice || 'None');
        
        if (visit.digitalPrescription.medications?.length > 0) {
          console.log('\nMedications:');
          visit.digitalPrescription.medications.forEach((med, j) => {
            console.log(`  ${j+1}. Name: "${med.name}"`);
            console.log(`     Dosage: "${med.dosage || 'Not specified'}"`);
            console.log(`     Frequency: "${med.frequency || 'Not specified'}"`);
            console.log(`     Duration: "${med.duration || 'Not specified'}"`);
            console.log(`     Notes: "${med.notes || 'None'}"`);
          });
        }
        
        if (visit.digitalPrescription.tests?.length > 0) {
          console.log('\nTests:');
          visit.digitalPrescription.tests.forEach((test, j) => {
            console.log(`  ${j+1}. ${test}`);
          });
        }
      }
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
});
