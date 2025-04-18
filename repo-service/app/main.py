import os
from fastapi import FastAPI
from .routers import probe, clone
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

app = FastAPI()

load_dotenv()
ALLOWED_ORIGINS_STR = os.getenv("ALLOWED_ORIGINS")
origins = ALLOWED_ORIGINS_STR.split(',') if ALLOWED_ORIGINS_STR else ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

app.include_router(probe.router)
app.include_router(clone.router)

@app.get("/")
async def root():
    return { "message": "repo service" }
