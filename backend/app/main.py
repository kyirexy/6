"""
VideoCapsule FastAPI application entry point.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router
from app.core.database import Base, engine

# Import all models so they are registered with Base.metadata before create_all.
from app.models.note import Note  # noqa: F401


def create_app() -> FastAPI:
    """Application factory."""
    app = FastAPI(
        title="VideoCapsule API",
        description="抖音视频转知识卡片 API",
        version="0.1.0",
    )

    # CORS -- wide-open for local development; tighten in production.
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Register routes
    app.include_router(router)

    # Create database tables on startup
    @app.on_event("startup")
    def on_startup() -> None:
        Base.metadata.create_all(bind=engine)

    return app


app = create_app()
