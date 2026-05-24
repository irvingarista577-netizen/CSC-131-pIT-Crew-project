from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from starlette.concurrency import run_in_threadpool

#getting AHA login and session functions from aha_auth.py
from aha_auth import (
    login_to_aha_sync,
    check_aha_session_sync,
    open_training_site_classes_sync,
    sign_out_aha_sync,
)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AhaLoginRequest(BaseModel):
    username: str
    password: str

# login API route for connecting to AHA website
@app.post("/api/aha/login")
async def aha_login(data: AhaLoginRequest):
    return await run_in_threadpool(
        login_to_aha_sync,
        data.username,
        data.password
    )

@app.get("/api/aha/status")
async def aha_status():
    return await run_in_threadpool(check_aha_session_sync)

@app.post("/api/aha/open-training-site-classes")
async def open_training_site_classes():
    return await run_in_threadpool(open_training_site_classes_sync)

#sign out by clearing saved AHA session
@app.post("/api/aha/signout")
async def aha_signout():
    return sign_out_aha_sync()
