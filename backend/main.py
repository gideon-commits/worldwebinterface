from fastapi import FastAPI, HTTPException, Depends, Form
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from fastapi.responses import HTMLResponse, RedirectResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.middleware.sessions import SessionMiddleware
from starlette.requests import Request
from pydantic import BaseModel
import sqlite3
from datetime import datetime
import os
from contextlib import contextmanager
import logging
import secrets
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Rate limiting
limiter = Limiter(key_func=get_remote_address)
app = FastAPI(title="Content Union Waitlist API")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Mount static files (frontend build)
if os.path.exists("../frontend/dist"):
    app.mount("/assets", StaticFiles(directory="../frontend/dist/assets"), name="assets")
    app.mount("/static", StaticFiles(directory="../frontend/dist"), name="static")

# Add session middleware
app.add_middleware(SessionMiddleware, secret_key="your-secret-key-change-in-production")

# CORS middleware for React frontend
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:5173,http://localhost:5174,http://localhost:5175,https://worldwebinterface-frontend.onrender.com").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# Database setup
DATABASE_PATH = os.getenv("DATABASE_PATH", "waitlist.db")

# Admin authentication
ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "admin")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "changeme123")
security = HTTPBasic()

def verify_admin_session(request: Request):
    """Verify admin session"""
    if not request.session.get("admin_authenticated"):
        raise HTTPException(
            status_code=401,
            detail="Not authenticated"
        )
    return True

def verify_admin_credentials(username: str, password: str) -> bool:
    """Verify admin credentials"""
    correct_username = secrets.compare_digest(username, ADMIN_USERNAME)
    correct_password = secrets.compare_digest(password, ADMIN_PASSWORD)
    return correct_username and correct_password

@contextmanager
def get_db_connection():
    """Context manager for database connections"""
    conn = sqlite3.connect(DATABASE_PATH)
    try:
        yield conn
    finally:
        conn.close()

