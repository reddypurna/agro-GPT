from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import Base, engine
from routers.auth import router as auth_router
from routers.chat import router as chat_router
from routers.weather import router as weather_router
# START OF NEW IMPORT: Import the router for your AgriAgent
from routers.agent import router as agent_router 

# ------------------------------------------------------
# Initialize FastAPI App
# ------------------------------------------------------
app = FastAPI(
    title="AgroGPT Backend (Option A)",
    version="1.0.0",
    description="Backend API for AgroGPT"
)

# ------------------------------------------------------
# Allow CORS
# ------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------------------------------------------
# Create database tables
# ------------------------------------------------------
print("\n===================================")
print("🌱 Starting Backend...")
print("🗄️ Creating database tables if missing...")

Base.metadata.create_all(bind=engine)

print("✅ Tables created successfully!")
print("===================================\n")

# ------------------------------------------------------
# Include Routers
# ------------------------------------------------------
app.include_router(auth_router, prefix="/auth", tags=["Authentication"])
app.include_router(chat_router, prefix="/chat", tags=["Chat"])
app.include_router(weather_router, prefix="/weather", tags=["Weather"])
# START OF NEW INCLUSION: Include the agent router for the RAG/Tool pipeline
app.include_router(agent_router, prefix="/agent", tags=["Agent Pipeline"])


# ------------------------------------------------------
# Root Route
# ------------------------------------------------------
@app.get("/")
def root():
    return {"message": "AgroGPT Backend Running (Option A)"}