#### Toggle Completion

```http
POST /completions/toggle
```

**Request Body:**

```json
{
  "habitId": "string",
  "date": "string (ISO date)"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "string",
    "habitId": "string",
    "date": "string (ISO date)",
    "completed": boolean,
    "completedAt": "string (ISO date)"
  },
  "message": "Completion toggled successfully"
}
```

#### Update Completion

```http
PUT /completions/:id
```

**Request Body:**

```json
{
  "completed": boolean,
  "value": number
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "string",
    "habitId": "string",
    "date": "string (ISO date)",
    "completed": boolean,
    "value": number,
    "completedAt": "string (ISO date)"
  },
  "message": "Completion updated successfully"
}
```

#### Delete Completion
