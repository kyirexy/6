"""
SQLAlchemy engine, session factory, and FastAPI dependency.
"""

from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.core.config import settings

engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False}  # required for SQLite
    if settings.DATABASE_URL.startswith("sqlite")
    else {},
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    """Shared declarative base for all ORM models."""
    pass


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency that yields a DB session and ensures cleanup."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
