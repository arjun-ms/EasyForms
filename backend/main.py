from fastapi import FastAPI
from .routers import user

app = FastAPI()

app.include_router(user.router)

#- Working
@app.get("/health")
def health_check():
    return {"status": "ok"}
