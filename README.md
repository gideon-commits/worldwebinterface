# Content Union Waitlist App

A modern waitlist application for the Content Union movement - uniting websites to demand fair compensation for AI training data.

## Features

- **Single Deployment** - Frontend and backend served together
- **Modern React Frontend** with Tailwind CSS
- **FastAPI Backend** with SQLite database
- **Real-time signup counter** showing movement growth
- **Email validation** and duplicate prevention
- **Rate limiting** to prevent abuse
- **Admin panel** for managing signups
- **Mobile-responsive** design
- **Docker support** for easy deployment

## Tech Stack

- **Frontend**: React 18 + Vite + Tailwind CSS
- **Backend**: FastAPI + SQLite + Uvicorn
- **Database**: SQLite with automatic initialization
- **Deployment**: Single service deployment (Docker, Render, or standalone)

## Quick Start

### Combined Deployment (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd waitlist-app
   ```

2. **Build and run everything**
   ```bash
   ./build.sh
   cd backend && python main.py
   ```
   
   Access the full app at http://localhost:8000

### Docker Deployment

```bash
docker-compose up --build
```

Access the app at http://localhost:8000

### Development Mode (Separate Services)

1. **Start Backend**
   ```bash
   cd backend
   pip install -r requirements.txt
   python main.py
   ```

2. **Start Frontend** (in new terminal)
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## API Endpoints

- `GET /` - Serve React frontend
- `GET /api/stats` - Get current signup count
- `POST /api/signup` - Add email to waitlist
- `GET /api/waitlist` - Get all entries (admin only)
- `GET /admin` - Admin panel

## Environment Variables

Create `.env` file in backend directory:

```env
DATABASE_PATH=waitlist.db
CORS_ORIGINS=*
API_HOST=0.0.0.0
API_PORT=8000
ADMIN_USERNAME=admin
ADMIN_PASSWORD=changeme123
NODE_ENV=production
### Option 3: Docker

```dockerfile
# Backend Dockerfile
FROM python:3.9-slim
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["python", "main.py"]

# Frontend Dockerfile  
FROM node:18-alpine
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
CMD ["npm", "run", "preview"]
```

## 📊 Analytics Tracking

Track these key metrics:
- Total signups over time
- Conversion rate (visitors → signups)
- Geographic distribution
- Referral sources

## 🔧 Customization

**Update Messaging:**
- Edit headline in `frontend/src/App.jsx`
- Modify mission statement text
- Adjust color scheme in Tailwind classes

**Add Features:**
- Email validation
- Duplicate detection
- Admin dashboard
- Email notifications
- Export functionality

## 🛡 Security Considerations

- Add rate limiting to prevent spam
- Implement email verification
- Use environment variables for sensitive config
- Add HTTPS in production
- Consider GDPR compliance for EU users

## 📱 Mobile Optimization

- Responsive design works on all screen sizes
- Touch-friendly form inputs
- Optimized font sizes and spacing
- Fast loading with minimal dependencies

## 🔗 Tech Stack

- **Frontend**: React 18, Vite, TailwindCSS
- **Backend**: FastAPI, SQLite, Uvicorn
- **Styling**: Modern gradients, glassmorphism effects
- **Deployment**: Ready for Vercel, Railway, or any cloud provider

---

**Ready to launch your content licensing movement!** 🚀

The app is minimal, fast, and designed for maximum conversion. Perfect for rallying websites to demand fair compensation from AI companies.
