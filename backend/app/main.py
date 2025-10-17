from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

# --- DB（SQLAlchemy） ---
from sqlalchemy import Column, Integer, String, DateTime, create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session

DATABASE_URL = "sqlite:///./shifts.db"  # プロジェクト内に shifts.db を作成
engine = create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class ShiftORM(Base):
    __tablename__ = "shifts"
    id = Column(Integer, primary_key=True, index=True)
    user_name = Column(String, index=True, nullable=False)
    role = Column(String, nullable=True)
    start_at = Column(DateTime, nullable=False)
    end_at = Column(DateTime, nullable=False)
    note = Column(String, nullable=True)

Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- API スキーマ ---
class ShiftCreate(BaseModel):
    user_name: str = Field(..., min_length=1, max_length=100)
    role: Optional[str] = None
    start_at: datetime
    end_at: datetime
    note: Optional[str] = None

class ShiftRead(BaseModel):
    id: int
    user_name: str
    role: Optional[str]
    start_at: datetime
    end_at: datetime
    note: Optional[str]

    class Config:
        from_attributes = True

app = FastAPI()

# CORS（Next.jsからのアクセスを許可）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://frontend:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok"}

# --- シフトAPI ---
@app.post("/shifts", response_model=ShiftRead)
def create_shift(payload: ShiftCreate, db: Session = Depends(get_db)):
    if payload.end_at <= payload.start_at:
        raise HTTPException(status_code=400, detail="end_at must be after start_at")
    row = ShiftORM(
        user_name=payload.user_name,
        role=payload.role,
        start_at=payload.start_at,
        end_at=payload.end_at,
        note=payload.note,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row

@app.get("/shifts", response_model=List[ShiftRead])
def list_shifts(db: Session = Depends(get_db)):
    return db.query(ShiftORM).order_by(ShiftORM.start_at.asc()).all()

@app.delete("/shifts/{shift_id}", status_code=204)
def delete_shift(shift_id: int, db: Session = Depends(get_db)):
    row = db.query(ShiftORM).get(shift_id)
    if not row:
        raise HTTPException(status_code=404, detail="shift not found")
    db.delete(row)
    db.commit()
    return

