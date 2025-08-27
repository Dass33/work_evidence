const fs = require('fs');
const { backupDatabase, restoreDatabase } = require('./test-db-helper');

const API_BASE = 'http://localhost:3001/api';
let adminToken = '';
let workerToken = '';
let adminUserId = '';
let workerUserId = '';

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

  const adminUser = { username: 'admin_test', password: 'password123', role: 'admin' };
  const workerUser = { username: 'worker_test', password: 'password123', role: 'worker' };

  console.log('1. Registering admin user...');
  const adminRegResult = await makeRequest('/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(adminUser)
  });
  console.log('Admin registration:', adminRegResult.success ? '✅ SUCCESS' : '❌ FAILED', adminRegResult);
  if (adminRegResult.success) adminUserId = adminRegResult.data.userId;

  console.log('2. Registering worker user...');
  const workerRegResult = await makeRequest('/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(workerUser)
  });
  console.log('Worker registration:', workerRegResult.success ? '✅ SUCCESS' : '❌ FAILED', workerRegResult);
  if (workerRegResult.success) workerUserId = workerRegResult.data.userId;

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
    description: 'Test work entry for automated testing',
    photo_data: null
  };

  console.log('1. Creating work entry as worker...');
  const createResult = await makeRequest('/work-entries', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${workerToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(workEntry)
  });

  console.log('Work entry creation:', createResult.success ? '✅ SUCCESS' : '❌ FAILED', createResult);
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

async function testImageUpload() {
  console.log('\n=== Testing Image Upload ===');

  const workEntry = {
    work_date: '2024-01-16',
    start_time: '09:00',
    end_time: '18:00',
    description: 'Test work entry with image upload',
    photo_data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
  };

  console.log('1. Creating work entry with base64 image...');
  const createResult = await makeRequest('/work-entries', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${workerToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(workEntry)
  });

  console.log('Work entry with image:', createResult.success ? '✅ SUCCESS' : '❌ FAILED', createResult);
}

async function testPhotoDataRetrieval() {
  console.log('\n=== Testing Photo Data Retrieval ===');

  console.log('1. Checking if work entries have photo_data field...');
  const entriesResult = await makeRequest('/work-entries', {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });

  if (entriesResult.success && entriesResult.data.length > 0) {
    const entriesWithPhotos = entriesResult.data.filter(entry => entry.photo_data);
    console.log(`Found ${entriesWithPhotos.length} entries with photos out of ${entriesResult.data.length} total entries`);

    if (entriesWithPhotos.length > 0) {
      const firstPhotoEntry = entriesWithPhotos[0];
      const isBase64 = firstPhotoEntry.photo_data && firstPhotoEntry.photo_data.startsWith('data:image/');
      console.log('Photo data format check:', isBase64 ? '✅ SUCCESS (base64 format)' : '❌ FAILED (not base64)');
    }
  } else {
    console.log('No work entries found to test photo data');
  }
}

async function runAllTests() {
  console.log('🚀 Starting Backend API Tests...');
  console.log('Make sure the backend server is running on port 3001');

  try {
    await backupDatabase();
    
    await testRegisterAndLogin();
    await testWorkEntryCreation();
    await testWorkEntriesRetrieval();
    await testUsersEndpoint();
    await testImageUpload();
    await testPhotoDataRetrieval();

    console.log('\n🎉 All tests completed!');
  } catch (error) {
    console.error('\n❌ Test failed with error:', error);
  } finally {
    await restoreDatabase();
  }
}

if (require.main === module) {
  runAllTests();
}

module.exports = { runAllTests };
