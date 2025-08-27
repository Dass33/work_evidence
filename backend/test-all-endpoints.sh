#!/bin/bash

API_BASE="http://localhost:3001/api"

echo "🚀 Starting Backend API Tests..."
echo "Testing endpoints manually with curl"
echo

# Test 1: Register Admin User
echo "=== Test 1: Register Admin User ==="
ADMIN_USERNAME="admin_$(date +%s)"
echo "Username: $ADMIN_USERNAME"
ADMIN_REG_RESPONSE=$(curl -s -X POST "$API_BASE/register" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$ADMIN_USERNAME\",\"password\":\"password123\",\"role\":\"admin\"}")
echo "Response: $ADMIN_REG_RESPONSE"
echo

# Test 2: Register Worker User  
echo "=== Test 2: Register Worker User ==="
WORKER_USERNAME="worker_$(date +%s)"
echo "Username: $WORKER_USERNAME"
WORKER_REG_RESPONSE=$(curl -s -X POST "$API_BASE/register" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$WORKER_USERNAME\",\"password\":\"password123\",\"role\":\"worker\"}")
echo "Response: $WORKER_REG_RESPONSE"
echo

# Test 3: Admin Login
echo "=== Test 3: Admin Login ==="
ADMIN_LOGIN_RESPONSE=$(curl -s -X POST "$API_BASE/login" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$ADMIN_USERNAME\",\"password\":\"password123\"}")
echo "Response: $ADMIN_LOGIN_RESPONSE"
ADMIN_TOKEN=$(echo $ADMIN_LOGIN_RESPONSE | jq -r '.token // empty')
echo "Token extracted: ${ADMIN_TOKEN:0:20}..."
echo

# Test 4: Worker Login
echo "=== Test 4: Worker Login ==="
WORKER_LOGIN_RESPONSE=$(curl -s -X POST "$API_BASE/login" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$WORKER_USERNAME\",\"password\":\"password123\"}")
echo "Response: $WORKER_LOGIN_RESPONSE"
WORKER_TOKEN=$(echo $WORKER_LOGIN_RESPONSE | jq -r '.token // empty')
echo "Token extracted: ${WORKER_TOKEN:0:20}..."
echo

# Test 5: Create Work Entry
echo "=== Test 5: Create Work Entry (Worker) ==="
WORK_ENTRY_RESPONSE=$(curl -s -X POST "$API_BASE/work-entries" \
  -H "Authorization: Bearer $WORKER_TOKEN" \
  -F "work_date=2024-01-15" \
  -F "start_time=08:00" \
  -F "end_time=17:00" \
  -F "description=Test work entry from shell script")
echo "Response: $WORK_ENTRY_RESPONSE"
echo

# Test 6: Get Work Entries (Worker)
echo "=== Test 6: Get Work Entries (Worker) ==="
WORKER_ENTRIES_RESPONSE=$(curl -s -X GET "$API_BASE/work-entries" \
  -H "Authorization: Bearer $WORKER_TOKEN" \
  -H "Content-Type: application/json")
echo "Response: $WORKER_ENTRIES_RESPONSE"
echo "Entry count: $(echo $WORKER_ENTRIES_RESPONSE | jq '. | length')"
echo

# Test 7: Get Work Entries (Admin)
echo "=== Test 7: Get Work Entries (Admin) ==="
ADMIN_ENTRIES_RESPONSE=$(curl -s -X GET "$API_BASE/work-entries" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json")
echo "Response: $ADMIN_ENTRIES_RESPONSE"
echo "Entry count: $(echo $ADMIN_ENTRIES_RESPONSE | jq '. | length')"
echo

# Test 8: Get Users (Admin)
echo "=== Test 8: Get Users (Admin) ==="
ADMIN_USERS_RESPONSE=$(curl -s -X GET "$API_BASE/users" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json")
echo "Response: $ADMIN_USERS_RESPONSE"
echo "User count: $(echo $ADMIN_USERS_RESPONSE | jq '. | length')"
echo

# Test 9: Get Users (Worker - should fail)
echo "=== Test 9: Get Users (Worker - should fail) ==="
WORKER_USERS_RESPONSE=$(curl -s -X GET "$API_BASE/users" \
  -H "Authorization: Bearer $WORKER_TOKEN" \
  -H "Content-Type: application/json")
echo "Response: $WORKER_USERS_RESPONSE"
echo

# Test 10: Test File Upload Endpoint
echo "=== Test 10: Test File Upload Endpoint ==="
if ls uploads/*.png >/dev/null 2>&1; then
  FIRST_FILE=$(ls uploads/*.png | head -1 | xargs basename)
  echo "Testing file: $FIRST_FILE"
  FILE_RESPONSE=$(curl -s -w "%{http_code}" "$API_BASE/uploads/$FIRST_FILE")
  HTTP_CODE=$(echo "$FILE_RESPONSE" | tail -c 4)
  echo "HTTP Status: $HTTP_CODE"
  
  echo "Testing non-existent file:"
  NONEXISTENT_RESPONSE=$(curl -s -w "%{http_code}" "$API_BASE/uploads/nonexistent.png")
  NONEXISTENT_CODE=$(echo "$NONEXISTENT_RESPONSE" | tail -c 4)
  echo "HTTP Status for non-existent: $NONEXISTENT_CODE"
else
  echo "No PNG files found in uploads directory"
fi
echo

echo "✅ All tests completed!"