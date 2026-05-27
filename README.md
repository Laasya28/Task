# 📚 Student Task Manager

A comprehensive full-stack student task management application built with modern technologies. This project includes user authentication, task management, analytics, and deployment configurations.

![License](https://img.shields.io/badge/license-ISC-blue)
![Node](https://img.shields.io/badge/node-18+-green)
![Docker](https://img.shields.io/badge/docker-supported-blue)
![Kubernetes](https://img.shields.io/badge/kubernetes-supported-blue)

## ✨ Features

### Core Features
- **User Authentication**
  - Register & Login
  - JWT-based session management
  - Password reset functionality
  - Profile management

- **Task Management**
  - Create, Read, Update, Delete (CRUD) tasks
  - Mark tasks as pending, in-progress, or completed
  - Assign priorities (Low, Medium, High)
  - Categorize by subject
  - Set due dates

- **Dashboard**
  - Real-time statistics (total, completed, pending tasks)
  - Progress visualization
  - Charts for task analysis
  - Task timeline view

- **Advanced Features**
  - 🌙 Dark/Light mode
  - 📊 Analytics & statistics
  - 🗓️ Calendar view
  - 🔍 Search & filter
  - 📱 Mobile responsive design
  - ✨ Glassmorphism UI
  - 🎯 Kanban board layout
  - 📥 Task export

## 🛠️ Tech Stack

### Frontend
- HTML5
- Tailwind CSS
- Vanilla JavaScript
- Chart.js for analytics
- Responsive Design

### Backend
- Node.js 18+
- Express.js
- JWT Authentication
- CORS enabled

### Database
- MongoDB 7.0
- Mongoose ODM

### DevOps
- Docker & Docker Compose
- Kubernetes
- GitHub Actions (CI/CD)
- Nginx reverse proxy

## 📁 Project Structure

```
student-task-manager/
├── frontend/
│   ├── index.html              # Login page
│   ├── dashboard.html          # Main app
│   ├── css/
│   │   └── styles.css          # Tailwind + custom styles
│   └── js/
│       ├── auth.js             # Authentication logic
│       ├── dashboard.js        # Dashboard & UI logic
│       ├── tasks.js            # Task management & charts
│       └── utils.js            # Utility functions
│
├── backend/
│   ├── server.js               # Main entry point
│   ├── package.json
│   ├── .env.example
│   ├── config/
│   │   └── database.js
│   ├── models/
│   │   ├── User.js
│   │   └── Task.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── taskController.js
│   │   └── userController.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── tasks.js
│   │   └── user.js
│   └── middleware/
│       └── auth.js
│
├── docker/
│   ├── Dockerfile.backend
│   ├── Dockerfile.frontend
│   ├── nginx.conf
│   └── README.md
│
├── kubernetes/
│   └── deployment.yaml
│
├── .github/workflows/
│   └── ci-cd.yml
│
├── docker-compose.yml
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB 7.0
- Docker & Docker Compose (for containerized setup)
- MongoDB Compass (for database visualization)

### Installation

#### Option 1: Local Development

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/student-task-manager.git
cd student-task-manager
```

2. **Setup Backend**
```bash
cd backend
npm install
cp .env.example .env
```

3. **Configure .env**
```env
MONGODB_URI=mongodb://localhost:27017/student-task-manager
JWT_SECRET=your-secret-key
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

4. **Start MongoDB**
- Open MongoDB Compass
- Create connection: `mongodb://localhost:27017`
- Database will be created automatically on first run

5. **Start Backend**
```bash
npm run dev
```

6. **Start Frontend**
- Open `frontend/index.html` in your browser
- Or use a simple HTTP server:
```bash
# From frontend directory
python -m http.server 3000
# or
npx http-server -p 3000
```

#### Option 2: Docker Compose (Recommended)

```bash
# Navigate to project root
cd student-task-manager

# Build and start all services
docker-compose up --build

# Access the application
# Frontend: http://localhost:3000
# Backend: http://localhost:5000/api
# MongoDB Compass: mongodb://admin:password@localhost:27017/student-task-manager?authSource=admin
```

#### Option 3: Kubernetes

```bash
# Apply Kubernetes manifests
kubectl apply -f kubernetes/deployment.yaml

# Check deployment status
kubectl get pods -n task-manager

# Access services
kubectl port-forward -n task-manager svc/frontend-service 3000:3000
kubectl port-forward -n task-manager svc/backend-service 5000:5000
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Tasks
- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/stats` - Get dashboard statistics
- `POST /api/tasks` - Create new task
- `GET /api/tasks/:id` - Get task details
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `POST /api/tasks/reorder` - Reorder tasks (drag & drop)

### User
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `POST /api/user/change-password` - Change password

## 🔐 Authentication

The application uses JWT (JSON Web Tokens) for authentication. The token is stored in localStorage and sent with each request.

```javascript
// Example: Making authenticated requests
const token = localStorage.getItem('token');
fetch('http://localhost:5000/api/tasks', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

## 📊 Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  profileImage: String,
  theme: 'light' | 'dark',
  notifications: { enabled: Boolean, email: Boolean },
  createdAt: Date,
  updatedAt: Date
}
```

### Tasks Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  title: String,
  description: String,
  priority: 'Low' | 'Medium' | 'High',
  subject: String,
  dueDate: Date,
  status: 'pending' | 'in-progress' | 'completed',
  completedAt: Date,
  tags: [String],
  order: Number,
  createdAt: Date,
  updatedAt: Date
}
```

## 🎨 UI Features

### Modern Design
- Glassmorphism effects
- Gradient backgrounds
- Smooth animations & transitions
- Responsive grid layouts

### Dark Mode
- Full dark mode support
- Persistent theme preference
- Eye-friendly colors

### Responsive Design
- Mobile-first approach
- Tablet optimization
- Desktop-ready UI

## 🧪 Testing

```bash
# Run backend tests
cd backend
npm test
```

## 📦 Deployment

### Docker Compose
```bash
docker-compose up -d
```

### Kubernetes
```bash
kubectl apply -f kubernetes/deployment.yaml
```

### Environment Variables
Create a `.env` file in the backend directory:
```env
MONGODB_URI=mongodb://username:password@host:port/database
JWT_SECRET=your-secret-key
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com
```

## 🔄 CI/CD Pipeline

GitHub Actions workflow automatically:
1. Runs tests on push/PR
2. Builds Docker images
3. Pushes to registry
4. Deploys to server (on main branch)

## 📱 Features in Detail

### Dashboard
- Real-time statistics
- Task completion rate
- Priority distribution
- Subject-wise breakdown
- Progress indicators

### Task Management
- Kanban board view
- Drag & drop support
- Status transitions
- Priority indicators
- Due date tracking

### Analytics
- Task completion trends
- Priority analysis
- Subject distribution
- Productivity metrics

### User Settings
- Profile management
- Password change
- Theme preferences
- Notification settings

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running locally or in Docker
- Check connection string in `.env`
- Use MongoDB Compass to verify connection
- Check username/password if using auth

### Frontend Not Loading
- Ensure backend is running (http://localhost:5000)
- Check browser console for errors
- Verify CORS configuration
- Clear localStorage if issues persist

### Docker Issues
- Rebuild: `docker-compose down && docker-compose up --build`
- Check logs: `docker-compose logs -f`
- Ensure ports 3000, 5000, 27017 are available

## 📄 License

ISC License - See LICENSE file for details

## 👥 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 🎯 Roadmap

- [ ] Email notifications
- [ ] Task templates
- [ ] Team collaboration
- [ ] Mobile app (React Native)
- [ ] Advanced scheduling
- [ ] Pomodoro timer
- [ ] Study streak tracking
- [ ] Achievement badges
- [ ] Social features

## 📧 Support

For issues and questions, please use the GitHub Issues section.

## 🌟 Acknowledgments

- Tailwind CSS for styling
- Chart.js for analytics
- Express.js community
- MongoDB documentation

---

**Happy Task Managing!** 📝✨