def init_db():
    """Initialize SQLite database with waitlist table"""
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS waitlist (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            website TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()

# Initialize database on startup
init_db()

class SignupRequest(BaseModel):
    email: str
    website: str = ""

class SignupResponse(BaseModel):
    success: bool
    message: str
    total_signups: int

@app.get("/api")
def read_root():
    """Health check endpoint"""
    return {"message": "Content Union Waitlist API", "status": "running"}

@app.get("/")
def serve_frontend():
    """Serve the React frontend"""
    if os.path.exists("../frontend/dist/index.html"):
        return FileResponse("../frontend/dist/index.html")
    return {"message": "Frontend not built. Run 'npm run build' first."}


@app.get("/api/stats")
@limiter.limit("30/minute")
def get_stats(request: Request):
    """Get current signup statistics"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        try:
            cursor.execute("SELECT COUNT(*) FROM waitlist")
            total_signups = cursor.fetchone()[0]
            logger.info(f"Stats requested - Total signups: {total_signups}")
            return {"total_signups": total_signups}
        except Exception as e:
            logger.error(f"Database error in get_stats: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.post("/api/signup")
@limiter.limit("5/minute")
def signup(signup_data: SignupRequest, request: Request):
    """Add email to waitlist"""
    # Validate email format
    email = signup_data.email.lower().strip()
    if not email or '@' not in email or len(email) > 254:
        logger.warning(f"Invalid email format attempted: {email[:20]}...")
        raise HTTPException(status_code=400, detail="Invalid email format")
    
    # Basic email validation
    if not email.count('@') == 1 or '..' in email:
        logger.warning(f"Invalid email format attempted: {email[:20]}...")
        raise HTTPException(status_code=400, detail="Invalid email format")
    
    with get_db_connection() as conn:
        cursor = conn.cursor()
        try:
            # Insert new signup
            cursor.execute(
                "INSERT INTO waitlist (email, website) VALUES (?, ?)",
                (email, signup_data.website.strip()[:500])  # Limit website URL length
            )
            conn.commit()
            
            # Get updated count
            cursor.execute("SELECT COUNT(*) FROM waitlist")
            total_signups = cursor.fetchone()[0]
            
            logger.info(f"New signup: {email[:20]}... - Total: {total_signups}")
            
            return SignupResponse(
                success=True,
                message="Successfully joined the waitlist!",
                total_signups=total_signups
            )
            
        except sqlite3.IntegrityError:
            # Email already exists
            cursor.execute("SELECT COUNT(*) FROM waitlist")
            total_signups = cursor.fetchone()[0]
            
            logger.info(f"Duplicate signup attempt: {email[:20]}...")
            
            return SignupResponse(
                success=False,
                message="Email already registered!",
                total_signups=total_signups
            )
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.get("/api/waitlist")
def get_waitlist(authenticated: bool = Depends(verify_admin_session)):
    """Get all waitlist entries (for admin use)"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        try:
            cursor.execute("SELECT email, website, created_at FROM waitlist ORDER BY created_at DESC")
            entries = cursor.fetchall()
            
            return {
                "entries": [
                    {"email": entry[0], "website": entry[1], "created_at": entry[2]}
                    for entry in entries
                ]
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.get("/admin")
def admin_panel(request: Request):
    """Admin panel - redirect to login if not authenticated"""
    if not request.session.get("admin_authenticated"):
        return RedirectResponse(url="/admin/login", status_code=302)
    return RedirectResponse(url="/admin/dashboard", status_code=302)

@app.get("/admin/login", response_class=HTMLResponse)
def admin_login_page():
    """Beautiful admin login page"""
    return """
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Admin Login - Website Union</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 min-h-screen flex items-center justify-center">
        <div class="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
            <div class="text-center mb-8">
                <div class="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-shield-alt text-white text-2xl"></i>
                </div>
                <h1 class="text-2xl font-bold text-gray-900 mb-2">Admin Access</h1>
                <p class="text-gray-600">Website Union Dashboard</p>
            </div>
            
            <form method="post" action="/admin/login" class="space-y-6">
                <div>
                    <label for="username" class="block text-sm font-medium text-gray-700 mb-2">Username</label>
                    <input 
                        type="text" 
                        id="username" 
                        name="username" 
                        required 
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="Enter your username"
                    >
                </div>
                
                <div>
                    <label for="password" class="block text-sm font-medium text-gray-700 mb-2">Password</label>
                    <input 
                        type="password" 
                        id="password" 
                        name="password" 
                        required 
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="Enter your password"
                    >
                </div>
                
                <div id="error-message" class="hidden bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    Invalid credentials. Please try again.
                </div>
                
                <button 
                    type="submit" 
                    class="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                    <i class="fas fa-sign-in-alt"></i>
                    <span>Sign In</span>
                </button>
            </form>
            
            <div class="mt-6 text-center">
                <a href="/" class="text-blue-500 hover:text-blue-600 text-sm flex items-center justify-center space-x-1">
                    <i class="fas fa-arrow-left"></i>
                    <span>Back to Website</span>
                </a>
            </div>
        </div>
        
        <script>
            // Show error message if URL contains error parameter
            if (window.location.search.includes('error=1')) {
                document.getElementById('error-message').classList.remove('hidden');
            }
        </script>
    </body>
    </html>
    """

@app.post("/admin/login")
def admin_login_post(request: Request, username: str = Form(...), password: str = Form(...)):
    """Process admin login"""
    if verify_admin_credentials(username, password):
        request.session["admin_authenticated"] = True
        return RedirectResponse(url="/admin/dashboard", status_code=302)
    else:
        return RedirectResponse(url="/admin/login?error=1", status_code=302)

@app.get("/admin/logout")
def admin_logout(request: Request):
    """Admin logout"""
    request.session.pop("admin_authenticated", None)
    return RedirectResponse(url="/admin/login", status_code=302)

@app.get("/admin/dashboard", response_class=HTMLResponse)
def admin_dashboard(request: Request, authenticated: bool = Depends(verify_admin_session)):
    """Beautiful HTML admin panel"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        try:
            cursor.execute("SELECT email, website, created_at FROM waitlist ORDER BY created_at DESC")
            entries = cursor.fetchall()
            
            # Generate table rows
            table_rows = ""
            for i, entry in enumerate(entries, 1):
                email = entry[0]
                website = entry[1] if entry[1] else "Not provided"
                created_at = entry[2]
                
                table_rows += f"""
                <tr class="border-b border-gray-200 hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{i}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{email}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                        {f'<a href="{website}" target="_blank" class="hover:underline">{website}</a>' if website != "Not provided" else website}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{created_at}</td>
                </tr>
                """
            
            html_content = f"""
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Website Union - Admin Panel</title>
                <script src="https://cdn.tailwindcss.com"></script>
                <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
            </head>
            <body class="bg-gray-100 min-h-screen">
                <div class="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                    <!-- Header -->
                    <div class="mb-8">
                        <div class="flex items-center justify-between">
                            <div>
                                <h1 class="text-3xl font-bold text-gray-900">Admin Panel</h1>
                                <p class="mt-2 text-gray-600">Website Union Waitlist Management</p>
                            </div>
                            <div class="flex space-x-4">
                                <button onclick="exportCSV()" class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
                                    <i class="fas fa-download"></i>
                                    <span>Export CSV</span>
                                </button>
                                <button onclick="window.location.reload()" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
                                    <i class="fas fa-refresh"></i>
                                    <span>Refresh</span>
                                </button>
                                <a href="/admin/logout" class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
                                    <i class="fas fa-sign-out-alt"></i>
                                    <span>Logout</span>
                                </a>
                            </div>
                        </div>
                    </div>

                    <!-- Stats Cards -->
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div class="bg-white rounded-lg shadow p-6">
                            <div class="flex items-center">
                                <div class="p-3 rounded-full bg-blue-100">
                                    <i class="fas fa-users text-blue-600 text-xl"></i>
                                </div>
                                <div class="ml-4">
                                    <p class="text-sm font-medium text-gray-600">Total Signups</p>
                                    <p class="text-2xl font-bold text-gray-900">{len(entries)}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="bg-white rounded-lg shadow p-6">
                            <div class="flex items-center">
                                <div class="p-3 rounded-full bg-green-100">
                                    <i class="fas fa-globe text-green-600 text-xl"></i>
                                </div>
                                <div class="ml-4">
                                    <p class="text-sm font-medium text-gray-600">With Websites</p>
                                    <p class="text-2xl font-bold text-gray-900">{len([e for e in entries if e[1]])}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="bg-white rounded-lg shadow p-6">
                            <div class="flex items-center">
                                <div class="p-3 rounded-full bg-purple-100">
                                    <i class="fas fa-calendar text-purple-600 text-xl"></i>
                                </div>
                                <div class="ml-4">
                                    <p class="text-sm font-medium text-gray-600">Latest Signup</p>
                                    <p class="text-sm font-bold text-gray-900">{entries[0][2] if entries else "None"}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Table -->
                    <div class="bg-white shadow rounded-lg overflow-hidden">
                        <div class="px-6 py-4 border-b border-gray-200">
                            <h2 class="text-lg font-semibold text-gray-900">Waitlist Entries</h2>
                        </div>
                        
                        <div class="overflow-x-auto">
                            <table class="min-w-full divide-y divide-gray-200">
                                <thead class="bg-gray-50">
                                    <tr>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Website</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                                    </tr>
                                </thead>
                                <tbody class="bg-white divide-y divide-gray-200">
                                    {table_rows if entries else '<tr><td colspan="4" class="px-6 py-4 text-center text-gray-500">No signups yet</td></tr>'}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <script>
                function exportCSV() {{
                    const data = {[{"email": entry[0], "website": entry[1] or "", "created_at": entry[2]} for entry in entries]};
                    
                    let csv = 'Email,Website,Joined\\n';
                    data.forEach(row => {{
                        csv += `"${{row.email}}","${{row.website}}","${{row.created_at}}"\\n`;
                    }});
                    
                    const blob = new Blob([csv], {{ type: 'text/csv' }});
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'waitlist-signups.csv';
                    a.click();
                    window.URL.revokeObjectURL(url);
                }}
                </script>
            </body>
            </html>
            """
            
            return html_content
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

# Catch-all route to serve React app for client-side routing (must be last)
@app.get("/{full_path:path}")
def serve_react_app(full_path: str):
    """Serve React app for all non-API routes"""
    # Serve static files directly
    if full_path.startswith("assets/"):
        return FileResponse(f"../frontend/dist/{full_path}")
    
    # For all other routes, serve the React app
    if os.path.exists("../frontend/dist/index.html"):
        return FileResponse("../frontend/dist/index.html")
    return {"message": "Frontend not built. Run 'npm run build' first."}

if __name__ == "__main__":
    import uvicorn
    host = os.getenv("API_HOST", "0.0.0.0")
    port = int(os.getenv("PORT", os.getenv("API_PORT", "8000")))
    uvicorn.run(app, host=host, port=port)
