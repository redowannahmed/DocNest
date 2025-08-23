// Test script to verify admin functionality
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testAdminFunctionality() {
    try {
        console.log('🧪 Testing Admin Functionality...\n');

        // Test 1: Admin Login
        console.log('1️⃣  Testing Admin Login...');
        const adminLogin = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'admin',
            password: 'admin123',
            role: 'admin'
        });
        
        const adminToken = adminLogin.data.token;
        console.log('✅ Admin login successful');
        console.log('   Admin user:', adminLogin.data.user);

        // Test 2: Doctor Registration Request
        console.log('\n2️⃣  Testing Doctor Registration Request...');
        const doctorRequest = await axios.post(`${BASE_URL}/auth/register`, {
            name: 'Dr. John Smith',
            email: 'john.smith@example.com',
            password: 'SecurePass123!',
            age: 35,
            gender: 'male',
            location: 'New York',
            role: 'doctor'
        });
        console.log('✅ Doctor registration request created');
        console.log('   Response:', doctorRequest.data);

        // Test 3: Get Pending Doctor Requests (Admin)
        console.log('\n3️⃣  Testing Get Pending Doctor Requests...');
        const pendingRequests = await axios.get(`${BASE_URL}/admin/doctor-requests/pending`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        console.log('✅ Pending requests retrieved');
        console.log('   Pending requests:', pendingRequests.data.length);

        if (pendingRequests.data.length > 0) {
            const requestId = pendingRequests.data[0]._id;
            
            // Test 4: Approve Doctor Request
            console.log('\n4️⃣  Testing Doctor Request Approval...');
            const approval = await axios.post(`${BASE_URL}/admin/doctor-requests/${requestId}/approve`, {}, {
                headers: { Authorization: `Bearer ${adminToken}` }
            });
            console.log('✅ Doctor request approved');
            console.log('   New doctor:', approval.data.doctor);

            // Test 5: Doctor Login
            console.log('\n5️⃣  Testing New Doctor Login...');
            const doctorLogin = await axios.post(`${BASE_URL}/auth/login`, {
                email: 'john.smith@example.com',
                password: 'SecurePass123!',
                role: 'doctor'
            });
            console.log('✅ Doctor login successful');
            console.log('   Doctor user:', doctorLogin.data.user);
        }

        // Test 6: Admin Dashboard Stats
        console.log('\n6️⃣  Testing Admin Dashboard Stats...');
        const stats = await axios.get(`${BASE_URL}/admin/stats`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        console.log('✅ Admin stats retrieved');
        console.log('   Stats:', stats.data);

        console.log('\n🎉 All tests passed! Admin functionality is working correctly.');

    } catch (error) {
        console.error('❌ Test failed:');
        if (error.response) {
            console.error('   Status:', error.response.status);
            console.error('   Message:', error.response.data.message || error.response.data);
        } else {
            console.error('   Error:', error.message);
        }
    }
}

// Run the test
if (require.main === module) {
    testAdminFunctionality();
}

module.exports = testAdminFunctionality;
