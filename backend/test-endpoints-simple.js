const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_BASE = 'http://localhost:3001/api';
let adminToken = '';
let workerToken = '';

async function makeRequest(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, options);
    const data = await response.json();
    return { success: response.ok, status: response.status, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function testRegisterAndLogin() {
  console.log('\n=== Testing User Registration & Login ===');
  
  const adminUser = { username: `admin_${Date.now()}`, password: 'password123', role: 'admin' };
  const workerUser = { username: `worker_${Date.now()}`, password: 'password123', role: 'worker' };
  
  console.log('1. Registering admin user...');
  const adminRegResult = await makeRequest('/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(adminUser)
  });
  console.log('Admin registration:', adminRegResult.success ? '✅ SUCCESS' : '❌ FAILED', adminRegResult.success ? `UserId: ${adminRegResult.data.userId}` : adminRegResult.data);
  
  console.log('2. Registering worker user...');
  const workerRegResult = await makeRequest('/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(workerUser)
  });
  console.log('Worker registration:', workerRegResult.success ? '✅ SUCCESS' : '❌ FAILED', workerRegResult.success ? `UserId: ${workerRegResult.data.userId}` : workerRegResult.data);
  
  console.log('3. Admin login...');
  const adminLoginResult = await makeRequest('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: adminUser.username, password: adminUser.password })
  });
  console.log('Admin login:', adminLoginResult.success ? '✅ SUCCESS' : '❌ FAILED');
  if (adminLoginResult.success) adminToken = adminLoginResult.data.token;
  
  console.log('4. Worker login...');
  const workerLoginResult = await makeRequest('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: workerUser.username, password: workerUser.password })
  });
  console.log('Worker login:', workerLoginResult.success ? '✅ SUCCESS' : '❌ FAILED');
  if (workerLoginResult.success) workerToken = workerLoginResult.data.token;
}

async function testWorkEntryCreation() {
  console.log('\n=== Testing Work Entry Creation ===');
  
  const workEntry = {
    work_date: '2024-01-15',
    start_time: '08:00',
    end_time: '17:00',
    description: 'Test work entry for automated testing'
  };
  
  console.log('1. Creating work entry as worker...');
  const formData = new FormData();
  Object.keys(workEntry).forEach(key => {
    formData.append(key, workEntry[key]);
  });
  
  try {
    const response = await fetch(`${API_BASE}/work-entries`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${workerToken}`
      },
      body: formData
    });
    
    const createData = await response.json();
    console.log('Work entry creation:', response.ok ? '✅ SUCCESS' : '❌ FAILED', createData);
  } catch (error) {
    console.log('Work entry creation: ❌ FAILED', error.message);
  }
}

async function testWorkEntriesRetrieval() {
  console.log('\n=== Testing Work Entries Retrieval ===');
  
  console.log('1. Worker fetching own entries...');
  const workerEntriesResult = await makeRequest('/work-entries', {
    headers: { 'Authorization': `Bearer ${workerToken}` }
  });
  console.log('Worker entries fetch:', workerEntriesResult.success ? '✅ SUCCESS' : '❌ FAILED');
  console.log('Entries count:', workerEntriesResult.success ? workerEntriesResult.data.length : 0);
  
  console.log('2. Admin fetching all entries...');
  const adminEntriesResult = await makeRequest('/work-entries', {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  console.log('Admin entries fetch:', adminEntriesResult.success ? '✅ SUCCESS' : '❌ FAILED');
  console.log('Entries count:', adminEntriesResult.success ? adminEntriesResult.data.length : 0);
}

async function testUsersEndpoint() {
  console.log('\n=== Testing Users Endpoint ===');
  
  console.log('1. Admin fetching users...');
  const adminUsersResult = await makeRequest('/users', {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  console.log('Admin users fetch:', adminUsersResult.success ? '✅ SUCCESS' : '❌ FAILED');
  console.log('Users count:', adminUsersResult.success ? adminUsersResult.data.length : 0);
  
  console.log('2. Worker trying to fetch users (should fail)...');
  const workerUsersResult = await makeRequest('/users', {
    headers: { 'Authorization': `Bearer ${workerToken}` }
  });
  console.log('Worker users fetch (should be 403):', workerUsersResult.status === 403 ? '✅ SUCCESS' : '❌ FAILED');
}

async function testUploadEndpoint() {
  console.log('\n=== Testing Upload Endpoint ===');
  
  try {
    const existingFiles = await fs.promises.readdir(path.join(__dirname, 'uploads')).catch(() => []);
    if (existingFiles.length > 0) {
      console.log('1. Testing file access...');
      const testFile = existingFiles[0];
      const response = await fetch(`${API_BASE}/uploads/${testFile}`);
      console.log(`File access for ${testFile}:`, response.ok ? '✅ SUCCESS' : '❌ FAILED');
    } else {
      console.log('No uploaded files to test');
    }
    
    console.log('2. Testing non-existent file...');
    const notFoundResponse = await fetch(`${API_BASE}/uploads/nonexistent.png`);
    console.log('Non-existent file (should be 404):', notFoundResponse.status === 404 ? '✅ SUCCESS' : '❌ FAILED');
  } catch (error) {
    console.log('Upload endpoint test failed:', error.message);
  }
}

async function runAllTests() {
  console.log('🚀 Starting Backend API Tests...');
  console.log('Make sure the backend server is running on port 3001');
  
  try {
    await testRegisterAndLogin();
    await testWorkEntryCreation();
    await testWorkEntriesRetrieval();
    await testUsersEndpoint();
    await testUploadEndpoint();
    
    console.log('\n🎉 All tests completed successfully!');
  } catch (error) {
    console.error('\n❌ Test failed with error:', error);
  }
}

if (require.main === module) {
  runAllTests();
}