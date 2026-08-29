import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.database.seed import init_db_and_seed
from app.api.plants import router as plants_router
from app.api.chat import router as chat_router
from app.api.recommend import router as recommend_router
from app.api.graph import router as graph_router
from app.api.identify import router as identify_router
from app.api.quiz import router as quiz_router
from app.api.auth import router as auth_router
from app.api.analytics import router as analytics_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("mpi_backend")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing IEEE MPI Database & Seeding records...")
    try:
        await init_db_and_seed()
    except Exception as e:
        logger.warning(f"Database seed initialization warning: {e}")
    yield
    logger.info("Shutting down backend services.")

app = FastAPI(
    title="AI-Powered Medicinal Plant Heritage Explorer API",
    description="Backend service powered by FastAPI, IEEE MPI dataset on PostgreSQL, OpenRouter Nemotron-3 Ultra LLM, TF-IDF Recommendations, MobileNetV2 Vision Classifier, and Knowledge Graph API.",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware for React / TanStack Start frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global unhandled error at {request.url}: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred in the MPI backend service."}
    )

# Register API Routers
app.include_router(plants_router, prefix="/api")
app.include_router(chat_router, prefix="/api")
app.include_router(recommend_router, prefix="/api")
app.include_router(graph_router, prefix="/api")
app.include_router(identify_router, prefix="/api")
app.include_router(quiz_router, prefix="/api")
app.include_router(auth_router, prefix="/api")
app.include_router(analytics_router, prefix="/api")

@app.get("/")
async def root():
    return {
        "status": "online",
        "service": "AI-Powered Interactive Medicinal Plant Heritage Explorer Backend",
        "docs": "/docs",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
