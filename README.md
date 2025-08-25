# Content Licensing Waitlist App

A simple, powerful waitlist web app to unite websites in pushing AI companies to adopt content licensing APIs instead of free crawling.

## 🎯 Purpose

Campaign for websites to "unionize" and push AI companies to adopt a content licensing API instead of free crawling.

**Headline:** "Own Your Content. Get Paid When AI Trains On It."

## 🛠 Features

- **Bold Landing Page**: Compelling headline and mission statement
- **Real-time Counter**: Shows "X websites have joined the movement"
- **Email Signup**: Simple waitlist form with email + optional website
- **SQLite Backend**: Lightweight database storage
- **Modern Design**: Clean, mobile-friendly interface with gradient background
- **API Integration**: FastAPI backend with CORS support

## 🚀 Quick Start

### Backend (FastAPI + SQLite)

```bash
cd backend
source ../../venv/bin/activate  # or create new venv
pip install -r requirements.txt
python main.py
```

Backend runs on: http://localhost:8000

### Frontend (React + TailwindCSS)

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: http://localhost:5173

## 📡 API Endpoints

- **GET** `/` - API status
- **GET** `/stats` - Get current signup count
- **POST** `/signup` - Add email to waitlist
  ```json
  {
    "email": "user@example.com",
    "website": "https://example.com"
  }
  ```
- **GET** `/waitlist` - View all entries (admin)

## 🗄 Database Schema

SQLite table: `waitlist`
- `id` - Auto-increment primary key
- `email` - Unique email address
- `website` - Optional website URL
- `created_at` - Timestamp

## 🎨 Design Features

- **Gradient Background**: Blue to purple gradient
- **Glassmorphism**: Semi-transparent counter with backdrop blur
- **Responsive**: Mobile-first design with Tailwind CSS
- **Interactive**: Hover effects and loading states
- **Accessible**: High contrast colors and proper form labels

## 🚀 Deployment Options

### Option 1: Vercel (Frontend) + Railway (Backend)

**Frontend (Vercel):**
1. Push frontend to GitHub
2. Connect to Vercel
3. Update API_BASE URL to production backend

**Backend (Railway):**
1. Push backend to GitHub
2. Connect to Railway
3. Add environment variables if needed

### Option 2: Single Server (DigitalOcean/AWS)

1. Install Node.js and Python
2. Build React app: `npm run build`
3. Serve with nginx
4. Run FastAPI with gunicorn: `gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker`

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
