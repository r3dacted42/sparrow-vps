import os
from fastapi import FastAPI
from .routers import probe, clone
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

app = FastAPI()

load_dotenv()
SPARROW_ORIGIN_STR = os.getenv("SPARROW_ORIGIN")
origins = SPARROW_ORIGIN_STR.split(',') if SPARROW_ORIGIN_STR else ["*"]
print("allowed origins:", origins)

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
