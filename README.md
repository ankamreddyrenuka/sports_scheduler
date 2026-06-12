# Sport Scheduler

A full-stack Express.js and MongoDB web application for scheduling sports teams and events. Manage teams, register users, create events, and administer the platform with role-based access control.

## Features

- **User Authentication**: Registration and login with bcrypt password hashing
- **Team Management**: Create, view, and manage sports teams with player lists
- **Event Scheduling**: Schedule events and link teams to events
- **Admin Dashboard**: Role-based admin interface to manage teams and events
- **Session Management**: Secure session handling with MongoDB store
- **Responsive UI**: EJS templating with CSS styling

## Tech Stack

- **Backend**: Express.js (Node.js)
- **Database**: MongoDB (local or MongoDB Atlas)
- **Templating**: EJS + express-ejs-layouts
- **Authentication**: bcryptjs, express-session
- **Logging**: Morgan

## Project Structure

```
Sport scheduler/
├── app.js                 # Main Express app
├── package.json
├── seed.js               # Database seeding script
├── controllers/          # Route logic (auth, events, teams)
├── models/               # Mongoose schemas (User, Team, Event, Admin)
├── routes/               # Express routes
├── middleware/           # Custom middleware (auth, adminOnly)
├── views/                # EJS templates
├── public/               # Static assets (CSS, JS)
└── scripts/
    └── showTeams.js      # Utility to list teams from DB
```

## Installation

### Prerequisites

- Node.js (v14+)
- npm
- MongoDB (local) OR MongoDB Atlas account

### Setup Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/ankamreddyrenuka/sport-scheduler.git
   cd sport-scheduler
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Create `.env` file** (optional, defaults to local MongoDB):
   ```bash
   PORT=3000
   MONGO_URI=mongodb://localhost:27017/sport-scheduler
   SESSION_SECRET=your-secret-key-here
   FORCE_ATLAS=false
   ```

## Running the Server

### Option 1: Local MongoDB (Default)

Ensure MongoDB is running locally on port `27017`, then:

```bash
npm start
```

Server will run on `http://localhost:3000` and connect to local MongoDB.

### Option 2: MongoDB Atlas (Cloud)

1. **Set your Atlas URI and enable Atlas mode**:
   ```bash
   $env:MONGO_URI='mongodb+srv://username:password@cluster.mongodb.net/'
   $env:FORCE_ATLAS='true'
   npm start
   ```

   Replace `username`, `password`, and `cluster` with your Atlas credentials.

2. **The app will**:
   - Attempt to connect to the Atlas URI
   - Fall back to local MongoDB if Atlas fails (unless `FORCE_ATLAS=true`)
   - Log connection status to console

### Development Mode (with auto-reload)

```bash
npm run dev
```

Requires `nodemon` (included in devDependencies).

## Seeding the Database

To populate the database with sample admin user, teams, and events:

```bash
# Against local MongoDB
node seed.js

# Against Atlas MongoDB
$env:MONGO_URI='mongodb+srv://username:password@cluster.mongodb.net/'
node seed.js
```

**Sample Credentials**:
- Email: `admin@gmail.com`
- Password: `admin123`

**Sample Teams**:
- Titans (1 player: Sam - Forward)
- Warriors (1 player: Lee - Guard)
- Strikers (1 player: Ava - Mid)

**Sample Events**:
- City Football League (10 days from seed)
- Intercollege Cricket Cup (20 days from seed)
- City Basketball Championship (30 days from seed)

## Utilities

### Show Teams from Database

```bash
# Against local MongoDB
node scripts/showTeams.js

# Against Atlas MongoDB
$env:MONGO_URI='mongodb+srv://username:password@cluster.mongodb.net/'
node scripts/showTeams.js
```

## Routes & API

### Public Routes
- `GET /` - Home page
- `GET /teams` - View all teams
- `GET /events` - View all events (redirects to login if not authenticated)

### Authentication Routes (`/auth`)
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login
- `GET /auth/login` - Login form
- `GET /auth/register` - Registration form

### Admin Routes (`/admin`)
- `GET /admin` - Admin dashboard (admin only)
- `POST /teams` - Create team (admin only)
- `PUT /teams/:id` - Update team (admin only)
- `DELETE /teams/:id` - Delete team (admin only)
- `POST /events` - Create event (admin only)
- `PUT /events/:id` - Update event (admin only)
- `DELETE /events/:id` - Delete event (admin only)

## Database Connection

The app handles multiple MongoDB connection scenarios:

1. **Local MongoDB** (default if `MONGO_URI` not set):
   - Connects to `mongodb://localhost:27017/sport-scheduler`
   - Recommended for development

2. **Atlas MongoDB** (when `MONGO_URI` contains SRV):
   - If `FORCE_ATLAS=true`, attempts Atlas first
   - If `FORCE_ATLAS=false` (default), skips Atlas to avoid DNS SRV errors when offline
   - Falls back to local MongoDB on connection failure

3. **Custom Connection**:
   - Set `MONGO_URI` to any valid MongoDB URI
   - Set `FORCE_ATLAS=true` to enforce that URI

**Connection Timeout**: 5 seconds per attempt

## Models

### User
```javascript
{
  name: String,
  email: String (unique),
  passwordHash: String,
  role: String ('user' | 'admin'),
  createdAt: Date
}
```

### Team
```javascript
{
  name: String (required),
  players: [{ name: String, position: String }],
  createdBy: ObjectId (ref: User),
  createdAt: Date
}
```

### Event
```javascript
{
  title: String,
  sport: String,
  description: String,
  date: Date,
  time: String,
  venue: String,
  teams: [ObjectId] (ref: Team),
  createdBy: ObjectId (ref: User),
  createdAt: Date
}
```

## Troubleshooting

### Port 3000 Already in Use
Kill the process using port 3000:
```bash
netstat -ano | findstr :3000
taskkill /PID <pid> /F
```

### MongoDB Connection Errors
- **Local**: Ensure MongoDB daemon is running
- **Atlas**: Verify credentials, network access, and internet connectivity
- **SRV Errors**: Set `FORCE_ATLAS=false` or check your MongoDB URI format

### Session/Cookie Issues
Clear browser cookies or use incognito mode for testing

## Deployment

For production deployment:

1. **Use environment variables** for all sensitive data:
   - `MONGO_URI` - MongoDB connection string
   - `SESSION_SECRET` - Strong random secret
   - `PORT` - Server port (default: 3000)
   - `FORCE_ATLAS` - Set to `true` for Atlas-only

2. **Recommended Hosts**:
   - Heroku, Railway, Render (with MongoDB Atlas)
   - AWS EC2 (with local or Atlas MongoDB)
   - Docker containers with MongoDB service

3. **Example Heroku Deploy**:
   ```bash
   heroku create sport-scheduler
   heroku config:set MONGO_URI='mongodb+srv://...'
   heroku config:set SESSION_SECRET='your-strong-secret'
   heroku config:set FORCE_ATLAS='true'
   git push heroku main
   ```

## License

MIT

## Author

Renuka Ankam Reddy

---

**Last Updated**: June 12, 2026  
**Database**: MongoDB (Local or Atlas)  
**Node Version**: v22.16.0
