# Fluttrr - Social Discovery Platform

Fluttrr shows you what's happening at local businesses around you. Bars, cafes, restaurants, gyms, bowling alleys—they all have events going on that most people never hear about. Trivia nights, board game hours, salsa dancing, fitness classes, happy hour specials. Fluttrr puts it all in one place.

## For Users
Find something to do. Maybe you're new in town and want to meet people. Maybe you have friends coming over and no one has any ideas. Open the app, see what's nearby, and go.

## For Businesses
A simple way to get the word out. Post an event, reach people who are actually looking for something to do, and turn a slow Tuesday into a busy one.

## Tech Stack

### Backend
- **Runtime**: Node.js with Express
- **Database**: PostgreSQL with Sequelize ORM
- **Real-time**: Socket.IO for live chat and notifications
- **Auth**: JWT-based authentication
- **File Uploads**: Multer with Sharp for image processing

### Frontend
- **Framework**: React 18
- **Routing**: React Router v6
- **State**: React Context + Zustand
- **Maps**: Leaflet / React-Leaflet
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Real-time**: Socket.IO Client

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+

### Backend Setup
```bash
cd backend
cp .env.example .env
npm install
npm run seed    # Seed demo data
npm run dev     # Start development server
```

### Frontend Setup
```bash
cd frontend
npm install
npm start       # Start development server
```

### Demo Credentials
- **Email**: demo@fluttrr.com
- **Password**: demo1234

## Project Structure
```
fluttrr/
├── backend/
│   └── src/
│       ├── config/       # Database configuration
│       ├── controllers/  # Route handlers
│       ├── middleware/    # Auth, validation, uploads
│       ├── models/       # Sequelize models
│       ├── routes/       # Express routes
│       ├── seeds/        # Database seed data
│       ├── services/     # Business logic
│       ├── sockets/      # Socket.IO handlers
│       └── utils/        # Helpers and utilities
├── frontend/
│   └── src/
│       ├── api/          # API client and endpoints
│       ├── components/   # Reusable React components
│       ├── contexts/     # React contexts
│       ├── hooks/        # Custom React hooks
│       ├── pages/        # Page components
│       ├── styles/       # Global CSS
│       ├── types/        # Type definitions
│       └── utils/        # Utilities and constants
└── README.md
```

## Features

### Core
- Event discovery feed with personalized recommendations
- Interactive map view with event pins
- Category-based browsing and search
- Event RSVP with capacity management

### Social
- Real-time event group chats
- Direct messaging between users
- Business community channels
- User following system
- Activity notifications

### Business
- Business dashboard with analytics
- Event creation and management
- Review and rating system
- Follower management

### Discovery
- Geolocation-based event search
- Trending events
- "For You" personalized recommendations
- Category filters and search

## API Endpoints

### Auth
- `POST /api/v1/auth/register` - Register
- `POST /api/v1/auth/login` - Login
- `GET /api/v1/auth/me` - Current user

### Events
- `GET /api/v1/events` - List events
- `GET /api/v1/events/nearby` - Nearby events
- `GET /api/v1/events/trending` - Trending events
- `POST /api/v1/events/:id/rsvp` - RSVP to event

### Businesses
- `GET /api/v1/businesses` - List businesses
- `GET /api/v1/businesses/:id` - Business details
- `GET /api/v1/businesses/:id/events` - Business events

### Chat
- `GET /api/v1/chat/rooms` - Chat rooms
- `POST /api/v1/chat/rooms/:id/messages` - Send message

## License
MIT
