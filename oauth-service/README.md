# GitHub OAuth Authentication Routes

These endpoints allow us to authenticate users via GitHub OAuth and retrieve their GitHub profile information.

## Endpoints

### 1. Exchange GitHub Authorization Code for Access Token

**GET /auth/github/token**  

**Purpose:**  
Exchanges a GitHub authorization code for an access token which can be used to validate all request.

**Query Parameters:**
- `code` (required): The authorization code received from GitHub's OAuth redirect.

Success Response (200):
```json
{
  "access_token": "gho_xxxxxxxxxxxxxxxxxxxx",
  "token_type": "bearer",
  "scope": "user:email"
}
```

### 2. Get User Data
**GET /auth/github/user**

**Purpose:**
Retrieves the authenticated user's GitHub profile information.

**Headers:**
`Authorization` (required): Bearer token from the previous endpoint.
Format: `Bearer your_access_token_here`

Success Response (200):
```json
{
  "id": 12345678,
  "login": "username",
  "name": "User Name",
  "email": "user@example.com",
  "avatar_url": "https://avatars.githubusercontent.com/u/12345678",
  "html_url": "https://github.com/username"
}
```

### 3. Get User by Username
`**GET /users/username/:username**`
**Purpose:**
Retrieves a user's information from the database.

**Path Parameters:**
username (required): The username of the user to retrieve.

Success Response (200):
```
{
  "user": {
    "github_id": 12345678,
    "username": "testuser",
    "name": "Test User",
    "email": "test@example.com",
    "avatar_url": "https://example.com/avatar.jpg",
    "html_url": "https://github.com/testuser",
    "access_token": "gho_xxxxxxxxxxxxxxxxxxxx",
    "modified_date": "2023-01-01T00:00:00.000Z",
    "created_date": "2023-01-01T00:00:00.000Z"
  }
}
```

### 4. Create User
`**POST /users/createUser**`

**Purpose:**
Creates a new user in the database.

Request Body:
```json
{
  "username": "newuser",
  "name": "New User",
  "email": "new@example.com",
  "avatar_url": "https://example.com/newavatar.jpg",
  "html_url": "https://github.com/newuser",
  "access_token": "gho_yyyyyyyyyyyyyyyyyyyy"
}
```

Success Response (201):
```json
{
  "message": "User created successfully",
  "user": {
    "Same structure as GET response"
  }
}
```

### 5. Update User
`**PUT /users/username/:username**`

**Purpose:**
Updates an existing user's information.

**Path Parameters:**
`username` (required): The username of the user to update.

Request Body:
```json
{
  "name": "Updated Name",
  "email": "updated@example.com"
  "Other updatable fields except username"
}
```
Success Response (200):
```json
{
  "message": "User updated successfully",
  "user": {
    
  }
}
```

### 6. Get User Session Status
`**GET /users/:username/session**`

**Purpose:**
Checks if a user's session is still active or has expired.

Path Parameters:
`username` (required): The username of the user to check session for.

Success Response (200):
```json
{
  "expired": false,
  "sessionDuration": 5,
  "sessionLimit": 10,
  "sessionStart": "2023-01-01T00:00:00.000Z"
}
```

### 7. Update User Session
`**PUT /users/:username/session**`

**Purpose:**
Refreshes/updates a user's session timestamp and update with new accesstoken

**Path Parameters:**
username (required): The username of the user to update session for.

Success Response (200):
```json
{
  "message": "Session updated successfully",
  "sessionStart": "2023-01-01T00:00:00.000Z"
}
```

### 8. Add Project
`**POST /projects/add**`

**Purpose:**
Adds a new project/repository for a user to the database.

Request Body:
```json
{
  "user": "username",
  "repolink": "https://github.com/username/repository-name"
}
```
Success Response (200):
```json
{
  "message": "Project added successfully to projects",
  "data": [
    {
      "id": 1,
      "user": "username",
      "repourl": "https://github.com/username/repository-name",
      "created_date": "2023-01-01T00:00:00.000Z"
    }
  ]
}
```
### 9. Fetch User Projects
`**GET /projects/fetch**`

**Purpose:**
Retrieves all projects/repositories for a specific user from a specified table.

**Query Parameters:**
`user` (required): The username to fetch projects for.
`table` (required): The database table name to query (e.g., "projects").

Success Response (200):
```json
[
  {
    "id": 1,
    "user": "username",
    "repourl": "https://github.com/username/repository-1",
    "created_date": "2023-01-01T00:00:00.000Z"
  },
]
```
