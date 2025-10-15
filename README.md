# Portfolio Backend Setup

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment
Create `.env` file with your MongoDB connection:
```
MONGODB_URI=mongodb://localhost:27017/portfolio
JWT_SECRET=your_secret_key_here
```

### 3. Setup Database & Admin User
```bash
node setup.js
```
This creates default admin user:
- Username: `admin`
- Password: `admin123`

### 4. Start Server
```bash
# Development
npm run dev

# Production
npm start
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/register` - Register new admin
- `GET /api/auth/verify` - Verify token

### Projects
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Skills
- `GET /api/skills/categories` - Get skill categories
- `POST /api/skills/categories` - Create category
- `PUT /api/skills/categories/:id` - Update category
- `DELETE /api/skills/categories/:id` - Delete category
- `GET /api/skills` - Get all skills
- `POST /api/skills` - Create skill
- `PUT /api/skills/:id` - Update skill
- `DELETE /api/skills/:id` - Delete skill

## 🔧 Features

✅ **Complete Backend API**
✅ **MongoDB Database**
✅ **JWT Authentication**
✅ **Admin Panel Integration**
✅ **Dynamic Content Loading**
✅ **Fallback to localStorage**
✅ **CORS Enabled**
✅ **Error Handling**

## 📱 Usage

1. **Start Backend:** `npm run dev`
2. **Access Admin:** `http://localhost:5000/admin`
3. **Login:** Use admin credentials
4. **Manage Content:** Add projects & skills
5. **View Portfolio:** `http://localhost:5000`

## 🔒 Security

- JWT token authentication
- Password hashing with bcrypt
- Input validation
- CORS protection

## 📁 Project Structure

```
Portfolio/
├── models/          # Database models
├── routes/          # API routes
├── server.js        # Main server file
├── setup.js         # Database setup
├── api.js           # Frontend API client
├── admin-backend.js # Admin panel logic
├── frontend-backend.js # Frontend integration
└── package.json     # Dependencies
```