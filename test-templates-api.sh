#!/bin/bash

# Test script for note templates API

echo "=== Testing Note Templates API ==="

BASE_URL="http://localhost:5000/api"
TEMPLATE_ID=""

# Get all templates
echo -e "\nTesting GET /templates"
curl -s $BASE_URL/templates | cat

# Create a new template
echo -e "\n\nTesting POST /templates - Creating a new template"
RESPONSE=$(curl -s -X POST $BASE_URL/templates \
  -H "Content-Type: application/json" \
  -d '{"name": "Project Note", "template": "# Project: {{projectName}}\n\n## Goals\n\n## Tasks\n- [ ] \n\n## Notes\n\n## Blockers\n\n"}')

echo $RESPONSE | cat

# Extract ID from response
TEMPLATE_ID=$(echo $RESPONSE | grep -o '"id":"[^"]*"' | cut -d':' -f2 | tr -d '"')
echo -e "\nCreated template with ID: $TEMPLATE_ID"

# Get template by ID
echo -e "\nTesting GET /templates/:id"
curl -s $BASE_URL/templates/$TEMPLATE_ID | cat

# Update template
echo -e "\n\nTesting PUT /templates/:id - Updating template"
curl -s -X PUT $BASE_URL/templates/$TEMPLATE_ID \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Project Note", "template": "# Project: {{projectName}}\n\n## Goals\n\n## Tasks\n- [ ] \n\n## Notes\n\n## Blockers\n\n## Progress\n\n"}' | cat

# Get updated template
echo -e "\n\nVerifying updated template"
curl -s $BASE_URL/templates/$TEMPLATE_ID | cat

# Delete template
echo -e "\n\nTesting DELETE /templates/:id"
curl -s -X DELETE $BASE_URL/templates/$TEMPLATE_ID | cat

# Verify deletion
echo -e "\n\nVerifying template deletion"
curl -s $BASE_URL/templates/$TEMPLATE_ID | cat

echo -e "\n\n=== Note Templates API Test Completed ==="
