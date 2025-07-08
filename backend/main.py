from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from .routers import user

app = FastAPI()

# Existing user router
app.include_router(user.router)

# Existing health check
@app.get("/health")
def health_check():
    return {"status": "ok"}

# Mount static files for CSS/JS
app.mount("/static", StaticFiles(directory="static"), name="static")

# Setup Jinja2 template engine
templates = Jinja2Templates(directory="templates")

# Serve index.html (login page)
@app.get("/", response_class=HTMLResponse)
async def serve_index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

# Serve Admin Dashboard
@app.get("/admin", response_class=HTMLResponse)
async def serve_admin(request: Request):
    return templates.TemplateResponse("admin-dashboard.html", {"request": request})

# Serve User Dashboard
@app.get("/user", response_class=HTMLResponse)
async def serve_user(request: Request):
    return templates.TemplateResponse("user-dashboard.html", {"request": request})

# Serve Form Builder Dashboard
@app.get("/form-builder", response_class=HTMLResponse)
async def form_builder(request: Request):
    return templates.TemplateResponse("form-builder.html", {"request": request})

# Serve Form Submission Dashboard
@app.get("/form-submission", response_class=HTMLResponse)
async def form_submission(request: Request):
    return templates.TemplateResponse("form-submission.html", {"request": request})
